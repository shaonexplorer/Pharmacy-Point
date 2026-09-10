'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from 'recharts';

interface RevenueTrendData {
  labels: string[];
  revenue: number[];
  orders: number[];
}

interface RevenueTrendChartProps {
  data: RevenueTrendData;
  isLoading?: boolean;
}

/**
 * Revenue trends line chart — shows revenue and order count over time.
 * Uses Clinical Precision: Pharma Teal for revenue line, Medi-Blue for orders.
 */
export function RevenueTrendChart({ data, isLoading }: RevenueTrendChartProps) {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-surface-container-low" />;
  }

  const chartData = data.labels.map((label, i) => ({
    label,
    revenue: data.revenue[i] ?? 0,
    orders: data.orders[i] ?? 0,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00685f" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00685f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: 'hsl(var(--on-surface-variant))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--outline-variant))' }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12, fill: 'hsl(var(--on-surface-variant))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12, fill: 'hsl(var(--on-surface-variant))' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--surface-container))',
            border: '1px solid hsl(var(--outline-variant))',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#00685f"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          name="Revenue"
          activeDot={{ r: 6, fill: '#00685f' }}
        />
        <Bar
          yAxisId="right"
          dataKey="orders"
          fill="#006398"
          fillOpacity={0.3}
          name="Orders"
          radius={[4, 4, 0, 0]}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
