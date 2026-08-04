import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * Clinical Precision — Checkbox Component
 *
 * Design spec (DESIGN.md → Input Fields):
 *  - Border: 1px border (outline-variant)
 *  - Focus state: 2px primary_color border with a subtle outer glow
 *  - Radius: DEFAULT (0.5rem / 8px)
 *
 * Modern shadcn v4 patterns:
 *  - data-slot attribute for styling hooks
 *  - focus-visible:ring-[3px] focus-visible:ring-ring/50
 *  - 15px border for crispcheckmark alignment
 *  - h-4 w-4 check icon
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-input bg-background',
      'transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
      'focus-visible:border-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=checked]:text-on-primary',
      'data-[state=checked]:border-primary',
      'dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-on-primary',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="flex items-center justify-center text-current"
    >
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
