'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Separator Component
 *
 * Design spec (DESIGN.md → Borders):
 *  - Color: outline (#6d7a77) — subtle separator
 *  - Used as a divider between sections and table rows
 *
 * Modern shadcn v4 patterns:
 *  - data-slot attribute for styling hooks
 *  - CSS variables for border color
 */

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' && 'h-px w-full',
        orientation === 'vertical' && 'h-full w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
