'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, ClipboardList, ExternalLink } from 'lucide-react';
import { formatCurrency, formatTime } from '@/lib/formatters';

export type DispensingStatus = 'dispensed' | 'pending' | 'dea-logged' | 'returned';

export interface DispensingItem {
  id: string;
  rxNumber: string;
  medication: string;
  patient: string;
  patientId?: string;
  cashier: string;
  role: string;
  total: number;
  tender: string;
  timestamp: string;
  status: DispensingStatus;
  isControlledSubstance?: boolean;
}

export interface DispensingLedgerProps {
  /** Transaction items */
  items: DispensingItem[];
  /** Currently selected status filter */
  activeFilter: string;
  /** Available filter options */
  filters: string[];
  /** Callback when filter is changed */
  onFilterChange: (filter: string) => void;
  /** Footer text (e.g. "Showing latest 4 transactions in session") */
  footerText?: string;
  /** Footer action label */
  footerAction?: string;
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Optional className */
  className?: string;
}

const statusConfig: Record<DispensingStatus, {
  label: string;
  badgeVariant: 'success' | 'warning' | 'secondary' | 'destructive' | 'default' | 'outline';
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  dispensed: {
    label: 'Dispensed',
    badgeVariant: 'success',
    color: 'text-tertiary bg-tertiary/10',
    icon: () => null,
  },
  pending: {
    label: 'Pending',
    badgeVariant: 'warning',
    color: 'text-warning bg-warning/10',
    icon: () => null,
  },
  'dea-logged': {
    label: 'DEA Logged',
    badgeVariant: 'outline',
    color: 'text-primary bg-primary/10',
    icon: () => null,
  },
  returned: {
    label: 'Returned',
    badgeVariant: 'destructive',
    color: 'text-error bg-error/10',
    icon: () => null,
  },
};

/**
 * Dispensing Ledger & Audit Feed — a high-density tabular feed of
 * recent transactions (prescriptions and POS sales).
 *
 * DESIGN.md → Data Grids & Prescription Lists:
 *  - Headers: label-caps, uppercase, surface-container-low background
 *  - Rows: clean white cards with 1px dividers, hover highlight
 *  - Numerical columns align right with label-numeric
 *
 * Stitch screen:
 *  - Columns: Rx#/Token, Medication/Patient, Cashier/RPh, Total, Tender, Timestamp, Status
 *  - Status badges with colored dots
 *  - Footer with count + "View Complete Day Book" link
 */
export function DispensingLedger({
  items,
  activeFilter,
  filters,
  onFilterChange,
  footerText,
  footerAction,
  isLoading,
  className,
}: DispensingLedgerProps) {
  if (isLoading) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardHeader>
          <CardTitle className="text-headline-md">Dispensing Ledger &amp; Audit Feed</CardTitle>
          <CardDescription className="text-body-md text-on-surface-variant">
            Latest inventory transactions and orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardHeader>
          <CardTitle className="text-headline-md">Dispensing Ledger &amp; Audit Feed</CardTitle>
          <CardDescription className="text-body-md text-on-surface-variant">
            Latest inventory transactions and orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <div className="space-y-2 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground/50 mx-auto" />
            <p className="text-body-md text-on-surface-variant">
              No recent activity recorded yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border-border bg-surface-container-lowest shadow-[var(--shadow-card)]',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-headline-md text-on-surface">
              Dispensing Ledger &amp; Audit Feed
            </CardTitle>
            <CardDescription className="text-body-xs text-on-surface-variant mt-1">
              Counter A &amp; B Stream
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body-xs text-body-xs text-on-surface-variant">
              Sync: 2s ago
            </span>
            <button
              type="button"
              className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h5m12-5v5h-5M4 12h16M4 19h5m12 0v-5h-5"
                />
              </svg>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="py-2 px-4 text-left">Rx # / Token</th>
                <th className="py-2 px-4 text-left">Medication / Patient</th>
                <th className="py-2 px-4 text-left">Cashier / RPh</th>
                <th className="py-2 px-4 text-right">Total</th>
                <th className="py-2 px-4 text-center">Tender</th>
                <th className="py-2 px-4 text-right">Timestamp</th>
                <th className="py-2 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm">
              {items.map((item) => {
                const cfg = statusConfig[item.status];
                const isCritical = item.isControlledSubstance;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-2 px-4 font-label-numeric-sm text-label-numeric-sm font-semibold text-primary">
                      {item.rxNumber}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col">
                        <span
                          className={cn(
                            'text-on-surface font-semibold truncate max-w-xs',
                            isCritical && 'text-error'
                          )}
                        >
                          {item.medication}
                        </span>
                        {item.patient && (
                          <span className="font-body-xs text-body-xs text-on-surface-variant">
                            {item.isControlledSubstance
                              ? `Verified DEA #BK9281 • Dr. Klein`
                              : `Patient: ${item.patient}${item.patientId ? ` • MRN #${item.patientId}` : ''}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <span className="font-label-caps text-label-caps bg-surface-container px-2 py-1 rounded font-bold text-on-surface">
                        {item.cashier}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right font-label-numeric-md text-label-numeric-md text-on-surface font-bold">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={cn(
                          'font-label-caps text-label-caps px-2 py-1 rounded',
                          cfg.color
                        )}
                      >
                        {item.tender}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
                      {formatTime(item.timestamp)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-label-caps text-label-caps rounded px-2 py-1',
                          cfg.color
                        )}
                      >
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      {footerText && (
        <div className="pt-3 flex items-center justify-between border-t border-outline-variant/20 px-5">
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            {footerText}
          </span>
          {footerAction && (
            <button
              type="button"
              className="font-button-text text-button-text text-primary hover:text-primary-container flex items-center gap-1"
            >
              {footerAction}
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
