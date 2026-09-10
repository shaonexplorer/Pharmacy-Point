'use client';

import { cn } from '@/lib/utils';
import { MaterialSymbols } from '@/components/ui/material-symbols';

/**
 * FefoBanner — the "FEFO Batch Prioritizer Active" status banner.
 *
 * Matches the Stitch POS design: a surface-container-low card with an
 * icon, descriptive text, and a batch selector + override button.
 *
 * FEFO (First-Expired-First-Out) is a pharmacy dispensing rule that
 * automatically binds the oldest unexpired batch to a prescription,
 * reducing waste and ensuring medication safety.
 */
export function FefoBanner({
  batchNumber = 'AX-9912',
  expiryDate = 'Aug 2025 or newer',
  onOverride,
  className,
}: {
  batchNumber?: string;
  expiryDate?: string;
  onOverride?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-surface-container-low p-3 rounded-xl flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
          <MaterialSymbols icon="batch_prediction" className="text-lg" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface">
            FEFO Batch Prioritizer Active
          </span>
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            Dispensary rule automatically binds oldest unexpired batch (Exp: {expiryDate}).
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-label-caps text-label-caps bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded">
          Batch #{batchNumber}
        </span>
        <button
          type="button"
          onClick={onOverride}
          className="text-primary hover:text-primary-container font-button-text text-button-text"
        >
          Override Batch
        </button>
      </div>
    </div>
  );
}
