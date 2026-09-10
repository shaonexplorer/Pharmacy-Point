'use client';

import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * StockVial — a condensed medication-vial stock indicator that reads stock
 * urgency at a glance.
 *
 * Grounded in the pharmacy subject: a real dispensing vial literally contains
 * liquid, so the fill-height encodes "how full is the bottle" while the colour
 * encodes the stock-status band (success / warning / error) per DESIGN.md.
 *
 * DESIGN.md Status & Clinical Safety Tokens:
 *  - In Stock  / Success:  liquid filled with tertiary (green)
 *  - Low Stock / Warning:  liquid filled with warning (amber)
 *  - Out of Stock / Error: liquid fill at 0 (empty vial) with red outline
 */
export function StockVial({
  quantity,
  lowStock = 10,
  className,
  size = 'default',
}: {
  quantity: number;
  lowStock?: number;
  size?: 'sm' | 'default' | 'lg';
} & ComponentPropsWithoutRef<'div'>) {
  const threshold = Math.max(lowStock || 10, 1);
  const isCritical = quantity <= threshold / 2;
  const isLow = quantity <= threshold;
  const isEmpty = quantity <= 0;

  let fillPct: number;
  let fillColor: string;

  if (isEmpty) {
    fillPct = 0;
    fillColor = 'hsl(var(--error-hsl, 0 75% 42%))';
  } else if (isCritical) {
    fillPct = Math.min(100, (quantity / (threshold * 2)) * 100);
    fillColor = 'hsl(var(--warning-hsl, 41 96% 40%))';
  } else if (isLow) {
    fillPct = Math.min(100, (quantity / (threshold * 2)) * 100);
    fillColor = 'hsl(var(--warning-hsl, 41 96% 40%))';
  } else {
    fillPct = Math.min(100, (quantity / (threshold * 2)) * 100);
    fillColor = 'hsl(var(--tertiary-hsl, 239 57% 51%))';
  }

  // Size variants
  const sizeClasses = {
    sm: 'h-8 w-[1.25rem]',
    default: 'h-10 w-5',
    lg: 'h-14 w-[1.75rem]',
  };

  const capClasses = {
    sm: 'h-1 w-4',
    default: 'h-2 w-6',
    lg: 'h-3 w-8',
  };

  const bodyClasses = {
    sm: 'top-1',
    default: 'top-2',
    lg: 'top-3',
  };

  return (
    <div
      className={cn('relative mx-auto', sizeClasses[size], className)}
      aria-label={`Stock: ${quantity} in stock`}
      role="img"
    >
      {/* Cap — wider than the body, centered like a real vial */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 rounded-b-md bg-foreground',
          capClasses[size]
        )}
      />
      {/* Bottle body */}
      <div
        className={cn(
          'absolute inset-0 rounded-sm border border-border bg-surface-container-lowest/50',
          bodyClasses[size]
        )}
      />
      {/* Liquid fill — grows from the bottom to read stock urgency at a glance */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 rounded-b-sm transition-all duration-300',
          isEmpty ? 'border' : ''
        )}
        style={{
          height: `${fillPct}%`,
          minHeight: fillPct === 0 ? '0' : '2px',
          backgroundColor: fillPct === 0 ? 'transparent' : fillColor,
        }}
      />
      {/* Out-of-stock cross-hatch overlay */}
      {isEmpty && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-[6px] font-bold text-error">EMPTY</span>
        </div>
      )}
    </div>
  );
}
