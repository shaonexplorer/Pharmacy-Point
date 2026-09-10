'use client';

import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

export interface ShiftTelemetryStripProps {
  /** Pharmacy license number */
  license: string;
  /** Staff/pharmacist name */
  staffName: string;
  /** Staff role/title */
  staffRole: string;
  /** DEA compliance status */
  deaStatus?: 'compliant' | 'pending' | 'expired';
  /** Shift start time */
  shiftStart?: string;
  /** Online/sync status */
  onlineStatus?: 'online' | 'offline' | 'syncing';
  /** Optional className */
  className?: string;
}

/**
 * Shift Telemetry Strip — a compact status bar that shows pharmacy
 * licensing, DEA compliance status, shift info, and sync state.
 *
 * DESIGN.md → Layout: Evokes the sterile, structured feel of a
 * dispensary counter's status panel.
 *
 * Stitch screen:
 *  - "Executive Dispensary Hub" header with shift pulse dot
 *  - License number badge
 *  - DEA Synced • Compliant badge with verified icon
 *  - Live Ledger date
 *  - Sync status + version
 */
export function ShiftTelemetryStrip({
  license = 'PH-NY-90214-R',
  staffName = 'Pharmacy Staff',
  staffRole = '',
  deaStatus = 'compliant',
  shiftStart,
  onlineStatus = 'online',
  className,
}: ShiftTelemetryStripProps) {
  const deaConfig = {
    compliant: { text: 'DEA Synced • Compliant', dot: 'bg-tertiary' },
    pending: { text: 'DEA Pending Review', dot: 'bg-warning' },
    expired: { text: 'DEA Expired', dot: 'bg-error' },
  }[deaStatus];

  const onlineConfig = {
    online: { dot: 'bg-tertiary', text: 'Online' },
    offline: { dot: 'bg-error', text: 'Offline' },
    syncing: { dot: 'bg-warning animate-pulse', text: 'Syncing' },
  }[onlineStatus];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2',
        'bg-surface-container-lowest px-4 py-2 rounded-xl shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Shift indicator + license */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-headline-sm text-headline-sm text-on-surface">
            Executive Dispensary Hub
          </span>
        </div>

        <span className="text-outline-variant">•</span>

        <span className="font-body-xs text-body-xs text-on-surface-variant">
          Licence: {license}
        </span>

        <span className="text-outline-variant">•</span>

        {/* DEA compliance badge */}
        <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-lg">
          <ShieldCheck className="h-3 w-3 text-primary" />
          <span className="font-label-caps text-label-caps text-on-surface uppercase">
            {deaConfig.text}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live ledger date */}
        <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg">
          <CalendarDays className="h-3 w-3 text-on-surface-variant" />
          <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface">
            Live Ledger ({shiftStart ?? 'Mon, Oct 28'})
          </span>
        </div>

        {/* Sync status */}
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <div className="flex items-center gap-1">
            <span className={cn('w-2 h-2 rounded-full', onlineConfig.dot)} />
            <span className="font-body-xs text-body-xs">
              {staffName} • {staffRole}
            </span>
          </div>
          <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
            v2.4.1
          </span>
        </div>
      </div>
    </div>
  );
}

// Inline icon to avoid extra import
function CalendarDays({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <line x1={16} y1={2} x2={16} y2={6} />
      <line x1={8} y1={2} x2={8} y2={6} />
      <line x1={3} y1={10} x2={21} y2={10} />
    </svg>
  );
}
