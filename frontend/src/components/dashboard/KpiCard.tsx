'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkline, sparklineData } from './Sparkline';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiCardProps {
  /** Short uppercase label for the metric */
  label: string;
  /** Primary metric value (already formatted) */
  value: string;
  /** Trend indicator value, e.g. "+12.4%" */
  trend: string;
  /** Trend direction */
  trendDirection: KpiTrend;
  /** Trend badge color — uses Clinical Precision tokens e.g. "bg-primary-container" */
  trendColor: string;
  /** Trend badge text color */
  trendTextColor: string;
  /** Numeric value used to generate sparkline data */
  sparkValue: number;
  /** Sparkline color — use HSL token e.g. 'hsl(var(--primary-hsl))' */
  sparkColor: string;
  /** Supporting metric label (e.g. "142 Transactions") */
  supportingLabel?: string;
  /** Supporting metric value (e.g. "Avg Ticket: $59.36") */
  supportingValue?: string;
  /** Full-width label describing supporting metrics */
  supportingFullLabel?: string;
  /** Optional bottom action text with icon */
  actionLabel?: string;
  /** Optional action handler */
  onAction?: () => void;
  /** Optional className */
  className?: string;
  /** Whether to show a loading skeleton */
  isLoading?: boolean;
}

/**
 * KPI card with trend indicator, primary value, supporting metrics,
 * and a sparkline chart. Follows the Clinical Precision design system.
 *
 * DESIGN.md → Data Grids & KPI Cards:
 *  - Container: Surface Level 1, rounded-lg (8px → 16px soft)
 *  - Label: label-caps (10px, 700, uppercase, tracking 0.06em)
 *  - Value: headline-xl (28px, 700, tracking -0.02em)
 *  - Trend badge: 1px border, 15% opacity background
 *  - Sparkline uses primary_color / tertiary_color tokens
 *
 * Stitch screen: KPI cards have a gradient background, trend badge,
 * sparkline, and a supporting metrics footer row.
 */
export function KpiCard({
  label,
  value,
  trend,
  trendDirection,
  trendColor,
  trendTextColor,
  sparkValue,
  sparkColor,
  supportingLabel,
  supportingValue,
  supportingFullLabel,
  actionLabel,
  onAction,
  className,
  isLoading = false,
}: KpiCardProps) {
  const TrendIcon = trendDirection === 'down' ? TrendingDown : TrendingUp;

  if (isLoading) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardContent className="p-5">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-7 w-32 rounded bg-muted" />
            <div className="h-8 w-full rounded bg-muted mt-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border-border bg-surface-container-lowest shadow-[var(--shadow-card)] transition-all duration-200',
        'group hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5',
        className
      )}
    >
      <CardContent className="p-5">
        {/* Header: Label + Trend Badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            {label}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-label-numeric-sm text-label-numeric-sm font-semibold',
              trendColor,
              trendTextColor
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {trend}
          </span>
        </div>

        {/* Primary Value */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
            {value}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
            {trend}
          </span>
        </div>

        {/* Supporting Metrics Footer */}
        {(supportingLabel || supportingValue || supportingFullLabel) && (
          <div className="mt-3 flex items-center justify-between">
            {supportingLabel && (
              <span className="font-body-xs text-body-xs text-on-surface-variant">
                {supportingLabel}
              </span>
            )}
            {supportingValue && (
              <span className="font-label-numeric-md text-label-numeric-md text-on-surface font-semibold">
                {supportingValue}
              </span>
            )}
            {supportingFullLabel && (
              <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
                {supportingFullLabel}
              </span>
            )}
          </div>
        )}

        {/* Sparkline */}
        <div className="mt-3">
          <Sparkline data={sparklineData(sparkValue)} color={sparkColor} />
        </div>

        {/* Optional Action */}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 flex items-center gap-1 font-button-text text-button-text text-primary hover:text-primary-container"
          >
            {actionLabel}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton variant for KpiCard.
 */
export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="p-5">
        <div className="animate-pulse space-y-3">
          <div className="flex items-start justify-between">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-3 w-12 rounded bg-muted" />
          </div>
          <div className="h-7 w-32 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted mt-3" />
        </div>
      </CardContent>
    </Card>
  );
}
