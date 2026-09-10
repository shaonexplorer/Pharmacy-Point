'use client';

import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * HotkeyBadge — renders a keyboard shortcut pill (`<kbd>`).
 *
 * Used in the POS toolbar for hotkey hints (e.g. ⌘K, F1, F8) and in the
 * search bar's clear button area.
 */
export function HotkeyBadge({
  keys,
  label,
  className,
  dimmed = false,
}: {
  /** Display text inside the badge, e.g. "⌘K", "F1", "F8" */
  keys: string;
  /** Optional descriptive label shown alongside the badge */
  label?: string;
  dimmed?: boolean;
} & ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {label && (
        <span
          className={cn(
            'font-body-xs text-body-xs',
            dimmed ? 'text-on-surface-variant' : 'text-on-surface'
          )}
        >
          {label}
        </span>
      )}
      <kbd
        className={cn(
          'font-label-numeric-sm text-label-numeric-sm',
          'bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/40',
          dimmed ? 'text-on-surface-variant/60' : 'text-on-surface-variant'
        )}
      >
        {keys}
      </kbd>
    </div>
  );
}
