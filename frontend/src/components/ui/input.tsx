import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Input Component
 *
 * Design spec (DESIGN.md → Input Fields):
 *  - Border: 1px border (outline-variant / #bcc9c6)
 *  - Focus state: Transition to 2px primary_color border with a subtle outer glow
 *  - Radius: DEFAULT (0.5rem / 8px)
 */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
          'transition-all duration-200',
          'placeholder:text-muted-foreground',
          /* Focus state: 2px primary border with subtle outer glow */
          'focus-visible:outline-none',
          'focus-visible:border-2 focus-visible:border-primary',
          'focus-visible:shadow-[0_0_0_4px_rgba(0,104,95,0.15)]',
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
