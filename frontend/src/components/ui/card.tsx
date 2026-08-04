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
 * Modern shadcn v4 patterns applied:
 *  - data-slot attributes for styling hooks
 *  - CSS variables for shadows (--shadow-card, --shadow-card-hover)
 *  - @container for CardHeader grid layout support
 */

const Card = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="card"
      ref={ref}
      className={cn(
        /* Surface container — level 1 */
        'rounded-lg border bg-card text-card-foreground',
        /* Elevation: Blur 12px, Y 4px, 4-6% opacity via CSS variable */
        'shadow-[var(--shadow-card)]',
        /* Hover lift: subtle shadow increase + Y lift (-2px) */
        'transition-[box-shadow,transform] duration-200 ease-out',
        'hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="card-header"
      ref={ref}
      className={cn('flex flex-col space-y-2 p-6', '[.border-b]:pb-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

/* CardTitle — headline-md (20px, 600 weight, 28px line-height) */
const CardTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<'h3'>>(
  ({ className, ...props }, ref) => (
    <h3
      data-slot="card-title"
      ref={ref}
      className={cn(
        'text-headline-md font-semibold leading-tight tracking-tight text-foreground',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

/* CardDescription — body-md (14px, 400 weight) with muted color */
const CardDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<'p'>>(
  ({ className, ...props }, ref) => (
    <p
      data-slot="card-description"
      ref={ref}
      className={cn('text-body-md text-on-surface-variant', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div data-slot="card-content" ref={ref} className={cn('px-6', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="card-footer"
      ref={ref}
      className={cn('flex items-center pt-6', '[.border-t]:pt-6', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
