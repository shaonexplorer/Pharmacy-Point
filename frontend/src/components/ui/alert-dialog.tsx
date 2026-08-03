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
 */

/* ── Header ────────────────────────────────────────────── */

function AlertDialogHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}
AlertDialogHeader.displayName = 'AlertDialogHeader';

function AlertDialogFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
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
    ref={ref}
    className={cn(
      'bg-primary text-on-primary',
      'hover:bg-primary/90 hover:shadow-md',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'inline-flex items-center justify-center gap-2',
      'rounded-lg text-sm font-medium',
      'transition-all duration-200',
      'active:scale-[0.98]',
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
    ref={ref}
    className={cn(
      'border border-input bg-background',
      'hover:bg-muted',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'inline-flex items-center justify-center gap-2',
      'rounded-lg text-sm font-medium',
      'transition-all duration-200',
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
      className={cn(
        'fixed inset-0 z-50 bg-background/40',
        'backdrop-blur-[8px]',
      )}
    />
    <AlertDialogContent
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4',
        /* Container: rounded-lg (1rem / 16px) per spec */
        'rounded-lg border border-border bg-card',
        'p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
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
