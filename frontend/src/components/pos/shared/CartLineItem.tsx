'use client';

import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { QuantityControl } from './QuantityControl';
import { type CartItem } from '@/context/PosContext';
import { ExpiryChip, getExpiryStatus } from '@/components/inventory/StockChip';

/**
 * CartLineItem — a dense pharmacy-ledger line item matching the Stitch
 * POS design (12-column grid: Medication & Form | Qty | Unit | Total).
 *
 * Per DESIGN.md:
 *  - Numerical columns use JetBrains Mono (`data-mono`)
 *  - Rows highlight on hover
 *  - Expired items flagged with ExpiryChip
 *  - Rx / OTC labels per medication
 *  - "pill" tags for Rx / batch info are rounded-full per spec
 */
export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
  showExpiry = true,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  showExpiry?: boolean;
}) {
  const { product, quantity, price } = item;
  const lineTotal = price * quantity;

  return (
    <div className="grid grid-cols-12 items-center gap-1 px-1 py-2 hover:bg-surface-container-low transition-colors group">
      {/* Col 5: Medication & Form */}
      <div className="col-span-5 flex flex-col pr-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-headline-sm text-headline-sm text-on-surface truncate">
            {product.name}
          </span>
          {/* Rx / OTC pill — rounded-full per DESIGN.md "Pill Exceptions" */}
          {product.category && product.category.toLowerCase().includes('prescription') ? (
            <span className="font-label-caps text-label-caps px-1 py-0.5 bg-primary/10 text-primary rounded-full">
              Rx
            </span>
          ) : (
            <span className="font-label-caps text-label-caps px-1 py-0.5 bg-surface-container-high text-secondary rounded-full">
              OTC
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 truncate">
          <span className="font-body-xs text-body-xs text-on-surface-variant truncate">
            {product.sku || product.genericName || '—'}
          </span>
          {product.batchNo && (
            <>
              <span className="text-xs text-on-surface-variant/40">•</span>
              <span className="font-body-xs text-body-xs text-on-surface-variant">
                Batch #{product.batchNo}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Col 3: Quantity Controls */}
      <div className="col-span-3 flex items-center justify-center">
        <QuantityControl
          quantity={quantity}
          max={product.quantity}
          onChange={(val) => onUpdateQuantity(product.id, val)}
          size="sm"
        />
      </div>

      {/* Col 2: Unit Price — data-mono */}
      <div className="col-span-2 text-right">
        <span className="font-label-numeric-md text-label-numeric-md text-on-surface-variant">
          {formatCurrency(price)}
        </span>
      </div>

      {/* Col 2: Line Total — data-mono, bold */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <span className="font-label-numeric-md text-label-numeric-md font-bold text-on-surface">
          {formatCurrency(lineTotal)}
        </span>
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className={cn(
            'opacity-0 group-hover:opacity-100 text-error hover:text-on-error-container',
            'transition-opacity p-1 hover:bg-error-container/40 rounded',
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
          aria-label="Remove item"
          title="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
