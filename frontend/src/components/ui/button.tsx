import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Button Component
 *
 * Design spec (DESIGN.md):
 *  - Base radius: 0.5rem (8px) — DEFAULT on the shape scale
 *  - POS / large actions: 1rem (16px) — rounded-lg
 *  - Full pill: 9999px — for status chips (via Badge)
 *  - Primary: Pharma Teal (#00685f)
 *  - Secondary: Medi-Blue (#006398)
 *  - Tertiary/Success: Safety Green (#006b2c)
 *
 * Focus state: 2px ring in primary color with subtle glow.
 * Hover state: subtle shadow increase.
 * Touch targets (tablet/POS): minimum 48px height.
 */

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'text-sm font-medium transition-all duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'active:scale-[0.98]',
    'motion-safe:active:scale-100',
    'select-none',
    'appearance-none',
    /* Base radius per spec: 0.5rem (8px) */
    'rounded-lg'
  ),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-on-primary',
        destructive:
          'bg-destructive text-on-error',
        outline:
          'border border-outline bg-transparent',
        secondary:
          'bg-secondary text-on-secondary',
        tertiary:
          'bg-tertiary text-on-tertiary',
        ghost: 'bg-transparent',
        link: 'bg-transparent underline-offset-4 hover:underline text-primary',
        /* POS-specific — secondary outline style */
        posSecondary:
          'border border-secondary text-secondary',
        /* Inventory — warning variant */
        warning:
          'bg-warning text-on-secondary',
        /* Ghost with icon only — compact */
        ghostIcon: 'p-1.5 rounded-md',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 py-3',
        xl: 'h-12 rounded-xl px-8 py-3 text-lg', /* POS large-format buttons */
        icon: 'h-10 w-10 p-0',
        /* Compact for tight layouts */
        compact: 'h-8 px-3 text-xs',
        /* Tablet/POS — 48px minimum touch target per spec */
        tablet: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    /* Hover shadow per spec — subtle increase on primary/secondary */
    const hoverShadow =
      variant === 'default' || variant === 'secondary' || variant === 'tertiary'
        ? 'hover:shadow-md'
        : variant === 'outline' || variant === 'ghostIcon'
          ? 'hover:bg-accent'
          : '';

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          hoverShadow,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
