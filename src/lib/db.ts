import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { List, Item, ProductStat, ProfileSettings, Budget, ShoppingAnalytics } from './types';
import { uuid } from './uuid';

// Database schema version
const DB_VERSION = 2;
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
  budgets: {
    key: string;
    value: Budget;
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
      upgrade(db, oldVersion, newVersion) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
        
        // Version 1 - Initial schema
        if (oldVersion < 1) {
          // Lists store
          db.createObjectStore('lists', { keyPath: 'id' });

          // Items store
          db.createObjectStore('items', { keyPath: 'id' });

          // Product stats store
          db.createObjectStore('productStats', { keyPath: 'name' });

          // Settings store
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        
        // Version 2 - Add budgets and enhanced analytics
        if (oldVersion < 2) {
          // Budgets store
          db.createObjectStore('budgets', { keyPath: 'id' });
          
          console.log('Database upgraded to version 2');
        }
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
    await updateProductStats(item.name, item.price, item.category);
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
      await updateProductStats(updated.name, updated.price, updated.category);
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

export async function updateProductStats(name: string, price: number, category?: string): Promise<void> {
  try {
    const db = await getDB();
    const existing = await db.get('productStats', name);
    
    const newUsedCount = existing ? existing.usedCount + 1 : 1;
    const newTotalSpend = existing ? existing.totalSpend + price : price;
    
    const updated: ProductStat = {
      name,
      usedCount: newUsedCount,
      totalSpend: newTotalSpend,
      lastUsed: new Date(),
      averagePrice: newTotalSpend / newUsedCount,
      category: category || existing?.category,
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

// Budget operations
export async function getBudgets(): Promise<Budget[]> {
  try {
    const db = await getDB();
    const budgets = await db.getAll('budgets');
    return budgets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error getting budgets:', error);
    return [];
  }
}

export async function createBudget(budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
  const budget: Budget = {
    ...budgetData,
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const db = await getDB();
    await db.put('budgets', budget);
    dbEvents.emit('budgets-changed', { action: 'create', budget });
    return budget;
  } catch (error) {
    console.error('Error creating budget:', error);
    await queueOfflineOperation('createBudget', budget);
    return budget;
  }
}

export async function updateBudget(id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>): Promise<Budget | null> {
  try {
    const db = await getDB();
    const existing = await db.get('budgets', id);
    if (!existing) return null;

    const updated: Budget = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put('budgets', updated);
    dbEvents.emit('budgets-changed', { action: 'update', budget: updated });
    return updated;
  } catch (error) {
    console.error('Error updating budget:', error);
    await queueOfflineOperation('updateBudget', { id, updates });
    return null;
  }
}

export async function deleteBudget(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    const existing = await db.get('budgets', id);
    if (!existing) return false;

    await db.delete('budgets', id);
    dbEvents.emit('budgets-changed', { action: 'delete', budget: existing });
    return true;
  } catch (error) {
    console.error('Error deleting budget:', error);
    await queueOfflineOperation('deleteBudget', { id });
    return false;
  }
}

// Analytics operations
export async function getShoppingAnalytics(): Promise<ShoppingAnalytics> {
  try {
    const [lists, allItems, productStats] = await Promise.all([
      getLists(),
      getAllItems(),
      getProductStats()
    ]);

    const purchasedItems = allItems.filter(item => item.purchased);
    
    // Calculate basic stats
    const totalSpent = purchasedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalItems = purchasedItems.length;
    const totalLists = lists.length;
    const averageListValue = totalLists > 0 ? totalSpent / totalLists : 0;

    // Calculate top categories
    const categoryStats = new Map<string, { count: number; totalSpent: number }>();
    purchasedItems.forEach(item => {
      const category = item.category || 'Other';
      const current = categoryStats.get(category) || { count: 0, totalSpent: 0 };
      categoryStats.set(category, {
        count: current.count + item.qty,
        totalSpent: current.totalSpent + (item.price * item.qty)
      });
    });

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Calculate monthly spending
    const monthlySpending = calculateMonthlySpending(purchasedItems);

    // Get frequent items (top 10)
    const frequentItems = productStats
      .sort((a, b) => b.usedCount - a.usedCount)
      .slice(0, 10)
      .map(stat => ({
        name: stat.name,
        count: stat.usedCount,
        totalSpent: stat.totalSpend
      }));

    return {
      totalSpent,
      totalItems,
      totalLists,
      averageListValue,
      topCategories,
      monthlySpending,
      frequentItems,
    };
  } catch (error) {
    console.error('Error getting shopping analytics:', error);
    return {
      totalSpent: 0,
      totalItems: 0,
      totalLists: 0,
      averageListValue: 0,
      topCategories: [],
      monthlySpending: [],
      frequentItems: [],
    };
  }
}

// Helper function to get all items across all lists
async function getAllItems(): Promise<Item[]> {
  try {
    const db = await getDB();
    return await db.getAll('items');
  } catch (error) {
    console.error('Error getting all items:', error);
    return [];
  }
}

// Calculate monthly spending from purchased items
function calculateMonthlySpending(purchasedItems: Item[]): Array<{ month: string; amount: number }> {
  const monthlyTotals = new Map<string, number>();
  
  purchasedItems.forEach(item => {
    const date = item.purchasedAt || item.createdAt || new Date();
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = item.price * item.qty;
    
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + amount);
  });
  
  // Get last 12 months
  const result: Array<{ month: string; amount: number }> = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    result.push({
      month: monthName,
      amount: monthlyTotals.get(monthKey) || 0
    });
  }
  
  return result;
}