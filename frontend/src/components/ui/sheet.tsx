import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;

type SheetContentSide = 'top' | 'bottom' | 'left' | 'right';

const SheetContent = ({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: SheetContentSide;
}) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
      )}
    />
    <DialogPrimitive.Content
      className={cn(
        'fixed z-50 gap-4 border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out',
        side === 'top' &&
          'inset-x-0 top-0 border-b data-[state=closed]:slide-out-up data-[state=open]:slide-in-from-top',
        side === 'bottom' &&
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-down data-[state=open]:slide-in-from-bottom',
        side === 'left' &&
          'inset-y-0 left-0 h-full w-3/4 max-w-sm data-[state=closed]:slide-out-left data-[state=open]:slide-in-from-left',
        side === 'right' &&
          'inset-y-0 right-0 h-full w-3/4 max-w-sm data-[state=closed]:slide-out-right data-[state=open]:slide-in-from-right',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none'
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center md:text-left', className)} {...props} />
);

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);

const SheetTitle = (props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn('text-lg font-semibold text-foreground', props.className)}
    {...props}
  />
);

const SheetDescription = (
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
) => <DialogPrimitive.Description className="text-sm text-muted-foreground" {...props} />;

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
