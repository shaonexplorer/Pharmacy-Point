/**
 * Format a date/time into a short human-readable time string (e.g. "10:32 AM").
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date into a compact date string (e.g. "Aug 3").
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a price number as a currency string.
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Predefined product categories for the pharmacy.
 */
export const PRODUCT_CATEGORIES = [
  'Prescription Medications',
  'Over-the-Counter Medications',
  'Health & Beauty',
  'First Aid',
  'Vitamins & Supplements',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
