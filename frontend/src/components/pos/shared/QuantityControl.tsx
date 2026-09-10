'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * QuantityControl — inline +/- stepper with a numeric input.
 *
 * Used on cart line items (the dense pharmacy ledger). Per DESIGN.md,
 * tactile touch targets must respect `pos-touch-min` (44px / 2.75rem)
 * on tablet/POS terminals.
 *
 * The input itself is `data-mono` for numerical clarity.
 */
export function QuantityControl({
  quantity,
  min = 1,
  max,
  onChange,
  onIncrement,
  onDecrement,
  disabled = false,
  className,
  size = 'sm',
}: {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
  };
  const btnSizeClasses = size === 'sm' ? 'size-6' : 'size-9';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
    >
      <button
        type="button"
        onClick={onDecrement ?? (() => onChange(Math.max(min, quantity - 1)))}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
        className={cn(
          btnSizeClasses,
          'rounded bg-surface-container hover:bg-surface-container-high',
          'text-on-surface-variant hover:text-on-surface',
          'flex items-center justify-center font-bold',
          'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
      >
        <Minus className={cn('h-3 w-3', size === 'md' && 'h-4 w-4')} />
      </button>

      <input
        type="number"
        value={quantity}
        min={min}
        max={max}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) {
            onChange(Math.max(min, max !== undefined ? Math.min(val, max) : val));
          }
        }}
        disabled={disabled}
        aria-label="Quantity"
        className={cn(
          'w-7 text-center font-mono font-medium text-foreground',
          'bg-transparent border-0 focus:outline-none focus:ring-0',
          size === 'md' && 'w-10 text-base'
        )}
      />

      <button
        type="button"
        onClick={onIncrement ?? (() => onChange(quantity + 1))}
        disabled={disabled || (!!max && quantity >= max)}
        aria-label="Increase quantity"
        className={cn(
          btnSizeClasses,
          'rounded bg-surface-container hover:bg-surface-container-high',
          'text-on-surface-variant hover:text-on-surface',
          'flex items-center justify-center font-bold',
          'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
      >
        <Plus className={cn('h-3 w-3', size === 'md' && 'h-4 w-4')} />
      </button>
    </div>
  );
}
