'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@radix-ui/react-alert-dialog';

import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Alert Dialog / Modal Component
 *
 * Design spec (DESIGN.md → Inventory Modals):
 *  - Layout: Centered layout
 *  - Backdrop: 40% opacity backdrop blur (Glassmorphism)
 *  - Destructive actions: Outlined in red but filled only on hover to
 *    prevent accidental triggers.
 *
 * The content dialog uses rounded-lg (1rem / 16px) per container spec.
 *
 * Modern shadcn v4 patterns:
 *  - data-slot attributes for styling hooks
 *  - CSS variables for shadows (--shadow-popover)
 *  - tw-animate-css utility classes (animate-in, fade-in-0, zoom-in-95)
 */

/* ── Header ────────────────────────────────────────────── */

function AlertDialogHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}
AlertDialogHeader.displayName = 'AlertDialogHeader';

function AlertDialogFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0',
        className
      )}
      {...props}
    />
  );
}
AlertDialogFooter.displayName = 'AlertDialogFooter';

/* ── Styled Action Button ───────────────────────────────── */

const StyledAlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogAction>,
  React.ComponentPropsWithoutRef<typeof AlertDialogAction>
>(({ className, ...props }, ref) => (
  <AlertDialogAction
    data-slot="alert-dialog-action"
    ref={ref}
    className={cn(
      'bg-primary text-on-primary',
      'hover:bg-primary/90',
      'focus-visible:ring-[3px] focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:opacity-50',
      'inline-flex items-center justify-center gap-2',
      'rounded-lg text-sm font-medium',
      'transition-colors duration-200',
      className
    )}
    {...props}
  />
));
StyledAlertDialogAction.displayName = 'AlertDialogAction';

/* ── Styled Cancel Button ───────────────────────────────── */

const StyledAlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogCancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogCancel>
>(({ className, ...props }, ref) => (
  <AlertDialogCancel
    data-slot="alert-dialog-cancel"
    ref={ref}
    className={cn(
      'border border-input bg-background',
      'hover:bg-muted',
      'focus-visible:ring-[3px] focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:opacity-50',
      'inline-flex items-center justify-center gap-2',
      'rounded-lg text-sm font-medium',
      'transition-colors duration-200',
      className
    )}
    {...props}
  />
));
StyledAlertDialogCancel.displayName = 'AlertDialogCancel';

/* ── Content with Glassmorphism overlay ────────────────── */

const StyledAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogContent>,
  React.ComponentPropsWithoutRef<typeof AlertDialogContent>
>(({ className, children, ...props }, ref) => (
  <AlertDialogPortal>
    {/* 40% opacity backdrop blur (Glassmorphism) */}
    <AlertDialogOverlay
      data-slot="alert-dialog-overlay"
      className={cn('fixed inset-0 z-50 bg-background/40', 'backdrop-blur-[8px]')}
    />
    <AlertDialogContent
      data-slot="alert-dialog-content"
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
        /* Container: rounded-lg (1rem / 16px) per spec */
        'rounded-lg border border-border bg-card',
        'p-6 shadow-[var(--shadow-popover)]',
        'duration-200 animate-in fade-in-0 zoom-in-95',
        className
      )}
      {...props}
    >
      {children}
    </AlertDialogContent>
  </AlertDialogPortal>
));
StyledAlertDialogContent.displayName = 'AlertDialogContent';

/* ── Re-exported components ────────────────────────────── */

export {
  AlertDialog,
  AlertDialogTrigger,
  StyledAlertDialogContent as AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  StyledAlertDialogAction as AlertDialogAction,
  StyledAlertDialogCancel as AlertDialogCancel,
  AlertDialogOverlay,
};
