import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Select Component
 *
 * Design spec (DESIGN.md → Input Fields):
 *  - Border: 1px border (outline-variant)
 *  - Focus state: Transition to 2px primary_color border with a subtle outer glow
 *  - Radius: DEFAULT (0.5rem / 8px)
 *  - Height: 40px (h-10) to match Input component
 */

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
          'transition-all duration-200',
          'appearance-none',
          'placeholder:text-muted-foreground',
          /* Focus state: 2px primary border with subtle outer glow */
          'focus-visible:outline-none',
          'focus-visible:border-2 focus-visible:border-primary',
          'focus-visible:shadow-[0_0_0_4px_rgba(0,104,95,0.15)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          /* Custom chevron using pseudo-element */
          'pr-10',
          'bg-transparent',
          '[&::-ms-expand]:hidden',
          ' [&>option]:text-foreground',
          className
        )}
        {...props}
      />
      {/* Custom chevron using CSS pseudo-element */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
        aria-hidden="true"
      >
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  )
);
Select.displayName = 'Select';

export { Select };
