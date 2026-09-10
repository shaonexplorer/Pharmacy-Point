'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ClinicalAlert — an inline clinical-safety warning card with a left accent
 * bar, matching the Stitch POS design.
 *
 * Per DESIGN.md "Clinical Alert Cards":
 *  - Drug-Drug Interaction (DDI) alerts feature a left vertical accent bar
 *    (4px solid #ef4444 / #f59e0b)
 *  - Background: solid white (#ffffff) with a faint wash
 *
 * Variants:
 *  - `error` (critical): red accent — drug interactions, contraindications
 *  - `warning` (caution): amber accent — expiring medication, partial fills
 */
export function ClinicalAlert({
  title,
  message,
  variant = 'error',
  className,
}: {
  title: string;
  message: string;
  variant?: 'error' | 'warning';
  className?: string;
}) {
  const isError = variant === 'error';

  return (
    <div
      className={cn(
        'p-3 rounded-lg flex items-center gap-2.5',
        isError
          ? 'bg-error-container/30 text-on-error-container'
          : 'bg-warning-container/30 text-on-warning-container',
        className
      )}
    >
      {/* Left vertical accent bar — 4px solid per DESIGN.md */}
      <div
        className={cn(
          'shrink-0 w-1 rounded-full',
          isError ? 'bg-error' : 'bg-warning'
        )}
        aria-hidden="true"
      />
      <AlertTriangle
        className={cn(
          'h-4 w-4 shrink-0',
          isError ? 'text-error' : 'text-warning'
        )}
      />
      <div className="flex-1">
        <p
          className={cn(
            'font-body-xs text-body-xs font-semibold',
            isError ? 'text-error' : 'text-warning'
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'font-body-xs text-body-xs mt-0.5',
            isError ? 'text-on-error-container' : 'text-on-warning-container'
          )}
        >
          {message}
        </p>
      </div>
      {/* Risk-tier label pill */}
      <span
        className={cn(
          'font-label-caps text-label-caps px-1.5 py-0.5 rounded',
          isError
            ? 'bg-on-error-container text-error-container'
            : 'bg-on-warning-container text-warning-container'
        )}
      >
        {isError ? 'Critical' : 'Caution'}
      </span>
    </div>
  );
}
