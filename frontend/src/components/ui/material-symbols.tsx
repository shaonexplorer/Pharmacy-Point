'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * MaterialSymbols — a thin wrapper around the Google Material Symbols
 *Outlined font that the Clinical Precision DESIGN.md specifies for the POS
 * terminal UI.
 *
 * Usage mirrors a typical icon component:
 *
 *   <MaterialSymbols icon="point_of_sale" className="text-xl text-primary" />
 *
 * The icon name is the Material Symbols Outlined glyph name (e.g.
 *"barcode_scanner", "add_shopping_cart").  See
 * https://fonts.google.com/icons for the full catalog.
 */
export function MaterialSymbols({
  icon,
  className,
  ...props
}: {
  icon: string;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('material-symbols-outlined', className)}
      {...props}
    >
      {icon}
    </span>
  );
}

/**
 * MaterialSymbol — alias for single-character usage in JSX.
 */
export const MaterialSymbol = MaterialSymbols;
export type MaterialSymbolProps = {
  icon: string;
  className?: string;
};
