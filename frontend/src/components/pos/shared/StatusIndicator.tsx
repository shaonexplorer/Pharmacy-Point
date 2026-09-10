'use client';

import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * StatusIndicator — a colored dot + label pair with optional pulse animation.
 *
 * Used throughout the Clinical Precision POS terminal for:
 *  - "Online • Cloud Synced" status (sidebar footer)
 *  - "Shift Active" indicator (sidebar header)
 *  - "DEA Gateway Active" banner (toolbar)
 *
 * DESIGN.md Status & Clinical Safety Tokens map to the variant prop.
 */
export function StatusIndicator({
  label,
  variant = 'success',
  pulse = false,
  className,
  dotClassName,
  ...props
}: {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'primary' | 'secondary';
  pulse?: boolean;
  dotClassName?: string;
} & ComponentPropsWithoutRef<'div'>) {
  const variantClasses = {
    success: 'bg-tertiary',
    warning: 'bg-warning',
    error: 'bg-error',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
  };

  const labelColors = {
    success: 'text-on-surface',
    warning: 'text-on-surface',
    error: 'text-error',
    primary: 'text-on-surface',
    secondary: 'text-on-surface',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5',
        labelColors[variant],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          variantClasses[variant],
          pulse && 'animate-pulse',
          dotClassName
        )}
        aria-hidden="true"
      />
      <span className="font-body-xs text-body-xs">{label}</span>
    </div>
  );
}
