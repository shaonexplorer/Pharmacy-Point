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
 * Focus state: 2px ring in primary color with subtle glow per spec.
 * Hover state: subtle shadow increase (surface lift).
 * Touch targets (tablet/POS): minimum 48px height.
 *
 * Modern shadcn v4 patterns applied:
 *  - data-slot attributes for styling hooks
 *  - focus-visible:ring-[3px] focus-visible:ring-ring/50 (CSS variable ring)
 *  - aria-invalid states
 *  - has-[>svg] for automatic icon spacing
 *  - active:translate-y-px for tactile press feedback
 */

const buttonVariants = cva(
  cn(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'text-sm font-medium transition-all duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none appearance-none',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    /* Focus: 3px ring on primary color with 50% opacity glow */
    'focus-visible:outline-none',
    'focus-visible:ring-[3px] focus-visible:ring-ring/50',
    /* Active press: subtle 1px downward translate */
    'active:translate-y-px',
    /* Base radius per spec: 0.5rem (8px) for standard buttons */
    'rounded'
  ),
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary',
        destructive: 'bg-error text-on-error',
        outline: 'border border-outline bg-transparent text-foreground',
        secondary: 'bg-secondary text-on-secondary',
        tertiary: 'bg-tertiary text-on-tertiary',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        /* POS-specific — secondary outline style */
        posSecondary: 'border border-secondary text-secondary',
        /* Inventory — warning variant */
        warning: 'bg-warning text-on-warning-container',
        /* Destructive outline — outlined in red, filled on hover (prevents accidental triggers) */
        destructiveOutline: 'border border-error text-error hover:bg-error hover:text-on-error',
        /* Ghost icon-only — compact, no text */
        ghostIcon: 'p-1.5',
      },
      size: {
        default: 'h-10 px-4 has-[>svg]:px-3',
        sm: 'h-9 px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-12 rounded-lg px-8 py-3 text-lg has-[>svg]:px-6',
        xl: 'h-14 rounded-lg px-10 py-4 text-xl has-[>svg]:px-8',
        icon: 'h-10 w-10 p-0',
        iconSm: 'h-8 w-8 p-0',
        iconLg: 'h-12 w-12 p-0 rounded-lg',
        /* Tablet/POS — 48px minimum touch target per spec */
        tablet: 'h-12 rounded-lg px-6 has-[>svg]:px-4',
        /* Compact for tight layouts */
        compact: 'h-8 px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    /* Hover shadow per spec — subtle surface lift on filled variants */
    const hoverShadow =
      variant === 'default' ||
      variant === 'secondary' ||
      variant === 'tertiary' ||
      variant === 'warning'
        ? 'hover:shadow-md'
        : variant === 'outline' || variant === 'ghost'
          ? 'hover:bg-accent'
          : '';

    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size }), hoverShadow, className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
