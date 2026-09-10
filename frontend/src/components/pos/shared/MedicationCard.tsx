'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { MaterialSymbols } from '@/components/ui/material-symbols';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { StockVial } from './StockVial';
import { type Product } from '@pharmacy-point/types';

/**
 * MedicationCard — a dense medication card matching the Clinical Precision
 * POS terminal design (stitch-screens/07-pos-interface.html).
 *
 * Layout (matches Stitch design):
 *   ┌────────────────────────────────────┐
 *   │  Rx Only / OTC Free  [+ Add]      │
 *   │  Product Name                    │
 *   │  Generic / Form                  │
 *   │  ┌───┐  Shelf A-14   $16.50      │
 *   │  │vial│  48 in stock              │
 *   │  └───┘                             │
 *   └────────────────────────────────────┘
 *
 * The StockVial provides the signature pharmacy stock indicator. Pricing
 * and SKU data use `data-mono` (JetBrains Mono) per DESIGN.md.
 */
export function MedicationCard({
  product,
  onAdd,
  canAddToCart = true,
  className,
}: {
  product: Product;
  onAdd: (product: Product) => void;
  canAddToCart?: boolean;
  className?: string;
}) {
  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= (product.lowStock || 10);
  const isCritical = product.quantity <= Math.floor((product.lowStock || 10) / 2);

  // Determine stock label
  let stockLabel: string;
  let stockColorClass: string;
  if (isOutOfStock) {
    stockLabel = 'Out of Stock';
    stockColorClass = 'text-error';
  } else if (isCritical) {
    stockLabel = `${product.quantity} in stock`;
    stockColorClass = 'text-error';
  } else if (isLowStock) {
    stockLabel = `${product.quantity} in stock`;
    stockColorClass = 'text-warning';
  } else {
    stockLabel = `${product.quantity} in stock`;
    stockColorClass = 'text-primary';
  }

  return (
    <div
      className={cn(
        'bg-surface-container-lowest p-3 rounded-xl shadow-sm hover:shadow-md',
        'transition-shadow flex flex-col gap-2',
        'group relative',
        isOutOfStock && 'opacity-60',
        isCritical && 'border border-error/50',
        className
      )}
    >
      {/* Top row: Rx/OTC badge + Add button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
          <p className="font-body-xs text-body-xs text-on-surface-variant italic truncate">
            {product.genericName || product.brandName || product.description || '—'}
          </p>
        </div>
        {/* Rx Only / OTC Free badge */}
        {product.category &&
        (product.category.toLowerCase().includes('prescription') ||
          product.category.toLowerCase().includes('rx')) ? (
          <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold">
            Rx Only
          </span>
        ) : (
          <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-surface-container-high text-secondary font-semibold">
            OTC Free
          </span>
        )}
      </div>

      {/* Middle: Shelf location + stock indicator */}
      <div className="p-2 bg-surface-container-low rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-1 text-on-surface-variant">
          <Package className="h-3 w-3" />
          <span className="font-label-numeric-sm text-label-numeric-sm font-semibold">
            {product.sku || '—'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <StockVial quantity={product.quantity} lowStock={product.lowStock || 10} size="sm" />
          <span
            className={cn('font-label-numeric-sm text-label-numeric-sm font-bold', stockColorClass)}
          >
            {stockLabel}
          </span>
        </div>
      </div>

      {/* Bottom: price + add button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            Unit Retail
          </span>
          <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
            {formatCurrency(product.price)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={!canAddToCart || isOutOfStock}
          className={cn(
            'h-9 px-2.5 rounded-lg font-button-text text-button-text flex items-center gap-0.5',
            'shadow-sm transition-all active:scale-95',
            isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary hover:bg-primary-container text-on-primary'
          )}
        >
          <MaterialSymbols icon="add" className="text-sm" />
          <span className="text-xs">Add</span>
        </button>
      </div>
    </div>
  );
}
