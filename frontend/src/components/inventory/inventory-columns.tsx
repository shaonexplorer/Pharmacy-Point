import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Plus, Edit, AlertTriangle, ShoppingCart } from 'lucide-react';

import type { InventoryItem, Product } from '@pharmacy-point/types';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import {
  StockChip,
  getStockStatus,
  ExpiryChip,
  getExpiryStatus,
} from '@/components/inventory/StockChip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCellMono } from '@/components/ui/table';
import { formatCurrency } from '@/lib/formatters';

/**
 * Clinical Precision — Inventory Table Columns
 *
 * Design spec (DESIGN.md → Data Tables):
 *  - Headers: label-md (uppercase, 12px, 600 weight, 0.05em tracking)
 *  - Borders: Subtle bottom border only — NO vertical borders allowed.
 *  - Numerical data: data-mono (JetBrains Mono, 14px, 500 weight) for precise alignment.
 *  - Status chips: full pill-shape, tertiary for "In Stock", warning amber for "Low Stock".
 *
 * Columns are split into their own file to keep the table component focused purely
 * on layout and rendering logic (per project convention of separating concerns).
 *
 * NOTE: React hooks (e.g. useProcurementCart) must NOT be called inside TanStack
 * cell render functions — they violate the Rules of Hooks. Instead, callbacks like
 * onAddToCart are passed from the parent page component, following the same pattern
 * as ProductTable's onDelete prop.
 */
interface GetInventoryColumnsProps {
  onAddToCart?: (product: Product, quantity?: number, unitPrice?: number) => void;
}

export function getInventoryColumns({
  onAddToCart,
}: GetInventoryColumnsProps = {}): ColumnDef<InventoryItem>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => <div className="font-medium text-foreground">{row.original.name}</div>,
    },
    // temporarily hiding SKU column until we have a proper SKU system in place

    // {
    //   accessorKey: 'sku',
    //   header: 'SKU',
    //   cell: ({ row }) => (
    //     <TableCellMono>
    //       {row.original.sku || `SKU-${row.original.id.slice(0, 6).toUpperCase()}`}
    //     </TableCellMono>
    //   ),
    // },
    {
      accessorKey: 'batchNo',
      header: 'Batch',
      cell: ({ row }) => <TableCellMono>{row.original.batchNo || '—'}</TableCellMono>,
    },
    // temporarily hiding barcode column until we have a proper barcode system in place
    // {
    //
    //   accessorKey: 'barcode',
    //   header: 'Barcode',
    //   cell: ({ row }) => (
    //     <TableCellMono>{row.original.barcode || '—'}</TableCellMono>
    //   ),
    // },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="capitalize text-on-surface-variant">
          {row.original.category || 'General'}
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Stock Level',
      cell: ({ row }) => {
        const product = row.original;
        const stockStatus = getStockStatus(product);
        // Only count active batches (quantity > 0)
        const batchCount = (product.batches ?? []).filter((b) => (b.quantity ?? 0) > 0).length;

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-foreground">
              {product.quantity} units
            </span>
            <StockChip status={stockStatus} />
            {batchCount > 1 && (
              <Badge variant="outline" size="sm" className="ml-1">
                {batchCount} batches
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry',
      cell: ({ row }) => {
        const product = row.original;
        // Filter out batches with 0 quantity — only consider active batches
        // for expiry status. The batches array is already ordered by
        // expiryDate: 'asc', so the first active batch is the earliest-expiring.
        const activeBatches = (product.batches ?? []).filter((b) => (b.quantity ?? 0) > 0);
        const expiryDate = activeBatches[0]?.expiryDate ?? product.expiryDate;
        const expStatus = getExpiryStatus(expiryDate);
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">
              {expiryDate ? new Date(expiryDate).toLocaleDateString() : '—'}
            </span>
            <ExpiryChip status={expStatus} />
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Unit Price',
      cell: ({ row }) => <TableCellMono>{formatCurrency(row.original.price)}</TableCellMono>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original;
        const stockStatus = getStockStatus(product);
        const isExpired =
          product.expiryDate !== null &&
          product.expiryDate !== undefined &&
          getExpiryStatus(product.expiryDate) === 'expired';
        const outOfStock = product.quantity <= 0;
        // const canAddToCart = !isExpired && !outOfStock && !!onAddToCart;
        const canAddToCart = !isExpired && !!onAddToCart;


        return (
          <div className="flex items-center justify-end gap-1">
            {stockStatus === 'low' && <AlertTriangle className="h-4 w-4 text-warning" />}
            <Button
              type="button"
              variant="ghostIcon"
              size="sm"
              title="Add to Cart"
              onClick={() => onAddToCart?.(product, 1, product.price)}
              disabled={!canAddToCart}
              className={canAddToCart ? 'text-secondary hover:bg-secondary/10' : 'opacity-30'}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <StockAdjustmentModal
              product={product}
              trigger={
                <Button type="button" variant="ghostIcon" size="sm" title="Adjust Stock">
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
            <Button asChild variant="ghostIcon" size="sm" title="Edit">
              <Link href={`/products/${product.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];
}
