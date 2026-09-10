'use client';

import { MaterialSymbols } from '@/components/ui/material-symbols';
import { StatusIndicator } from '../shared/StatusIndicator';

/**
 * PosToolbar — the page-level context banner of the Clinical Precision POS
 * terminal, matching the Stitch design (stitch-screens/07-pos-interface.html).
 *
 * Contains:
 *  - Page title with icon + terminal badge
 *  - Descriptive subtitle
 *  - Hotkeys help text (F1, F6, F8, Ctrl+Enter)
 *  - DEA Gateway Active status dot
 *
 * Placed at the top of the main content area, above the split-screen.
 */
export function PosToolbar() {
  return (
    <div className="flex flex-col gap-2 pb-3 mb-3">
      {/* Page title + terminal badge */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary">
          <MaterialSymbols icon="point_of_sale" className="text-base text-on-primary" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-headline-sm text-headline-sm text-on-surface">
              Point of Sale Terminal
            </span>
            <span className="font-label-caps text-label-caps px-1.5 py-0.5 bg-primary/10 text-primary rounded font-semibold">
              Terminal #03 • Dr. Jenkins
            </span>
          </div>
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            Real-time prescription dispensing, stock ledger sync &amp; credit checks
          </span>
        </div>
      </div>

      {/* Hotkeys + DEA Gateway */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded-lg">
          <MaterialSymbols icon="keyboard" className="text-sm text-primary" />
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            Hotkeys:
            <span className="font-label-numeric-sm font-semibold text-on-surface"> F1 </span> Scan |
            <span className="font-label-numeric-sm font-semibold text-on-surface"> F6 </span> Hold |
            <span className="font-label-numeric-sm font-semibold text-on-surface"> F8 </span> Tender |
            <span className="font-label-numeric-sm font-semibold text-on-surface"> Ctrl+Enter </span> Checkout
          </span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-primary/30 text-on-primary-fixed rounded-lg">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-label-caps text-label-caps uppercase">
            DEA Gateway Active
          </span>
        </div>
      </div>
    </div>
  );
}
