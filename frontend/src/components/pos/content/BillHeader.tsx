'use client';

import { cn } from '@/lib/utils';
import { MaterialSymbols } from '@/components/ui/material-symbols';

/**
 * BillHeader — the top section of the Active Bill cart.
 *
 * Matches the Stitch POS design:
 *  - Bill #RX-89412 with "Walk-in Dispensary" badge
 *  - Hold (⏸) and Clear (🗑) buttons
 *
 * Bill number is auto-incremented per terminal session.
 */
export function BillHeader({
  billNumber = 'RX-89412',
  customerType = 'Walk-in Dispensary',
  onHold,
  onClear,
  className,
}: {
  billNumber?: string;
  customerType?: string;
  onHold?: () => void;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-1.5">
        <span className="font-headline-md text-headline-md text-on-surface">
          Bill #{billNumber}
        </span>
        <span className="font-label-caps text-label-caps px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold">
          {customerType}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onHold}
          className={cn(
            'p-1 text-on-surface-variant hover:text-on-surface',
            'hover:bg-surface-container rounded'
          )}
          title="Hold current invoice"
        >
          <MaterialSymbols icon="pause_circle" className="text-base" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'p-1 text-error hover:bg-error-container/40 rounded transition-colors'
          )}
          title="Clear / Discard"
        >
          <MaterialSymbols icon="delete_sweep" className="text-base" />
        </button>
      </div>
    </div>
  );
}
