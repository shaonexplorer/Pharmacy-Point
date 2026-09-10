'use client';

import { ExecutiveDashboard } from '@/components/dashboard';

/**
 * Dashboard page — delegates to the modular ExecutiveDashboard component.
 *
 * The ExecutiveDashboard is composed of:
 *  - ShiftTelemetryStrip: license + DEA compliance status
 *  - KpiCard grid: Today's Gross Sales, Gross Margin, Low Stock, Expiring
 *  - RevenueTrendChart: dual-series SVG line/area chart
 *  - TopProductsChart: horizontal bar chart for top-selling medications
 *  - FormularyDiversityChart: donut chart with category legend
 *  - DispensingLedger: recent transactions table
 *  - QuickActionBar: floating dispensary quick-action bar
 *
 * Design: Clinical Precision theme (DESIGN.md) with layout from
 * @stitch-screens/01-executive-analytics-dashboard.html
 */
export default function DashboardPage() {
  return <ExecutiveDashboard />;
}
