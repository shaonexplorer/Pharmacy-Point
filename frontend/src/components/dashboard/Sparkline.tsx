'use client';

import { useMemo, useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Deterministic sparkline data derived from a metric value.
 * Produces a smooth wave whose amplitude is proportional to the value —
 * used purely for visual trend indication on KPI cards.
 */
export function sparklineData(value: number, count = 6): number[] {
  const base = Math.max(12, value % 48);
  return Array.from({ length: count }, (_, i) => {
    const wave = Math.sin(i * 0.9) * 8 + Math.cos(i * 0.5) * 4;
    return Math.max(4, Math.round(base + wave));
  });
}

interface SparklineProps {
  /** Data points for the sparkline chart */
  data: number[];
  /** Color for the line and gradient (use Clinical Precision HSL tokens) */
  color: string;
  /** Optional className for the SVG wrapper */
  className?: string;
  /** Whether to animate the draw on mount */
  animate?: boolean;
}

/**
 * Minimal inline-SVG sparkline — a single smooth path with a soft gradient fill.
 * No external charting dependency; height is 20px to fit inside a KPI card.
 *
 * DESIGN.md → KPI Cards: "Small sparkline or bar chart on KPI cards using
 * primary_color or tertiary_color."
 *
 * Enhanced with a smooth draw-on-mount animation for visual polish.
 */
export function Sparkline({ data, color, className, animate = true }: SparklineProps) {
  const uid = useId();

  const { path, areaPath, pathLength, gradId } = useMemo(() => {
    if (!data.length) {
      return { path: '', areaPath: '', pathLength: 80, gradId: '' };
    }

    const w = 80;
    const h = 20;
    const pad = 2;
    const plotH = h - 2 * pad;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const pts = data.map((d, i) => ({
      x: (i / (data.length - 1)) * w,
      y: pad + plotH - ((d - min) / range) * plotH,
    }));

    // Smooth path via quadratic beziers between midpoints
    let pathStr = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      pathStr += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}, ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    pathStr += ` L ${pts[pts.length - 1].x.toFixed(1)} ${pts[pts.length - 1].y.toFixed(1)}`;
    const areaPathStr = `${pathStr} L ${pts[pts.length - 1].x.toFixed(1)} ${h} L ${pts[0].x.toFixed(1)} ${h} Z`;

    // Compute total path length for stroke-dasharray animation
    const totalLength = computePathLength(pathStr, w);
    const safeGradId = `spark-${uid}`;

    return {
      path: pathStr,
      areaPath: areaPathStr,
      pathLength: totalLength,
      gradId: safeGradId,
    };
  }, [data, uid]);

  if (!data.length || !path) return null;

  return (
    <svg
      width={80}
      height={20}
      viewBox="0 0 80 20"
      className={cn('overflow-visible', className)}
      role="img"
      aria-label="Trend sparkline"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} className="transition-opacity duration-300" />
      <path
        d={path}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={animate ? pathLength : undefined}
        strokeDashoffset={animate ? pathLength : undefined}
        className="draw-in"
        style={animate ? { animationDuration: `${pathLength / 40}s` } : undefined}
      />
    </svg>
  );
}

/**
 * Approximate the total length of an SVG path for stroke-dasharray animation.
 * Parses M, Q, and L commands to sum segment lengths.
 */
function computePathLength(pathStr: string, w: number): number {
  const commands = pathStr.match(/[MLQ][^MLQ]*/g);
  if (!commands) return w;

  let total = 0;
  let lastX = 0;
  let lastY = 0;

  for (const cmd of commands) {
    const type = cmd[0];
    const nums = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat);

    if (type === 'M' && nums.length >= 2) {
      lastX = nums[0];
      lastY = nums[1];
    } else if (type === 'L' && nums.length >= 2) {
      total += Math.hypot(nums[0] - lastX, nums[1] - lastY);
      lastX = nums[0];
      lastY = nums[1];
    } else if (type === 'Q' && nums.length >= 4) {
      // Approximate quadratic bezier length via polyline sampling
      const x0 = lastX;
      const y0 = lastY;
      const x1 = nums[0];
      const y1 = nums[1];
      const x2 = nums[2];
      const y2 = nums[3];

      let prevX = x0;
      let prevY = y0;
      for (let i = 1; i <= 10; i++) {
        const t = i / 10;
        const xt = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * x1 + t ** 2 * x2;
        const yt = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * y1 + t ** 2 * y2;
        total += Math.hypot(xt - prevX, yt - prevY);
        prevX = xt;
        prevY = yt;
      }
      lastX = x2;
      lastY = y2;
    }
  }

  return total || w;
}
