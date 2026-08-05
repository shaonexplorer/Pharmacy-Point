'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkline, sparklineData } from './Sparkline';

interface KpiCardProps {
  /** Icon component (from lucide-react) */
  icon: React.ComponentType<{ className?: string }>;
  /** Short uppercase label for the metric */
  label: string;
  /** Primary metric value (formatted) */
  value: string;
  /** Secondary description text */
  subtext: string;
  /** Sparkline color — use Clinical Precision HSL tokens like hsl(var(--primary-hsl)) */
  sparkColor: string;
  /** Numeric value used to generate sparkline data */
  sparkValue: number;
  /** Icon text color — use Clinical Precision token like text-primary */
  iconColor?: string;
  /** Icon background color — use Clinical Precision token like bg-primary/10 */
  iconBg?: string;
  /** Whether to show a loading skeleton */
  isLoading?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * KPI card with an inline sparkline and Clinical Precision color coding.
 *
 * DESIGN.md → KPI Cards:
 *  - Primary metric: headline-md (20px, 600 weight, 28px line-height)
 *  - Description: label-md (12px, 600 weight, 0.05em tracking)
 *  - Container: Surface Level 1 with rounded-lg (16px)
 *  - Sparkline uses primary_color or tertiary_color
 *  - Hover: Subtle shadow increase with Y-lift (-2px)
 *
 * The card icon uses a soft tinted background (primary/tertiary/secondary)
 * to create visual harmony while maintaining distinct semantic meaning.
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  subtext,
  sparkColor,
  sparkValue,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  isLoading = false,
  className,
}: KpiCardProps) {
  return (
    <Card
      className={cn(
        'border-border bg-card transition-all duration-200',
        'group hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5',
        className
      )}
    >
      <CardContent className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              iconBg,
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label-md text-on-surface-variant">{label}</p>
            {isLoading ? (
              <div className="mt-1 h-6 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-2xl font-bold text-data-mono text-foreground mt-1">{value}</p>
            )}
            {subtext && !isLoading && (
              <p className="text-xs text-on-surface-variant mt-0.5">{subtext}</p>
            )}
            {isLoading && <div className="mt-1 h-3 w-24 animate-pulse rounded bg-muted" />}
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <div className="h-3 w-full max-w-[60%] animate-pulse rounded bg-muted" />
          ) : (
            <Sparkline data={sparklineData(sparkValue)} color={sparkColor} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface KpiCardSkeletonProps {
  className?: string;
}

/**
 * Loading skeleton variant for KpiCard — shows during data fetch.
 */
export function KpiCardSkeleton({ className }: KpiCardSkeletonProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded bg-muted mt-1" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted mt-1" />
          </div>
        </div>
        <div className="mt-3 h-3 w-full max-w-[60%] animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
