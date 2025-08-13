import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
        <div className="container py-4">
          <div className="text-center">Loading list...</div>
        </div>
      </>
    );
  }

  if (!list) {
    return (
      <>
        <TopBar title="List Not Found" />
        <div className="container py-4">
          <div className="text-center">
            <p className="text-fg-muted">The requested list could not be found.</p>
          </div>
        </div>
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
      <div className="container">
        {/* List Summary */}
        <ListSummary items={allItems} currency={list.currency} />

        {/* Filter Tabs */}
        {allItems.length > 0 && (
          <div className="filter-tabs" role="tablist">
            <button
              type="button"
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              role="tab"
              aria-selected={filter === 'all'}
            >
              All ({allItems.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'remaining' ? 'active' : ''}`}
              onClick={() => setFilter('remaining')}
              role="tab"
              aria-selected={filter === 'remaining'}
            >
              Remaining ({remainingCount})
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'purchased' ? 'active' : ''}`}
              onClick={() => setFilter('purchased')}
              role="tab"
              aria-selected={filter === 'purchased'}
            >
              Purchased ({purchasedCount})
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="items-section">
          {sortedItems.length > 0 ? (
            <div className="items-list" role="list">
              {sortedItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  currency={list.currency}
                  onEdit={handleEditItem}
                />
              ))}
            </div>
          ) : allItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>No items yet</h3>
              <p>Add items to your shopping list to get started.</p>
              <button 
                type="button" 
                className="btn primary"
                onClick={handleAddItem}
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                {filter === 'purchased' ? '✅' : '📝'}
              </div>
              <h3>
                {filter === 'purchased' ? 'Nothing purchased yet' : 'All items completed!'}
              </h3>
              <p>
                {filter === 'purchased' 
                  ? 'Items you purchase will appear here.' 
                  : 'Great job finishing your shopping list!'}
              </p>
            </div>
          )}
        </div>

        {/* Add Item FAB */}
        <button
          type="button"
          className="fab"
          onClick={handleAddItem}
          aria-label="Add new item"
        >
          +
        </button>
      </div>

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