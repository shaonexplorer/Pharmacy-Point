import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Card Component
 *
 * Design spec (DESIGN.md → Shape & Elevation):
 *  - Container Elements (KPI cards, modals): rounded-lg (1rem / 16px)
 *  - Surface Level 1: White (#ffffff) with subtle shadow (Blur: 12px, Y: 4px, Opacity: 4-6%)
 *  - Hover: Cards subtly increase shadow spread and lift (Y: -2px).
 *
 * Used for: KPI cards, data tables, modals, dashboard widgets.
 */

const Card = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        /* Surface container — level 1 */
        'rounded-lg border bg-card text-card-foreground',
        /* Elevation: Blur 12px, Y 4px, 4-6% opacity */
        'shadow-[0_4px_12px_rgba(0,0,0,0.04)]',
        /* Hover lift: subtle shadow increase + Y lift (-2px) */
        'transition-shadow duration-200 ease-out hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)]',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-2 p-6',
      'border-b border-border',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/* CardTitle — headline-md (20px, 600 weight, 28px line-height) */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<'h3'>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-headline-md font-semibold leading-tight tracking-tight text-foreground',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/* CardDescription — body-md (14px, 400 weight) with muted color */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<'p'>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-body-md text-on-surface-variant',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between p-6 pt-0',
      'border-t border-border',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
