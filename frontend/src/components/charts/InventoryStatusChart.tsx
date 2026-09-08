'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface InventoryStatusData {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalInventoryValue: number;
}

interface InventoryStatusChartProps {
  data: InventoryStatusData;
  isLoading?: boolean;
}

const COLORS = ['#006b2c', '#eab308', '#ba1a1a'];

/**
 * Inventory status donut chart — shows the proportion of products
 * in each stock status category.
 *
 * DESIGN.md → Status Chips:
 * - In Stock / Success: tertiary (#006b2c)
 * - Low Stock / Warning: warning (amber)
 * - Out of Stock / Error: error (#ba1a1a)
 */
export function InventoryStatusChart({ data, isLoading }: InventoryStatusChartProps) {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-surface-container-low" />;
  }

  const pieData = [
    { name: 'In Stock', value: data.inStock, color: COLORS[0] },
    { name: 'Low Stock', value: data.lowStock, color: COLORS[1] },
    { name: 'Out of Stock', value: data.outOfStock, color: COLORS[2] },
  ].filter((d) => d.value > 0);

  const total = pieData.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          // @ts-ignore
          label={({ name, percent }) =>
            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={true}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--surface-container))',
            border: '1px solid hsl(var(--outline-variant))',
            borderRadius: '8px',
            fontSize: '14px',
          }}
          // @ts-ignore
          formatter={(value: number) => [`${value} products`, 'Count']}
        />
        <Legend
          formatter={(value: string) =>
            <span style={{ color: 'hsl(var(--on-surface-variant))', fontSize: 12 }}>{value}</span>
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
