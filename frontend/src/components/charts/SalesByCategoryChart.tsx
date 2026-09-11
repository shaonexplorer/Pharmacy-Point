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

interface SalesByCategoryData {
  categories: string[];
  sales: number[];
  orderCounts: number[];
}

interface SalesByCategoryChartProps {
  data: SalesByCategoryData;
  isLoading?: boolean;
}

const COLORS = [
  '#00685f',
  '#006398',
  '#006b2c',
  '#89f5e7',
  '#cce5ff',
  '#7ffc97',
  '#93ccff',
  '#6bd8cb',
];

/**
 * Sales by category bar chart — shows revenue distribution across product categories.
 * Uses Clinical Precision color tokens for the bars.
 */
export function SalesByCategoryChart({ data, isLoading }: SalesByCategoryChartProps) {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-surface-container-low" />;
  }

  const chartData = data.categories.map((category, i) => ({
    category,
    sales: data.sales[i] ?? 0,
    orders: data.orderCounts[i] ?? 0,
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
          dataKey="category"
          tick={{ fontSize: 11, fill: '#2563EB' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--outline-variant))' }}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#2563EB' }}
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
          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
        />
        <Bar dataKey="sales" radius={[4, 4, 0, 0]} name="Revenue">
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
