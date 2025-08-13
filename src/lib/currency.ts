/**
 * Currency formatting utilities using Intl.NumberFormat
 */

const DEFAULT_CURRENCY = 'EUR';

// Cache formatters for performance
const formattersCache = new Map<string, Intl.NumberFormat>();

/**
 * Get a cached number formatter for the given currency
 */
function getFormatter(currency: string = DEFAULT_CURRENCY): Intl.NumberFormat {
  if (!formattersCache.has(currency)) {
    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      formattersCache.set(currency, formatter);
    } catch (error) {
      // Fallback to EUR if currency is not supported
      if (currency !== DEFAULT_CURRENCY) {
        return getFormatter(DEFAULT_CURRENCY);
      }
      throw error;
    }
  }
  return formattersCache.get(currency)!;
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number, 
  currency: string = DEFAULT_CURRENCY
): string {
  if (!isValidNumber(amount)) {
    return getFormatter(currency).format(0);
  }
  
  return getFormatter(currency).format(amount);
}

/**
 * Parse a currency string back to a number
 * Returns 0 if parsing fails
 */
export function parseCurrency(value: string): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }
  
  // Remove currency symbols and non-numeric characters except decimal points and commas
  const cleaned = value.replace(/[^\d.,-]/g, '');
  
  // Handle different decimal separators
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  return isValidNumber(parsed) ? parsed : 0;
}

/**
 * Check if a number is valid (not NaN or Infinity)
 */
export function isValidNumber(value: number): boolean {
  return typeof value === 'number' && 
         !isNaN(value) && 
         isFinite(value);
}

/**
 * Safe addition of currency amounts
 */
export function addCurrency(...amounts: number[]): number {
  const total = amounts.reduce((sum, amount) => {
    return sum + (isValidNumber(amount) ? amount : 0);
  }, 0);
  
  // Round to 2 decimal places to avoid floating point precision issues
  return Math.round(total * 100) / 100;
}

/**
 * Calculate tax amount from subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  if (!isValidNumber(subtotal) || !isValidNumber(taxRate)) {
    return 0;
  }
  
  const tax = subtotal * taxRate;
  return Math.round(tax * 100) / 100;
}