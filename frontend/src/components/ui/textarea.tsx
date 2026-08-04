import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Textarea Component
 *
 * Design spec (DESIGN.md → Input Fields):
 *  - Border: 1px border (outline-variant)
 *  - Focus state: 2px primary border with subtle outer glow
 *  - Radius: DEFAULT (0.5rem / 8px)
 *
 * Modern shadcn v4 patterns:
 *  - data-slot attribute for styling hooks
 *  - focus-visible:ring-[3px] focus-visible:ring-ring/50
 *  - aria-invalid states
 */

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      data-slot="textarea"
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded border border-input bg-background px-3 py-2 text-sm',
        'transition-all duration-200',
        'placeholder:text-muted-foreground',
        /* Focus: 3px ring on primary color with 50% opacity glow */
        'focus-visible:outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'focus-visible:border-primary',
        /* Error state */
        'aria-invalid:border-error aria-invalid:ring-destructive/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
