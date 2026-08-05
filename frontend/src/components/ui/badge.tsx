import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Badge / Status Chip Component
 *
 * Design spec (DESIGN.md → Status Chips):
 *  - Shape: Full pill-shape (9999px radius) to distinguish from actionable buttons.
 *  - Background: Low-saturation background with high-saturation text of the same hue.
 *  - Colors:
 *    • In Stock / Success:   tertiary (#006b2c)
 *    • Low Stock / Warning:  warning variant (amber)
 *    • Out of Stock / Error: error (#ba1a1a)
 *    • Pending / Processing: primary (#00685f)
 *    • Default:              primary (#00685f)
 *  - Typography: 12px, 500 weight, uppercase, 0.05em letter-spacing.
 *
 * Modern shadcn v4 patterns:
 *  - data-slot attribute for styling hooks
 *  - Container-level background colors using design system container tokens
 *  - Focus-visible ring support
 */

const badgeVariants = cva(
  cn(
    'inline-flex items-center justify-center',
    'rounded-full border border-transparent',
    /* Status chip typography: 12px, 500 weight, uppercase, 0.05em tracking */
    'text-xs font-medium uppercase tracking-[0.05em]',
    'whitespace-nowrap select-none',
    /* Accessibility */
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2'
  ),
  {
    variants: {
      variant: {
        /* Default — Primary (Pharma Teal) */
        default: 'bg-primary/10 text-primary',

        /* In Stock / Success — Safety Green (low-sat bg, high-sat text) */
        success: 'bg-tertiary/10 text-tertiary',

        /* Low Stock / Warning — Amber */
        warning: 'bg-warning-container/20 text-warning',

        /* Out of Stock / Error — Error red */
        destructive: 'bg-red-500/30 text-red-500',

        /* Pending / Processing — Secondary (Medi-Blue) */
        secondary: 'bg-secondary/10 text-secondary',

        /* Pending / Processing — Primary (Pharma Teal) */
        pending: 'bg-primary/10 text-primary',

        /* Outline — subtle */
        outline: 'border border-outline text-foreground bg-transparent',

        /* Low saturation neutral */
        muted: 'bg-muted text-muted-foreground',
      },
      size: {
        default: 'px-2.5 py-1',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type BadgeProps = React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof badgeVariants>;

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        data-slot="badge"
        data-variant={variant}
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
