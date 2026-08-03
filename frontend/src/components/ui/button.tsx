import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:ring-2 [&_svg]:ring-offset-2 [&_svg]:ring-ring hover:bg-accent hover:text-accent-foreground active:scale-95 motion-safe:active:scale-100 appearance-none shadow-sm',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md focus-visible:ring-primary',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md focus-visible:ring-destructive',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus-visible:ring-primary',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm focus-visible:ring-secondary',
        ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary',
        link: 'underline-offset-4 hover:underline text-primary focus-visible:ring-primary',
        // Dashboard-specific variants
        ghostIcon:
          'hover:bg-accent hover:text-accent-foreground p-1.5 rounded-md focus-visible:ring-primary',
        danger:
          'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/15 focus-visible:ring-destructive',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8 py-3',
        icon: 'h-10 w-10 p-0',
        // Dashboard-specific sizes
        compact: 'h-8 px-3 text-xs',
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
