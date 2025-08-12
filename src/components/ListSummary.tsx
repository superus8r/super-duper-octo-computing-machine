import type { Item } from '../lib/types';
import { formatCurrency } from '../lib/currency';

interface ListSummaryProps {
  items: Item[];
  currency: string;
}

export function ListSummary({ items, currency }: ListSummaryProps) {
  const purchasedItems = items.filter(item => item.purchased);
  const unpurchasedItems = items.filter(item => !item.purchased);
  
  const totalItems = items.length;
  const purchasedCount = purchasedItems.length;
  const unpurchasedCount = unpurchasedItems.length;
  
  const totalValue = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const purchasedValue = purchasedItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const unpurchasedValue = unpurchasedItems.reduce((sum, item) => sum + (item.qty * item.price), 0);

  if (totalItems === 0) {
    return null;
  }

  const completionPercentage = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;

  return (
    <div className="list-summary">
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionPercentage}%` }}
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="progress-text">
          {purchasedCount} of {totalItems} items completed ({completionPercentage}%)
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-item">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{totalItems}</div>
        </div>
        
        <div className="stat-item purchased">
          <div className="stat-label">Purchased</div>
          <div className="stat-value">{purchasedCount}</div>
        </div>
        
        <div className="stat-item remaining">
          <div className="stat-label">Remaining</div>
          <div className="stat-value">{unpurchasedCount}</div>
        </div>
      </div>

      {totalValue > 0 && (
        <div className="price-summary">
          <div className="price-row total">
            <span>Total Value</span>
            <span>{formatCurrency(totalValue, currency)}</span>
          </div>
          
          {purchasedValue > 0 && (
            <div className="price-row purchased">
              <span>Purchased</span>
              <span>{formatCurrency(purchasedValue, currency)}</span>
            </div>
          )}
          
          {unpurchasedValue > 0 && (
            <div className="price-row remaining">
              <span>Remaining</span>
              <span>{formatCurrency(unpurchasedValue, currency)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}