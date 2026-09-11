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
import { InventoryStatusChart } from '@/components/charts/InventoryStatusChart';

interface InventoryReportData {
  summary: {
    totalProducts: number;
    totalInventoryValue: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringCount: number;
    expiredCount: number;
    slowMovingCount: number;
  };
}

interface LowStockByCategory {
  category: string;
  lowStock: number;
  inStock: number;
}

interface InventoryReportChartProps {
  data: InventoryReportData;
  isLoading?: boolean;
}

const COLORS = ['#00685f', '#006398', '#006b2c'];

/**
 * Inventory report chart — shows low stock vs in stock comparison
 * by category, plus an inventory status donut.
 * Uses Clinical Precision: Pharma Teal primary, Medi-Blue secondary, Safety Green tertiary.
 */
export function InventoryReportChart({ data, isLoading }: InventoryReportChartProps) {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-surface-container-low" />;
  }

  const { summary } = data;

  // Build comparison data: in-stock vs low-stock vs out-of-stock per category
  const chartData: LowStockByCategory[] = [
    { category: 'In Stock', inStock: summary.inStockCount, lowStock: 0 },
    { category: 'Low Stock', inStock: 0, lowStock: summary.lowStockCount },
    { category: 'Out of Stock', inStock: 0, lowStock: summary.outOfStockCount },
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
      {/* Low Stock vs Available Inventory Comparison */}
      <div className="col-span-1">
        <h3 className="text-headline-sm font-semibold text-foreground mb-2">
          Stock Status Comparison
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: '#2563EB' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--outline-variant))' }}
            />
            <YAxis tick={{ fontSize: 12, fill: '#2563EB' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--surface-container))',
                border: '1px solid hsl(var(--outline-variant))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Bar
              dataKey="inStock"
              stackId="stock"
              fill="#00685f"
              name="In Stock"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="lowStock"
              stackId="stock"
              fill="#ba1a1a"
              name="Low/Out of Stock"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Status Donut */}
      <div className="col-span-1">
        <h3 className="text-headline-sm font-semibold text-foreground mb-2">
          Inventory Distribution
        </h3>
        <InventoryStatusChart
          data={{
            totalProducts: summary.totalProducts,
            inStock: summary.inStockCount,
            lowStock: summary.lowStockCount,
            outOfStock: summary.outOfStockCount,
            totalInventoryValue: summary.totalInventoryValue,
          }}
        />
      </div>
    </div>
  );
}
