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
