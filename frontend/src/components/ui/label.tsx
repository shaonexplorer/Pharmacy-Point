import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Label Component
 *
 * Design spec (DESIGN.md → Typography):
 *  - Labels: Uppercase with increased letter-spacing (0.05em) to differentiate
 *    from actionable body text. Uses label-md (12px, 600 weight, 16px line-height).
 *  - However, form labels typically use a less aggressive treatment —
 *    body-sm (14px, 500 weight) is used for standard form labels,
 *    with the uppercase label-md treatment reserved for table headers and section labels.
 */

const Label = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<'label'>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none text-foreground',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
