'use client';

import { MaterialSymbols } from '@/components/ui/material-symbols';
import { cn } from '@/lib/utils';

/**
 * DueAccountBanner — displays a customer's outstanding credit due amount
 * in the POS bill area, per the Stitch POS design.
 *
 * Matches the Stitch HTML:
 *  - Person icon + customer name
 *  - "ID: #C-4091 • Credit Due: $45.00" (with error color for the amount)
 *  - unfold_more icon for dropdown
 *
 * If no customer or no due amount, renders nothing.
 */
export function DueAccountBanner({
  customerName,
  customerId,
  dueAmount,
  onManageClick,
  className,
}: {
  customerName?: string | null;
  customerId?: string | null;
  dueAmount?: number;
  onManageClick?: () => void;
  className?: string;
}) {
  if (!customerName || !dueAmount || dueAmount <= 0) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between p-2 bg-surface-container-lowest rounded-lg shadow-inner',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <MaterialSymbols icon="person" className="text-primary text-base" />
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface">
            {customerName}
          </span>
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            ID: #{customerId?.slice(-4) ?? '—'} • Credit Due:
            <span className="font-label-numeric-sm text-label-numeric-sm text-error font-semibold">
              {' '}
              ${dueAmount.toFixed(2)}
            </span>
          </span>
        </div>
      </div>
      <MaterialSymbols
        icon="unfold_more"
        className="text-outline text-base cursor-pointer hover:text-on-surface"
        onClick={onManageClick}
      />
    </div>
  );
}
