'use client';

import { cn } from '@/lib/utils';

interface TearLineProps {
  /** Optional label displayed as a "tag" on the tear line */
  label?: string;
  /** Additional classes for the container */
  className?: string;
}

/**
 * Prescription tear-line divider — a dotted border that evokes the
 * perforated edge of a prescription label. Used to visually separate
 * major sections of the dashboard with a subtle pharmacy-relevant motif.
 *
 * The label (when provided) sits in a pill-shaped "tag" that sits above
 * the dashed line, using the Clinical Precision surface-container-lowest
 * background to create a cut-out effect.
 */
export function TearLine({ label, className }: TearLineProps) {
  return (
    <div className={cn('relative my-6 flex items-center', className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="border-t border-dashed border-border w-full" />
      </div>
      {label && (
        <div className="relative mx-auto px-3 py-1 text-label-md text-on-surface-variant bg-card">
          {label}
        </div>
      )}
    </div>
  );
}
