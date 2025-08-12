import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { List, Item, ProductStat, ProfileSettings } from './types';
import { uuid } from './uuid';

// Database schema version
const DB_VERSION = 1;
const DB_NAME = 'shopping-list-db';

// Database schema interface
interface ShoppingListDB extends DBSchema {
  lists: {
    key: string;
    value: List;
  };
  items: {
    key: string;
    value: Item;
  };
  productStats: {
    key: string;
    value: ProductStat;
  };
  settings: {
    key: string;
    value: ProfileSettings & { id: string };
  };
}

// Event emitter for database changes
class DatabaseEventEmitter extends EventTarget {
  emit(event: string, data?: unknown) {
    this.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  on(event: string, callback: EventListener) {
    this.addEventListener(event, callback);
  }

  off(event: string, callback: EventListener) {
    this.removeEventListener(event, callback);
  }
}

export const dbEvents = new DatabaseEventEmitter();

// Database instance
let dbInstance: IDBPDatabase<ShoppingListDB> | null = null;

// Offline operations queue
interface OfflineOperation {
  id: string;
  operation: string;
  data: unknown;
  timestamp: Date;
}

let offlineQueue: OfflineOperation[] = [];
const OFFLINE_QUEUE_KEY = 'shopping-list-offline-queue';

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<IDBPDatabase<ShoppingListDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB<ShoppingListDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Lists store
        db.createObjectStore('lists', { keyPath: 'id' });

        // Items store
        db.createObjectStore('items', { keyPath: 'id' });

        // Product stats store
        db.createObjectStore('productStats', { keyPath: 'name' });

        // Settings store
        db.createObjectStore('settings', { keyPath: 'id' });
      },
    });

    // Load offline queue from localStorage
    loadOfflineQueue();
    
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize IndexedDB, falling back to localStorage:', error);
    throw error;
  }
}

/**
 * Get database instance (initialize if needed)
 */
async function getDB(): Promise<IDBPDatabase<ShoppingListDB>> {
  if (!dbInstance) {
    return await initDatabase();
  }
  return dbInstance;
}

// Lists operations
export async function getLists(): Promise<List[]> {
  try {
    const db = await getDB();
    const lists = await db.getAll('lists');
    return lists
      .filter(list => !list.deletedAt)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); // Most recent first
  } catch (error) {
    console.error('Error getting lists:', error);
    return getListsFromLocalStorage();
  }
}

export async function getList(id: string): Promise<List | undefined> {
  try {
    const db = await getDB();
    const list = await db.get('lists', id);
    return list && !list.deletedAt ? list : undefined;
  } catch (error) {
    console.error('Error getting list:', error);
    return getListFromLocalStorage(id);
  }
}

export async function createList(listData: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<List> {
  const list: List = {
    ...listData,
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const db = await getDB();
    await db.put('lists', list);
    dbEvents.emit('lists-changed', { action: 'create', list });
    return list;
  } catch (error) {
    console.error('Error creating list:', error);
    await queueOfflineOperation('createList', list);
    return list;
  }
}

export async function updateList(id: string, updates: Partial<Omit<List, 'id' | 'createdAt'>>): Promise<List | null> {
  try {
    const db = await getDB();
    const existing = await db.get('lists', id);
    if (!existing || existing.deletedAt) return null;

    const updated: List = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put('lists', updated);
    dbEvents.emit('lists-changed', { action: 'update', list: updated });
    return updated;
  } catch (error) {
    console.error('Error updating list:', error);
    await queueOfflineOperation('updateList', { id, updates });
    return null;
  }
}

export async function deleteList(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    const existing = await db.get('lists', id);
    if (!existing) return false;

    // Soft delete
    const deleted: List = {
      ...existing,
      deletedAt: new Date(),
      updatedAt: new Date(),
    };

    await db.put('lists', deleted);
    dbEvents.emit('lists-changed', { action: 'delete', list: deleted });
    return true;
  } catch (error) {
    console.error('Error deleting list:', error);
    await queueOfflineOperation('deleteList', { id });
    return false;
  }
}

// Items operations
export async function getItemsByList(listId: string): Promise<Item[]> {
  try {
    const db = await getDB();
    const allItems = await db.getAll('items');
    return allItems.filter(item => item.listId === listId);
  } catch (error) {
    console.error('Error getting items:', error);
    return getItemsFromLocalStorage(listId);
  }
}

export async function createItem(itemData: Omit<Item, 'id'>): Promise<Item> {
  const item: Item = {
    ...itemData,
    id: uuid(),
  };

  try {
    const db = await getDB();
    await db.put('items', item);
    await updateProductStats(item.name, item.price);
    dbEvents.emit('items-changed', { action: 'create', item });
    return item;
  } catch (error) {
    console.error('Error creating item:', error);
    await queueOfflineOperation('createItem', item);
    return item;
  }
}

export async function updateItem(id: string, updates: Partial<Omit<Item, 'id'>>): Promise<Item | null> {
  try {
    const db = await getDB();
    const existing = await db.get('items', id);
    if (!existing) return null;

    const updated: Item = {
      ...existing,
      ...updates,
    };

    await db.put('items', updated);
    
    // Update product stats if name or price changed
    if (updates.name !== undefined || updates.price !== undefined) {
      await updateProductStats(updated.name, updated.price);
    }
    
    dbEvents.emit('items-changed', { action: 'update', item: updated });
    return updated;
  } catch (error) {
    console.error('Error updating item:', error);
    await queueOfflineOperation('updateItem', { id, updates });
    return null;
  }
}

export async function deleteItem(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    const existing = await db.get('items', id);
    if (!existing) return false;

    await db.delete('items', id);
    dbEvents.emit('items-changed', { action: 'delete', item: existing });
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    await queueOfflineOperation('deleteItem', { id });
    return false;
  }
}

// Product statistics operations
export async function getProductStats(): Promise<ProductStat[]> {
  try {
    const db = await getDB();
    const stats = await db.getAll('productStats');
    return stats.sort((a, b) => b.usedCount - a.usedCount);
  } catch (error) {
    console.error('Error getting product stats:', error);
    return [];
  }
}

export async function updateProductStats(name: string, price: number): Promise<void> {
  try {
    const db = await getDB();
    const existing = await db.get('productStats', name);
    
    const updated: ProductStat = existing 
      ? {
          name,
          usedCount: existing.usedCount + 1,
          totalSpend: existing.totalSpend + price,
        }
      : {
          name,
          usedCount: 1,
          totalSpend: price,
        };

    await db.put('productStats', updated);
  } catch (error) {
    console.error('Error updating product stats:', error);
  }
}

// Settings operations
export async function getSettings(): Promise<ProfileSettings> {
  try {
    const db = await getDB();
    const settings = await db.get('settings', 'profile');
    return settings || {
      theme: 'system',
      currency: 'EUR',
      taxRate: 0,
      hapticsEnabled: true,
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      theme: 'system',
      currency: 'EUR',
      taxRate: 0,
      hapticsEnabled: true,
    };
  }
}

export async function updateSettings(settings: ProfileSettings): Promise<void> {
  try {
    const db = await getDB();
    await db.put('settings', { ...settings, id: 'profile' });
    dbEvents.emit('settings-changed', settings);
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

// Offline queue operations
async function queueOfflineOperation(operation: string, data: unknown): Promise<void> {
  const op: OfflineOperation = {
    id: uuid(),
    operation,
    data,
    timestamp: new Date(),
  };
  
  offlineQueue.push(op);
  saveOfflineQueue();
}

function loadOfflineQueue(): void {
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (stored) {
      offlineQueue = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading offline queue:', error);
    offlineQueue = [];
  }
}

function saveOfflineQueue(): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
  } catch (error) {
    console.error('Error saving offline queue:', error);
  }
}

export async function processOfflineQueue(): Promise<void> {
  if (offlineQueue.length === 0) return;

  const operations = [...offlineQueue];
  offlineQueue = [];
  
  for (const op of operations) {
    try {
      switch (op.operation) {
        case 'createList':
          await createList(op.data as Omit<List, 'id' | 'createdAt' | 'updatedAt'>);
          break;
        case 'updateList': {
          const data = op.data as { id: string; updates: Partial<Omit<List, 'id' | 'createdAt'>> };
          await updateList(data.id, data.updates);
          break;
        }
        case 'deleteList': {
          const data = op.data as { id: string };
          await deleteList(data.id);
          break;
        }
        case 'createItem':
          await createItem(op.data as Omit<Item, 'id'>);
          break;
        case 'updateItem': {
          const data = op.data as { id: string; updates: Partial<Omit<Item, 'id'>> };
          await updateItem(data.id, data.updates);
          break;
        }
        case 'deleteItem': {
          const data = op.data as { id: string };
          await deleteItem(data.id);
          break;
        }
      }
    } catch (error) {
      console.error(`Error processing offline operation ${op.operation}:`, error);
      // Re-queue failed operations
      offlineQueue.push(op);
    }
  }
  
  saveOfflineQueue();
}

// LocalStorage fallback functions
function getListsFromLocalStorage(): List[] {
  try {
    const stored = localStorage.getItem('shopping-lists');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getListFromLocalStorage(id: string): List | undefined {
  const lists = getListsFromLocalStorage();
  return lists.find(list => list.id === id && !list.deletedAt);
}

function getItemsFromLocalStorage(listId: string): Item[] {
  try {
    const stored = localStorage.getItem('shopping-items');
    const items: Item[] = stored ? JSON.parse(stored) : [];
    return items.filter(item => item.listId === listId);
  } catch {
    return [];
  }
}