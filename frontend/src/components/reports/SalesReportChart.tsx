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
} from 'recharts';

interface SalesReportData {
  data: Array<{
    groupLabel: string;
    totalSales: number;
    orderCount: number;
    totalUnits: number;
  }>;
  isLoading?: boolean;
}

// Clinical Precision palette — hex colors matching the design system tokens.
// Using hex (not CSS vars) because Recharts applies Cell fill via SVG
// presentation attributes which don't reliably resolve var() in all browsers.
const COLORS = [
  '#00685f', // Pharma Teal — primary
  '#006398', // Medi-Blue — secondary
  '#006b2c', // Safety Green — tertiary
  '#ca8a04', // Amber — warning
];

/**
 * Sales report bar chart — shows revenue by day/week/month/category/payment method.
 * Uses Clinical Precision: Pharma Teal primary bars, Medi-Blue accents.
 */
export function SalesReportChart({ data, isLoading }: SalesReportData) {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-surface-container-low" />;
  }

  const chartData = data.map((item) => ({
    name: item.groupLabel,
    sales: item.totalSales,
    orders: item.orderCount,
    units: item.totalUnits,
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
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'hsl(var(--on-surface-variant))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--outline-variant))' }}
          angle={-20}
          textAnchor="end"
          height={60}
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
          // @ts-ignore
          formatter={(value: number, name: string) => [
            name === 'sales' ? formatCurrency(value) : value,
            name === 'sales' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Units',
          ]}
        />
        <Bar
          dataKey="sales"
          fill="#00685f"
          radius={[4, 4, 0, 0]}
          name="Revenue"
        >
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
