import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Textarea Component
 *
 * Design spec (DESIGN.md → Input Fields):
 *  - Border: 1px border (outline-variant)
 *  - Focus state: 2px primary_color border with subtle outer glow
 *  - Radius: DEFAULT (0.5rem / 8px)
 */

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
        'transition-all duration-200',
        'placeholder:text-muted-foreground',
        /* Focus state: 2px primary border with subtle outer glow */
        'focus-visible:outline-none',
        'focus-visible:border-2 focus-visible:border-primary',
        'focus-visible:shadow-[0_0_0_4px_rgba(0,104,95,0.15)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
