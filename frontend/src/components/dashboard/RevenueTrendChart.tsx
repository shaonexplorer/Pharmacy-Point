'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, Info } from 'lucide-react';

export interface TrendPoint {
  label: string;
  grossSales: number;
  netProfit: number;
}

export interface RevenueTrendChartProps {
  /** Data points for the chart */
  data: TrendPoint[];
  /** Currently active timeframe */
  activePeriod: string;
  /** Available period options */
  periods: string[];
  /** Callback when period is changed */
  onPeriodChange: (period: string) => void;
  /** Summary metrics for the footer */
  summary?: {
    peakHourlyFlow: string;
    tenderSplit: string;
    rxOtcRatio: string;
  };
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * Revenue & Prescription Yield — an SVG-based dual-series line/area chart
 * visualizing gross sales (primary teal) and net profit (tertiary indigo).
 *
 * DESIGN.md → Charts:
 *  - Uses Clinical Precision color tokens via CSS variables
 *  - Surface Level 1 container, rounded-lg (8px)
 *  - Grid lines at surface-container level
 *  - Gradient area fills with low opacity
 *
 * Stitch screen:
 *  - Timeframe pill toggles (Today, 7D, 30D, Year)
 *  - Legend with colored dots
 *  - Peak marker with tooltip card
 *  - Summary footer (Peak Hourly Flow, Tender Split, Rx/OTC Ratio)
 */
export function RevenueTrendChart({
  data,
  activePeriod,
  periods,
  onPeriodChange,
  summary,
  isLoading,
  className,
}: RevenueTrendChartProps) {
  if (isLoading) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardHeader>
          <CardTitle className="text-headline-md">Revenue &amp; Prescription Yield</CardTitle>
          <CardDescription className="text-body-md text-on-surface-variant">
            Hourly dispense volume mapped against aggregate net revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className={cn('h-full border-border bg-card', className)}>
        <CardHeader>
          <CardTitle className="text-headline-md">Revenue &amp; Prescription Yield</CardTitle>
          <CardDescription className="text-body-md text-on-surface-variant">
            Hourly dispense volume mapped against aggregate net revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[240px] items-center justify-center">
          <p className="text-body-md text-on-surface-variant">No revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'h-full border-border bg-surface-container-lowest shadow-[var(--shadow-card)]',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-headline-md text-on-surface">
                Revenue &amp; Prescription Yield
              </CardTitle>
              <Info className="h-4 w-4 text-outline cursor-pointer hover:text-on-surface transition-colors" />
            </div>
            <CardDescription className="text-body-xs text-on-surface-variant mt-1">
              Hourly dispense volume mapped against aggregate net revenue
            </CardDescription>
          </div>

          {/* Timeframe pill toggles */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
            {periods.map((period) => {
              const isActive = period === activePeriod;
              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => onPeriodChange(period)}
                  className={cn(
                    'px-3 py-1.5 rounded font-button-text text-button-text text-sm transition-colors',
                    isActive
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  {period}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Legend */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="font-body-xs text-body-xs text-on-surface-variant">
                Gross Sales ($)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-tertiary" />
              <span className="font-body-xs text-body-xs text-on-surface-variant">
                Net Profit ($)
              </span>
            </div>
          </div>
          <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
            Peak Velocity: Fri Oct 25
          </span>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full h-56">
          <ChartSvg data={data} />
        </div>

        {/* Day Labels Axis */}
        <div className="flex justify-between items-center px-2 pt-2 font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
          {data.map((d, i) => (
            <span
              key={d.label}
              className={cn('text-center', i === data.length - 1 && 'text-primary font-bold')}
            >
              {d.label}
            </span>
          ))}
        </div>
      </CardContent>

      {/* Summary Footer */}
      {summary && (
        <div className=" mx-4 grid grid-cols-3 gap-2 pt-3 mt-3 bg-surface-container-low p-2 rounded-lg border-t border-outline-variant/20">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Peak Hourly Flow
            </span>
            <span className="font-label-numeric-md text-label-numeric-md text-on-surface font-semibold">
              {summary.peakHourlyFlow}
            </span>
          </div>
          <div className="flex flex-col text-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Tender Split
            </span>
            <span className="font-label-numeric-md text-label-numeric-md text-on-surface font-semibold">
              {summary.tenderSplit}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Rx / OTC Ratio
            </span>
            <span className="font-label-numeric-md text-label-numeric-md text-primary font-semibold">
              {summary.rxOtcRatio}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Internal SVG renderer for the revenue trend chart.
 * Draws grid lines, area paths with gradients, line strokes,
 * data points, and a peak marker with tooltip.
 */
function ChartSvg({ data }: { data: TrendPoint[] }) {
  const svgW = 700;
  const svgH = 220;
  const pad = 24;
  const plotH = svgH - 2 * pad;
  const plotW = svgW - 2 * pad;

  const grossValues = data.map((d) => d.grossSales);
  const profitValues = data.map((d) => d.netProfit);
  const allValues = [...grossValues, ...profitValues];
  const maxVal = Math.max(...allValues, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const xStep = plotW / (data.length - 1 || 1);

  const grossPts = data.map((d, i) => ({
    x: pad + i * xStep,
    y: pad + plotH - ((d.grossSales - minVal) / range) * plotH,
  }));

  const profitPts = data.map((d, i) => ({
    x: pad + i * xStep,
    y: pad + plotH - ((d.netProfit - minVal) / range) * plotH,
  }));

  const smoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}, ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    d += ` L ${pts[pts.length - 1].x.toFixed(1)} ${pts[pts.length - 1].y.toFixed(1)}`;
    return d;
  };

  const areaPath = (pts: { x: number; y: number }[]) => {
    const line = smoothPath(pts);
    if (!line) return '';
    return `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${svgH - pad} L ${pts[0].x.toFixed(1)} ${svgH - pad} Z`;
  };

  // Find peak gross sales point
  const peakIdx = grossValues.reduce((idx, v, i) => (v > grossValues[idx] ? i : idx), 0);
  const peakPt = grossPts[peakIdx];

  // Grid line positions (4 horizontal lines)
  const gridLines = 4;
  const gridY = Array.from({ length: gridLines + 1 }, (_, i) => pad + (plotH / gridLines) * i);

  return (
    <svg
      className="w-full h-full overflow-visible"
      preserveAspectRatio="none"
      viewBox={`0 0 ${svgW} ${svgH}`}
      role="img"
      aria-label="Revenue and prescription yield trend chart"
    >
      <defs>
        <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary-hsl))" stopOpacity={0.25} />
          <stop offset="100%" stopColor="hsl(var(--primary-hsl))" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--tertiary-hsl))" stopOpacity={0.2} />
          <stop offset="100%" stopColor="hsl(var(--tertiary-hsl))" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridY.map((y, i) => (
        <line
          key={i}
          x1={pad}
          x2={svgW - pad}
          y1={y}
          y2={y}
          stroke="hsl(var(--surface-container-highest))"
          strokeDasharray="3,3"
          strokeOpacity={0.5}
        />
      ))}

      {/* Gross Sales Area */}
      <path d={areaPath(grossPts)} fill="url(#salesGradient)" />
      {/* Gross Sales Line */}
      <path
        d={smoothPath(grossPts)}
        fill="none"
        stroke="hsl(var(--primary-hsl))"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Net Profit Area */}
      <path d={areaPath(profitPts)} fill="url(#profitGradient)" />
      {/* Net Profit Line (dashed) */}
      <path
        d={smoothPath(profitPts)}
        fill="none"
        stroke="hsl(var(--tertiary-hsl))"
        strokeWidth={2}
        strokeDasharray="4,2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gross Sales Data Points */}
      {grossPts.map((pt, i) => (
        <circle key={`gross-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill="hsl(var(--primary-hsl))" />
      ))}

      {/* Profit Data Points */}
      {profitPts.map((pt, i) => (
        <circle key={`profit-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill="hsl(var(--tertiary-hsl))" />
      ))}

      {/* Peak marker with tooltip pin */}
      <circle
        cx={peakPt.x}
        cy={peakPt.y}
        r={5}
        fill="hsl(var(--surface-container-lowest))"
        stroke="hsl(var(--primary-hsl))"
        strokeWidth={3}
      />
      <g transform={`translate(${peakPt.x - 110}, -10)`}>
        <rect
          fill="hsl(var(--inverse-surface))"
          rx={6}
          width={115}
          height={42}
          filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
        />
        <text
          fill="hsl(var(--inverse-on-surface))"
          fontFamily="Inter"
          fontSize={10}
          fontWeight={500}
          x={10}
          y={16}
        >
          Friday Record Peak
        </text>
        <text
          fill="hsl(var(--surface-container-lowest))"
          fontFamily="JetBrains Mono"
          fontSize={13}
          fontWeight={700}
          x={10}
          y={32}
        >
          ${grossValues[peakIdx]?.toFixed(2)}
        </text>
      </g>
    </svg>
  );
}
