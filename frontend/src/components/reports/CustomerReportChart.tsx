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
  PieChart,
  Pie,
  Legend,
} from 'recharts';

interface CustomerReportData {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    averageSpend: number;
    totalLifetimeSpend: number;
    totalDueAccounts: number;
    totalDueAmount: number;
    tierDistribution: Record<string, number>;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
  };
  tierDistribution: Array<{ tier: string; count: number; percentage: number }>;
}

interface CustomerReportChartProps {
  data: CustomerReportData;
  isLoading?: boolean;
}

const TIER_COLORS: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
};

const COLORS = ['#00685f', '#006398', '#006b2c', '#89f5e7'];

/**
 * Customer report chart — shows tier distribution and spending breakdown.
 * Uses Clinical Precision: Pharma Teal primary, Medi-Blue secondary, Safety Green tertiary.
 */
export function CustomerReportChart({ data, isLoading }: CustomerReportChartProps) {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-surface-container-low" />;
  }

  const { summary, tierDistribution } = data;

  const tierChartData = tierDistribution.map((item) => ({
    name: item.tier,
    count: item.count,
    percentage: item.percentage,
    color: TIER_COLORS[item.tier] ?? '#8884d8',
  }));

  // Use Active vs Inactive customer split for a meaningful part-of-whole donut.
  // (Average Spend vs Total Lifetime Spend is not a valid pie composition and
  // renders nothing when both values are 0.)
  const donutData = [
    { name: 'Active', value: summary.activeCustomers, color: COLORS[0] },
    { name: 'Inactive', value: summary.inactiveCustomers, color: COLORS[1] },
  ].filter((d) => d.value > 0);

  const donutTotal = donutData.reduce((sum, d) => sum + d.value, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Tier Distribution Bar Chart */}
      <div className="col-span-1">
        <h3 className="text-headline-sm font-semibold text-foreground mb-2">Tier Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={tierChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
            <XAxis
              dataKey="name"
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
            <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Customers">
              {tierChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Status Donut */}
      <div className="col-span-1">
        <h3 className="text-headline-sm font-semibold text-foreground mb-2">Customer Status</h3>
        {donutTotal === 0 ? (
          <div className="h-[250px] w-full flex flex-col items-center justify-center text-on-surface-variant">
            <p className="text-sm">No customer data available</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {donutData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--surface-container))',
                    border: '1px solid hsl(var(--outline-variant))',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${Number(value) || 0} customers`, 'Count']}
                />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: 'hsl(var(--on-surface-variant))', fontSize: 12 }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center lifetime spend label */}
            <div className="text-center mt-2">
              <p className="text-xs text-on-surface-variant">Total Lifetime Spend</p>
              <p className="text-xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.totalLifetimeSpend)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
