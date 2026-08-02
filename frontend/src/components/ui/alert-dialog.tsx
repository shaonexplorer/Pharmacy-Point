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

interface AlertDialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

const AlertDialogHeader = ({ className, children, ...props }: AlertDialogHeaderProps) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props}>
    {children}
  </div>
);

interface AlertDialogFooterProps {
  className?: string;
  children?: React.ReactNode;
}

const AlertDialogFooter = ({ className, children, ...props }: AlertDialogFooterProps) => (
  <div
    className={cn(
      'flex flex-col space-y-2 sm:space-y-0 sm:justify-end sm:flex-row sm:gap-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Styled Action Button
const StyledAlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogAction>,
  React.ComponentPropsWithoutRef<typeof AlertDialogAction>
>(({ className, ...props }, ref) => (
  <AlertDialogAction
    ref={ref}
    className={cn(
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
      'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
      'px-4 py-2 data-[state=open]:focus:ring-2 data-[state=open]:focus:ring-ring data-[state=open]:focus:ring-offset-2',
      className
    )}
    {...props}
  />
));
StyledAlertDialogAction.displayName = 'AlertDialogAction';

// Styled Cancel Button
const StyledAlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogCancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogCancel>
>(({ className, ...props }, ref) => (
  <AlertDialogCancel
    ref={ref}
    className={cn(
      'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
      'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
      'px-4 py-2',
      className
    )}
    {...props}
  />
));
StyledAlertDialogCancel.displayName = 'AlertDialogCancel';

// Styled Content with overlay
const StyledAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogContent>,
  React.ComponentPropsWithoutRef<typeof AlertDialogContent>
>(({ className, children, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <AlertDialogContent
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200',
        'animate-in fade-in-0 zoom-in-95 sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </AlertDialogContent>
  </AlertDialogPortal>
));
StyledAlertDialogContent.displayName = 'AlertDialogContent';

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
