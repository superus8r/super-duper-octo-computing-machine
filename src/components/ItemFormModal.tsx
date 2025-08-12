import { useState } from 'react';
import { ItemFormSchema, type ItemForm } from '../lib/types';
import { createItem, updateItem } from '../lib/db';
import type { Item } from '../lib/types';

interface ItemFormProps {
  listId: string;
  currency: string;
  editingItem?: Item | null;
  onClose: () => void;
  onSave: () => void;
}

export function ItemFormModal({ listId, currency, editingItem, onClose, onSave }: ItemFormProps) {
  const [form, setForm] = useState<ItemForm>({
    name: editingItem?.name || '',
    qty: editingItem?.qty || 1,
    price: editingItem?.price || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const validatedData = ItemFormSchema.parse(form);
      
      if (editingItem) {
        await updateItem(editingItem.id, validatedData);
      } else {
        await createItem({
          ...validatedData,
          listId,
          purchased: false,
        });
      }
      
      onSave();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as { errors: Array<{ path?: string[]; message: string }> };
        const fieldErrors: Record<string, string> = {};
        zodError.errors.forEach((err) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ItemForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-group">
            <label htmlFor="item-name">Item Name</label>
            <input
              id="item-name"
              type="text"
              value={form.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Enter item name"
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item-qty">Quantity</label>
              <input
                id="item-qty"
                type="number"
                min="1"
                step="1"
                value={form.qty}
                onChange={e => handleInputChange('qty', parseInt(e.target.value) || 1)}
                className={errors.qty ? 'error' : ''}
              />
              {errors.qty && <div className="error-text">{errors.qty}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="item-price">Price ({currency})</label>
              <input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <div className="error-text">{errors.price}</div>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}