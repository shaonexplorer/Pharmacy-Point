'use client';

import { cn } from '@/lib/utils';

/**
 * CategoryPills — a horizontally scrollable row of category filter pills.
 *
 * Matches the Stitch POS design: rounded-full pills, one active (filled
 * with primary) and the rest as ghost outlines. Uses the Clinical Precision
 * font tokens.
 *
 * DESIGN.md: "Pill Exceptions: Reserved strictly for quantity counters and
 * critical dosage warning tags (rounded-full / 9999px)" — category pills
 * also use rounded-full for the filter UI.
 */
export function CategoryPills({
  categories,
  selected,
  onSelect,
  className,
}: {
  categories: { id: string; name: string; count?: number }[];
  selected: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto py-1 no-scrollbar',
        className
      )}
    >
      {categories.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              'px-3 py-1 rounded-full whitespace-nowrap',
              'font-button-text text-button-text text-xs',
              'transition-colors',
              isActive
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            {cat.name}
            {cat.count !== undefined && (
              <span className="ml-1 text-xs font-mono">({cat.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
