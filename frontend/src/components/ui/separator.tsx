'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' && 'h-px w-full',
        orientation === 'vertical' && 'h-full w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
