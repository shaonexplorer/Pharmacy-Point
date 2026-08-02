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
import { Badge, badgeVariants } from '@/components/ui/badge';

interface CustomAlertDialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

const CustomAlertDialogHeader = ({ className, children, ...props }: CustomAlertDialogHeaderProps) => (
  <div
    className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
    {...props}
  >
    {children}
  </div>
);

interface CustomAlertDialogFooterProps {
  className?: string;
  children?: React.ReactNode;
}

const CustomAlertDialogFooter = ({ className, children, ...props }: CustomAlertDialogFooterProps) => (
  <div
    className={cn(
      'flex flex-col space-y-2 sm:space-y-0 sm:justify-end sm:flex-row sm:gap-3',
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
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-2',
      'focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center gap-2',
      'rounded-md text-sm font-medium transition-colors duration-200 px-4 py-2',
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
      'hover:bg-accent hover:text-accent-foreground focus-visible:ring-2',
      'focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center gap-2',
      'rounded-md text-sm font-medium transition-colors duration-200 px-4 py-2',
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
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
        'rounded-xl border bg-card p-6 shadow-xl duration-200',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
      {...props}
    >
      {children}
    </AlertDialogContent>
  </AlertDialogPortal>
));
StyledAlertDialogContent.displayName = 'AlertDialogContent';

// Input component
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'transition-colors duration-200 placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
          'hover:border-muted',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Label component
interface LabelProps extends React.ComponentProps<'label'> {
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'flex items-center space-x-2 text-sm font-medium leading-none',
      'text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-75',
      className
    )}
    {...props}
  />
));
Label.displayName = 'Label';

// Textarea component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[60px] w-full rounded-md border border-input bg-background',
      'px-3 py-2 text-sm transition-colors duration-200 placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
      'hover:border-muted',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export {
  AlertDialog,
  AlertDialogTrigger,
  StyledAlertDialogContent as AlertDialogContent,
  CustomAlertDialogHeader as AlertDialogHeader,
  CustomAlertDialogFooter as AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  StyledAlertDialogAction as AlertDialogAction,
  StyledAlertDialogCancel as AlertDialogCancel,
  AlertDialogOverlay,
  Input,
  Label,
  Textarea,
  Badge,
  badgeVariants,
};