/**
 * Dashboard Components — Clinical Precision Design System
 *
 * Barrel export for all dashboard subcomponents based on the
 * Executive Analytics Dashboard design from Stitch.
 * Each component follows the design tokens defined in DESIGN.md
 * (Clinical Precision theme) and the layout from
 * @stitch-screens/01-executive-analytics-dashboard.html.
 *
 * Architecture: Each component is self-contained and reusable,
 * consuming only the Clinical Precision CSS custom properties
 * defined in globals.css.
 */

/* ── Primitives ── */
export { Sparkline, sparklineData } from './Sparkline';

/* ── KPI & Metrics ── */
export { KpiCard, KpiCardSkeleton, type KpiTrend, type KpiCardProps } from './KpiCard';

/* ── Dashboard Sections ── */
export { ExecutiveDashboard } from './ExecutiveDashboard';

/* ── Telemetry ── */
export { ShiftTelemetryStrip, type ShiftTelemetryStripProps } from './ShiftTelemetryStrip';

/* ── Charts ── */
export { RevenueTrendChart, type TrendPoint, type RevenueTrendChartProps } from './RevenueTrendChart';
export { TopProductsChart, type TopProductItem, type TopProductsChartProps } from './TopProductsChart';
export { FormularyDiversityChart, type FormularySegment, type FormularyDiversityChartProps } from './FormularyDiversityChart';

/* ── Tables ── */
export { DispensingLedger, type DispensingItem, type DispensingStatus, type DispensingLedgerProps } from './DispensingLedger';

/* ── Action Bar ── */
export { QuickActionBar, type QuickAction, type QuickActionBarProps } from './QuickActionBar';

/* ── Legacy components retained for other pages ── */
export { TearLine } from './TearLine';
export { StockVial } from './StockVial';
