import { useState } from 'react';
import type { Item } from '../lib/types';
import { formatCurrency } from '../lib/currency';
import { updateItem, deleteItem } from '../lib/db';

interface ItemCardProps {
  item: Item;
  currency: string;
  onEdit: (item: Item) => void;
}

export function ItemCard({ item, currency, onEdit }: ItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTogglePurchased = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const newPurchased = !item.purchased;
      await updateItem(item.id, { 
        purchased: newPurchased,
        purchasedAt: newPurchased ? new Date() : undefined
      });
    } catch (error) {
      console.error('Error toggling item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isUpdating) return;
    
    if (confirm('Delete this item?')) {
      setIsUpdating(true);
      try {
        await deleteItem(item.id);
      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const totalPrice = item.qty * item.price;

  return (
    <div 
      className={`item-card ${item.purchased ? 'purchased' : ''} ${isUpdating ? 'updating' : ''}`}
      role="listitem"
    >
      <div className="item-content">
        <div className="item-checkbox-section">
          <button
            type="button"
            className="item-checkbox"
            onClick={handleTogglePurchased}
            disabled={isUpdating}
            aria-label={item.purchased ? 'Mark as not purchased' : 'Mark as purchased'}
          >
            {item.purchased && <span className="checkmark">✓</span>}
          </button>
        </div>
        
        <div className="item-details" onClick={() => onEdit(item)}>
          <div className="item-name-section">
            <div className="item-name">{item.name}</div>
            {item.category && (
              <span className="item-category">{item.category}</span>
            )}
          </div>
          <div className="item-meta">
            {item.qty > 1 && <span className="item-qty">{item.qty}x</span>}
            {item.price > 0 && (
              <span className="item-price">
                {formatCurrency(totalPrice, currency)}
              </span>
            )}
          </div>
          {item.notes && (
            <div className="item-notes">{item.notes}</div>
          )}
        </div>

        <div className="item-actions">
          <button
            type="button"
            className="item-action edit"
            onClick={() => onEdit(item)}
            disabled={isUpdating}
            aria-label="Edit item"
          >
            ✏️
          </button>
          <button
            type="button"
            className="item-action delete"
            onClick={handleDelete}
            disabled={isUpdating}
            aria-label="Delete item"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}