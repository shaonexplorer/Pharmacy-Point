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

interface TopProduct {
  name: string;
  category: string;
  revenue: number;
  unitsSold: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
  isLoading?: boolean;
}

const COLORS = ['#00685f', '#006398', '#006b2c', '#89f5e7', '#008378'];

/**
 * Top products horizontal bar chart — shows best-selling products by revenue.
 */
export function TopProductsChart({ data, isLoading }: TopProductsChartProps) {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-surface-container-low" />;
  }

  const chartData = data.map((product) => ({
    name: product.name.length > 20 ? product.name.slice(0, 20) + '…' : product.name,
    revenue: product.revenue,
    units: product.unitsSold,
    fullName: product.name,
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
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: 'hsl(var(--on-surface-variant))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: 'hsl(var(--on-surface-variant))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--outline-variant))' }}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--surface-container))',
            border: '1px solid hsl(var(--outline-variant))',
            borderRadius: '8px',
            fontSize: '14px',
          }}
          // @ts-ignore
          formatter={(value: number, name: string) =>
            [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Units Sold']
          }
          // @ts-ignore
          labelFormatter={(label: string) => {
            const item = chartData.find((d) => d.name === label);
            return item?.fullName ?? label;
          }}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} name="Revenue">
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
