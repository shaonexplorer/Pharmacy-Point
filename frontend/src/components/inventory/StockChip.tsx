import { Badge } from '@/components/ui/badge';
import type { InventoryItem } from '@pharmacy-point/types';

/**
 * Resolve a product's stock status using the API-provided `isLowStock` flag.
 *
 * Returns one of: 'out' | 'low' | 'ok'
 * - 'out'  → quantity === 0                       (error red)
 * - 'low'  → isLowStock && quantity > 0            (warning amber)
 * - 'ok'   → otherwise                            (tertiary / Safety Green)
 */
export function getExpiryStatus(expiryDate?: string | null): 'expired' | 'critical' | 'warning' | 'ok' | 'none' {
  if (!expiryDate) return 'none';
  const expiry = new Date(expiryDate);
  const now = new Date();
  if (expiry < now) return 'expired';
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 7) return 'critical';
  if (daysLeft <= 30) return 'warning';
  return 'ok';
}

export function getStockStatus(product: InventoryItem): 'out' | 'low' | 'ok' {
  if (product.quantity === 0) return 'out';
  if (product.isLowStock) return 'low';
  return 'ok';
}

/**
 * Clinical Precision — Stock Level Chip
 *
 * Design spec (DESIGN.md → Status Chips):
 *  - Shape: Full pill-shape (9999px radius) to distinguish from actionable buttons.
 *  - Colors:
 *    • In Stock / Success:   tertiary (#006b2c) — Safety Green
 *    • Low Stock / Warning:  warning variant (amber)
 *    • Out of Stock / Error: error (#ba1a1a)
 *  - Typography: 12px, 500 weight, uppercase, 0.05em letter-spacing.
 */
interface StockChipProps {
  status: 'out' | 'low' | 'ok';
}

interface ExpiryChipProps {
  status: 'expired' | 'critical' | 'warning' | 'ok' | 'none';
}

export function ExpiryChip({ status }: ExpiryChipProps) {
  if (status === 'expired') return <Badge variant="destructive" size="sm">Expired</Badge>;
  if (status === 'critical') return <Badge variant="destructive" size="sm">Expires Soon</Badge>;
  if (status === 'warning') return <Badge variant="warning" size="sm">Expiring</Badge>;
  if (status === 'ok') return <Badge variant="success" size="sm">Fresh</Badge>;
  return null;
}

export function StockChip({ status }: StockChipProps) {
  if (status === 'ok') {
    return (
      <Badge variant="success" size="sm">
        In Stock
      </Badge>
    );
  }
  if (status === 'low') {
    return (
      <Badge variant="warning" size="sm">
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" size="sm">
      Out of Stock
    </Badge>
  );
}
