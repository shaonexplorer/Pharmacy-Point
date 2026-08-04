import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Plus, Edit, AlertTriangle } from 'lucide-react';

import type { InventoryItem } from '@pharmacy-point/types';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { StockChip, getStockStatus } from '@/components/inventory/StockChip';
import { Button } from '@/components/ui/button';
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
 */
export function getInventoryColumns(): ColumnDef<InventoryItem>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => <div className="font-medium text-foreground">{row.original.name}</div>,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <TableCellMono>
          {row.original.sku || `SKU-${row.original.id.slice(0, 6).toUpperCase()}`}
        </TableCellMono>
      ),
    },
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

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-foreground">
              {product.quantity} units
            </span>
            <StockChip status={stockStatus} />
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

        return (
          <div className="flex items-center justify-end gap-1">
            {stockStatus === 'low' && <AlertTriangle className="h-4 w-4 text-warning" />}
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
