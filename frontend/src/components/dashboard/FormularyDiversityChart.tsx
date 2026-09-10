'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface FormularySegment {
  label: string;
  value: number;
  percentage: number;
  skuCount: number;
  color: string;
}

export interface FormularyDiversityChartProps {
  /** Category segments for the donut */
  segments: FormularySegment[];
  /** Central metric (e.g. "1,842") */
  centralLabel: string;
  /** Central metric subtitle (e.g. "Total SKUs") */
  centralSublabel: string;
  /** Footer note */
  footerNote?: string;
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * Formulary Diversity — a donut chart visualizing the distribution
 * of medication categories across the pharmacy's inventory.
 *
 * DESIGN.md → Charts:
 *  - Segmented rings using primary, tertiary, primary-container, secondary-container
 *  - Central metric in headline-lg
 *  - Legend with percentage and SKU count
 *
 * Stitch screen:
 *  - Donut chart with 4 segments (Antibiotics, Chronic Care/OTC, Hygiene, Devices)
 *  - Central "1,842 Total SKUs"
 *  - Legend grid with colored dots
 *  - Footer note (Cold Chain info)
 */
export function FormularyDiversityChart({
  segments,
  centralLabel,
  centralSublabel,
  footerNote,
  isLoading,
  className,
}: FormularyDiversityChartProps) {
  if (isLoading) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardHeader>
          <CardTitle className="text-headline-md">Formulary Diversity</CardTitle>
          <CardDescription className="text-body-md text-on-surface-variant">
            Real-Time Inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border-border bg-surface-container-lowest shadow-[var(--shadow-card)]',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-headline-md text-on-surface">
            Formulary Diversity
          </CardTitle>
          <span className="font-label-caps text-label-caps bg-surface-container px-2 py-1 rounded text-on-surface-variant uppercase">
            Real-Time Inventory
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <DonutPath segments={segments} />
          </svg>
          {/* Central Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {centralLabel}
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              {centralSublabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="flex items-center gap-1.5 p-1.5 bg-surface-container-low rounded"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <div className="min-w-0 flex-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant truncate block">
                  {seg.label}
                </span>
                <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface font-bold">
                  {seg.percentage}% ({seg.skuCount} SKUs)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {footerNote && (
        <div className="pt-3 text-center border-t border-outline-variant/20">
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            {footerNote}
          </span>
        </div>
      )}
    </Card>
  );
}

/**
 * Render the SVG path elements for the donut segments.
 * Each segment is a circle arc calculated from the percentage.
 */
function DonutPath({ segments }: { segments: FormularySegment[] }) {
  const radius = 38;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <>
      {segments.map((seg, i) => {
        const dash = (seg.percentage / 100) * circumference;
        const segment = (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={14}
            stroke={seg.color}
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += dash;
        return segment;
      })}
    </>
  );
}
