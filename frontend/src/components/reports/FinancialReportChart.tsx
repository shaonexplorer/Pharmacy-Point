'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';

interface FinancialReportData {
  summary: {
    grossRevenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    netProfit: number;
    totalOrders: number;
    totalUnits: number;
    averageOrderValue: number;
    totalRefunds: number;
    totalExpenses: number;
  };
}

interface FinancialReportChartProps {
  data: FinancialReportData;
  isLoading?: boolean;
}

const COLORS = ['#00685f', '#006398', '#006b2c', '#89f5e7'];

/**
 * Financial report chart — shows revenue vs COGS vs profit by period.
 * Uses Clinical Precision: Pharma Teal primary, Medi-Blue secondary, Safety Green tertiary.
 */
export function FinancialReportChart({ data, isLoading }: FinancialReportChartProps) {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-surface-container-low" />;
  }

  const { summary } = data;

  const chartData = [
    { name: 'Revenue', value: summary.grossRevenue, color: COLORS[0] },
    { name: 'COGS', value: summary.costOfGoodsSold, color: COLORS[1] },
    { name: 'Gross Profit', value: summary.grossProfit, color: COLORS[2] },
    { name: 'Net Profit', value: summary.netProfit, color: COLORS[3] },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Revenue vs Profit Bar Chart */}
      <div className="col-span-1">
        <h3 className="text-headline-sm font-semibold text-foreground mb-2">
          Profit & Loss Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'hsl(var(--on-surface-variant))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--outline-variant))' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--on-surface-variant))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--surface-container))',
                border: '1px solid hsl(var(--outline-variant))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Amount']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Amount">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Margin Donut */}
      <div className="col-span-1">
        <h3 className="text-headline-sm font-semibold text-foreground mb-2">
          Margin Overview
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { name: 'Gross Margin', value: summary.grossRevenue > 0 ? (summary.grossProfit / summary.grossRevenue) * 100 : 0 },
              { name: 'Net Margin', value: summary.grossRevenue > 0 ? (summary.netProfit / summary.grossRevenue) * 100 : 0 },
            ]}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: 'hsl(var(--on-surface-variant))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
            />
            <YAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'hsl(var(--on-surface-variant))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--outline-variant))' }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--surface-container))',
                border: '1px solid hsl(var(--outline-variant))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${(Number(value) || 0).toFixed(1)}%`, 'Margin']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Margin %">
              <Cell fill="#00685f" />
              <Cell fill="#006398" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
