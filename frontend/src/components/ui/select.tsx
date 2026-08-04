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
        /* Custom chevron via background image */
        'bg-[url(data:image/svg+xml_(ASCII)+version+1.1;charset=(UTF-8),,_IDProdQSVClNuuQ__base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjAgMCAxMiA4IiBmaWxsPSIjOTQ5NGEzIj48L3BvbHlnb24+PC9zdmc+)]',
        'bg-no-repeat bg-right bg-[length:12px_8px] pr-10',
        className
      )}
      {...props}
    />
  )
);
Select.displayName = 'Select';

export { Select };
