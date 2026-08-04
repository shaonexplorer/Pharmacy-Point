import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Input Component
 *
 * Design spec (DESIGN.md → Input Fields):
 *  - Border: 1px border (outline-variant / #bcc9c6)
 *  - Focus state: Transition to 2px primary_color border with a subtle outer glow
 *  - Radius: DEFAULT (0.5rem / 8px) — NOT rounded-lg
 *
 * Modern shadcn v4 patterns:
 *  - data-slot attribute for styling hooks
 *  - focus-visible:ring-[3px] focus-visible:ring-ring/50
 *  - aria-invalid states
 */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        data-slot="input"
        type={type}
        className={cn(
          'flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm',
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
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
