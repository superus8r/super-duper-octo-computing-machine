import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/TopBar';
import { createList, createItem } from '../../lib/db';
import { CreateListFormSchema } from '../../lib/types';
import type { CreateListForm } from '../../lib/types';

export function NewListPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateListForm>({
    name: '',
    currency: 'EUR',
    initialItems: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setErrors({});
      
      const validatedData = CreateListFormSchema.parse(form);
      const newList = await createList({
        name: validatedData.name,
        currency: validatedData.currency,
      });
      
      // Process initial items if provided
      if (validatedData.initialItems && validatedData.initialItems.trim()) {
        const items = validatedData.initialItems
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        // Create items in parallel
        await Promise.all(
          items.map(itemName => 
            createItem({
              listId: newList.id,
              name: itemName,
              qty: 1,
              price: 0,
              purchased: false,
            })
          )
        );
      }
      
      navigate(`/list/${newList.id}`);
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

  return (
    <>
      <TopBar title="Create New List" />
      <div className="container py-4">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              List Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Weekly Groceries"
              className={`w-full ${errors.name ? 'border-danger' : ''}`}
              required
            />
            {errors.name && (
              <p className="text-danger text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label htmlFor="initialItems" className="block text-sm font-medium mb-1">
              Initial Items <span className="text-fg-muted">(optional)</span>
            </label>
            <textarea
              id="initialItems"
              value={form.initialItems}
              onChange={(e) => setForm(prev => ({ ...prev, initialItems: e.target.value }))}
              placeholder="Milk, Bread, Eggs (comma-separated)"
              className="w-full"
              rows={3}
            />
            <p className="text-xs text-fg-muted mt-1">
              Separate items with commas. You can add more details later.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.name.trim()}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}