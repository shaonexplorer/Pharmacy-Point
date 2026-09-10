'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export interface TopProductItem {
  rank: number;
  name: string;
  category: string;
  revenue: number;
  quantity: number;
  unit: string;
  /** Max revenue for scaling bars */
  maxRevenue?: number;
}

export interface TopProductsChartProps {
  /** Product data for the chart */
  items: TopProductItem[];
  /** Active metric tab */
  activeMetric: 'Revenue' | 'Volume';
  /** Callback when metric is changed */
  onMetricChange: (metric: 'Revenue' | 'Volume') => void;
  /** Total count text */
  totalCount: string;
  /** Action label */
  actionLabel?: string;
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * Top-Selling Formulations — a horizontal bar chart visualizing the
 * top-performing medications by revenue or volume.
 *
 * DESIGN.md → Data Grids:
 *  - Bars use primary-container / surface-container colors
 *  - Rank numbers use primary color
 *  - Category badges use surface-container-high background
 *
 * Stitch screen:
 *  - Rank number + product name + category badge
 *  - Revenue value on the right
 *  - Progress bar with percentage width
 *  - Quantity dispensed subtitle below bar
 */
export function TopProductsChart({
  items,
  activeMetric,
  onMetricChange,
  totalCount,
  actionLabel = 'Comprehensive Formulary',
  isLoading,
  className,
}: TopProductsChartProps) {
  if (isLoading) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardHeader>
          <CardTitle className="text-headline-md">Top-Selling Formulations</CardTitle>
          <CardDescription className="text-body-md text-on-surface-variant">
            Ranked by turnover frequency this shift
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardHeader>
          <CardTitle className="text-headline-md">Top-Selling Formulations</CardTitle>
          <CardDescription className="text-body-md text-on-surface-variant">
            Ranked by turnover frequency this shift
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <p className="text-body-md text-on-surface-variant">No products sold yet</p>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...items.map((i) => i.revenue), 1);

  return (
    <Card
      className={cn(
        'border-border bg-surface-container-lowest shadow-[var(--shadow-card)]',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-headline-md text-on-surface">
              Top-Selling Formulations
            </CardTitle>
            <CardDescription className="text-body-xs text-on-surface-variant mt-1">
              Ranked by {activeMetric === 'Revenue' ? 'revenue' : 'units dispensed'} this shift
            </CardDescription>
          </div>

          {/* Metric toggle */}
          <div className="flex items-center bg-surface-container p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onMetricChange('Revenue')}
              className={cn(
                'px-3 py-1.5 rounded font-label-caps text-label-caps uppercase text-xs font-bold transition-colors',
                activeMetric === 'Revenue'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => onMetricChange('Volume')}
              className={cn(
                'px-3 py-1.5 rounded font-label-caps text-label-caps uppercase text-xs font-bold transition-colors',
                activeMetric === 'Volume'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              Volume
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col gap-4 mt-2">
          {items.map((item) => {
            const barWidthPct = (item.revenue / maxRevenue) * 100;
            return (
              <div key={item.rank} className="flex flex-col gap-2">
                {/* Row: Rank + Name + Category + Value */}
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-label-numeric-sm text-label-numeric-sm text-primary font-bold w-8">
                      #{String(item.rank).padStart(2, '0')}
                    </span>
                    <span className="font-button-text text-button-text text-on-surface truncate max-w-[180px]">
                      {item.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps text-xs"
                    >
                      {item.category}
                    </Badge>
                  </div>
                  <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface font-bold">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-container transition-all duration-500"
                    style={{ width: `${Math.max(2, barWidthPct)}%` }}
                  />
                </div>

                {/* Subtext */}
                <span className="font-body-xs text-body-xs text-on-surface-variant text-right">
                  {item.quantity} {item.unit} dispensed
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>

      <div className="pt-3 flex items-center justify-between border-t border-outline-variant/20 px-5">
        <span className="font-body-xs text-body-xs text-on-surface-variant">
          {totalCount}
        </span>
        <button
          type="button"
          className="font-button-text text-button-text text-primary hover:text-primary-container flex items-center gap-1"
        >
          {actionLabel}
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
