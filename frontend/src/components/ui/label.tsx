import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Label Component
 *
 * Design spec (DESIGN.md → Typography):
 *  - Form labels: body-sm (14px, 500 weight) — slightly bolder than body text
 *    for clear association with their input.
 *  - Table headers and section labels use label-md (12px, 600 weight, uppercase,
 *    0.05em letter-spacing) — see Table and text-label-md utility.
 *
 * Uses Radix UI Label primitive for proper form association.
 */

const Label = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<'label'>>(
  ({ className, ...props }, ref) => (
    <label
      data-slot="label"
      ref={ref}
      className={cn(
        /* body-sm per spec: 14px, 500 weight */
        'text-sm font-medium leading-none',
        'text-foreground',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
