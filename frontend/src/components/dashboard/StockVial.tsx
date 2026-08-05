'use client';

import { cn } from '@/lib/utils';

interface StockVialProps {
  /** Current stock quantity */
  quantity: number;
  /** Low stock threshold */
  lowStock: number;
  /** Optional size modifier */
  size?: 'sm' | 'md' | 'lg';
  /** Optional className */
  className?: string;
}

/**
 * Medication bottle visualization — a small SVG vial whose fill level
 * and colour communicate stock urgency.
 *
 * DESIGN.md → Status Chips & Dashboard: A distinctive signature element
 * for the pharmacy dashboard. The vial fill level visually encodes stock
 * as a percentage of 2× the low-stock threshold, with colour-coded urgency:
 * - Safety Green (tertiary) for healthy stock
 * - Warning amber for low stock
 * - Error red for critical stock (≤ 50% of threshold)
 *
 * The vial uses a subtle pulse animation when stock is critical to draw
 * attention without being obnoxious.
 *
 * This component is inspired by the visual metaphor of a medication vial /
 * pharmaceutical bottle — a subject-specific element that could not be
 * mistaken for any other domain.
 */
export function StockVial({ quantity, lowStock, size = 'md', className }: StockVialProps) {
  const threshold = Math.max(lowStock || 10, 1);
  const isCritical = quantity <= threshold / 2;
  const isLow = quantity <= threshold;

  // Fill the vial to a percentage relative to 2× the low-stock threshold
  const fillPct = Math.min(100, Math.max(0, (quantity / (threshold * 2)) * 100));

  // Clinical Precision color tokens
  const fillColor = isCritical
    ? 'hsl(var(--error-hsl))'
    : isLow
      ? 'hsl(var(--warning-hsl))'
      : 'hsl(var(--tertiary-hsl))';

  // Size variants — all proportionally scaled from the base
  const sizeConfig = {
    sm: {
      container: 'h-12 w-5',
      capOffset: 'top-0 -ml-2 w-4 h-2',
      bodyOffset: 8,
      bodyRadius: 'rounded-b-full',
    },
    md: {
      container: 'h-20 w-8',
      capOffset: 'top-0 -ml-3 w-6 h-3',
      bodyOffset: 12,
      bodyRadius: 'rounded-full',
    },
    lg: {
      container: 'h-28 w-10',
      capOffset: 'top-0 -ml-4 w-8 h-3',
      bodyOffset: 12,
      bodyRadius: 'rounded-full',
    },
  };

  const cfg = sizeConfig[size];

  return (
    <div className={cn('relative mx-auto', cfg.container, className)}>
      {/* Cap — positioned at the very top, centered */}
      <div
        className={cn(
          'absolute left-1/2 rounded-b-md bg-foreground',
          cfg.capOffset,
          isCritical && 'animate-pulse-subtle'
        )}
      />
      {/* Bottle body — sits below the cap, full pill shape */}
      <div
        className={cn(
          'absolute inset-0 border-2 border-border bg-surface-container-lowest/50',
          cfg.bodyRadius
        )}
        style={{ top: cfg.bodyOffset }}
      />
      {/* Liquid fill — anchored at bottom, rises via height percentage */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-500 ease-out',
          isCritical && 'animate-pulse-subtle'
        )}
        style={{
          height: `${fillPct}%`,
          minHeight: '2px',
          backgroundColor: fillColor,
        }}
      />
    </div>
  );
}
