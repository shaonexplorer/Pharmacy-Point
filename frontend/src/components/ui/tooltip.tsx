import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = (props: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={cn(
        'z-50 overflow-hidden rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md',
        'data-[state=delayed-open]:data-[side=bottom]:slide-in-from-top-1',
        'data-[state=delayed-open]:data-[side=left]:slide-in-from-right-1',
        'data-[state=delayed-open]:data-[side=right]:slide-in-from-left-1',
        'data-[state=delayed-open]:data-[side=top]:slide-in-from-bottom-1'
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
);

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent };
