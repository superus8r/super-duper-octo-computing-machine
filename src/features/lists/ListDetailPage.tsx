import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { TopBar } from '../../components/TopBar';
import { ItemCard } from '../../components/ItemCard';
import { ItemFormModal } from '../../components/ItemFormModal';
import { ListSummary } from '../../components/ListSummary';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { getList, getItemsByList } from '../../lib/db';
import type { Item } from '../../lib/types';

type ViewFilter = 'all' | 'remaining' | 'purchased';

export function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [filter, setFilter] = useState<ViewFilter>('all');
  
  const { data: list, loading: listLoading } = useLiveQuery(
    () => getList(id!), 
    [id], 
    'lists-changed'
  );

  const { data: items, loading: itemsLoading } = useLiveQuery(
    () => getItemsByList(id!), 
    [id], 
    'items-changed'
  );

  const loading = listLoading || itemsLoading;

  if (loading) {
    return (
      <>
        <TopBar title="Loading..." />
        <main className="container-page py-4">
          <div className="text-center">Loading list...</div>
        </main>
      </>
    );
  }

  if (!list) {
    return (
      <>
        <TopBar title="List Not Found" />
        <main className="container-page py-4">
          <div className="text-center">
            <p className="muted">The requested list could not be found.</p>
          </div>
        </main>
      </>
    );
  }

  const allItems = items || [];
  
  // Filter items based on current filter
  const filteredItems = allItems.filter(item => {
    switch (filter) {
      case 'remaining':
        return !item.purchased;
      case 'purchased':
        return item.purchased;
      default:
        return true;
    }
  });

  // Sort items: unpurchased first, then by name
  const sortedItems = filteredItems.sort((a, b) => {
    if (a.purchased !== b.purchased) {
      return a.purchased ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleCloseForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleFormSave = () => {
    // Items will be refreshed automatically via live query
  };

  const remainingCount = allItems.filter(item => !item.purchased).length;
  const purchasedCount = allItems.filter(item => item.purchased).length;

  return (
    <>
      <TopBar title={list.name} />
      <main className="container-page py-4">
        {/* List Summary */}
        <ListSummary items={allItems} currency={list.currency} />

        {/* Filter Tabs with Headless UI */}
        {allItems.length > 0 && (
          <Tab.Group
            selectedIndex={filter === 'all' ? 0 : filter === 'remaining' ? 1 : 2}
            onChange={(idx) => setFilter(idx === 0 ? 'all' : idx === 1 ? 'remaining' : 'purchased')}
          >
            <Tab.List className="sticky top-14 z-30 mb-4 flex gap-2 rounded-xl border border-slate-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
              {[`All (${allItems.length})`, `Remaining (${remainingCount})`, `Purchased (${purchasedCount})`].map((label) => (
                <Tab
                  key={label}
                  className={({ selected }) => `flex-1 rounded-lg px-3 py-2 text-sm font-medium outline-none transition ${selected ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}
                >
                  {label}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                {/* Items List (all) */}
                <div className="space-y-3">
                  {sortedItems.length > 0 ? (
                    sortedItems.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        currency={list.currency}
                        onEdit={handleEditItem}
                      />
                    ))
                  ) : (
                    <div className="card p-6 text-center">
                      <div className="mb-2 text-3xl">🛒</div>
                      <h3 className="mb-1 text-lg font-semibold">No items yet</h3>
                      <p className="muted mb-3">Add items to your shopping list to get started.</p>
                      <button 
                        type="button" 
                        className="btn primary"
                        onClick={handleAddItem}
                      >
                        Add First Item
                      </button>
                    </div>
                  )}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                {/* Items List (remaining) */}
                <div className="space-y-3">
                  {sortedItems.length > 0 ? (
                    sortedItems.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        currency={list.currency}
                        onEdit={handleEditItem}
                      />
                    ))
                  ) : (
                    <div className="card p-6 text-center">
                      <div className="mb-2 text-3xl">✅</div>
                      <h3 className="mb-1 text-lg font-semibold">All items completed!</h3>
                      <p className="muted">Great job finishing your shopping list!</p>
                    </div>
                  )}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                {/* Items List (purchased) */}
                <div className="space-y-3">
                  {sortedItems.length > 0 ? (
                    sortedItems.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        currency={list.currency}
                        onEdit={handleEditItem}
                      />
                    ))
                  ) : (
                    <div className="card p-6 text-center">
                      <div className="mb-2 text-3xl">📝</div>
                      <h3 className="mb-1 text-lg font-semibold">Nothing purchased yet</h3>
                      <p className="muted">Items you purchase will appear here.</p>
                    </div>
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}

        {/* Empty state when no items at all */}
        {allItems.length === 0 && (
          <div className="card p-6 text-center">
            <div className="mb-2 text-3xl">🛒</div>
            <h3 className="mb-1 text-lg font-semibold">No items yet</h3>
            <p className="muted mb-3">Add items to your shopping list to get started.</p>
            <button 
              type="button" 
              className="btn primary"
              onClick={handleAddItem}
            >
              Add First Item
            </button>
          </div>
        )}

        {/* Add Item FAB */}
        {allItems.length > 0 && (
          <button
            type="button"
            className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={handleAddItem}
            aria-label="Add new item"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </main>

      {/* Item Form Modal */}
      {showItemForm && (
        <ItemFormModal
          listId={list.id}
          currency={list.currency}
          editingItem={editingItem}
          onClose={handleCloseForm}
          onSave={handleFormSave}
        />
      )}
    </>
  );
}