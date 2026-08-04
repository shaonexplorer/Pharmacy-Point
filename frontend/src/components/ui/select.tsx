import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Select Component
 *
 * Design spec (DESIGN.md → Input Fields):
 *  - Border: 1px border (outline-variant / #bcc9c6)
 *  - Focus state: Transition to 2px primary_color border with a subtle outer glow
 *  - Radius: DEFAULT (0.5rem / 8px) — NOT rounded-lg
 *  - Height: 40px (h-10) to match Input component
 *
 * Note: This is a custom native-select wrapper (not Radix UI Select) since
 * @radix-ui/react-select is not installed. The styling follows the
 * Clinical Precision input field specification.
 *
 * Modern shadcn v4 patterns:
 *  - data-slot attribute for styling hooks
 *  - focus-visible:ring-[3px] focus-visible:ring-ring/50
 *  - aria-invalid states
 */

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full">
      <select
        data-slot="select"
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm',
          'transition-all duration-200',
          'appearance-none',
          'placeholder:text-muted-foreground',
          /* Focus: 3px ring on primary color with 50% opacity glow */
          'focus-visible:outline-none',
          'focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'focus-visible:border-primary',
          /* Error state */
          'aria-invalid:border-error aria-invalid:ring-destructive/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          /* Custom chevron area — space for the icon */
          'pr-10',
          'bg-transparent',
          '[&::-ms-expand]:hidden',
          className
        )}
        {...props}
      />
      {/* Custom chevron */}
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
);
Select.displayName = 'Select';

export { Select };
