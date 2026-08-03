'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProducts } from '@/hooks/useProducts';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, BarChart3, Package } from 'lucide-react';
import Link from 'next/link';

// Static mock metrics (Extracting outside render loop prevents re-creation on render)
const ANALYTICS_SUMMARY = {
  avgBasketValue: 84.5,
  profitMargin: 32.4,
  totalOrders: 1284,
  inventoryTurn: 12.5,
};

const TOP_SELLERS = [
  {
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    units: '420 units',
    revenue: '$12,400',
    change: '+12%',
    positive: true,
  },
  {
    name: 'Lipitor 20mg',
    category: 'Cholesterol',
    units: '385 units',
    revenue: '$9,150',
    change: '+8%',
    positive: true,
  },
  {
    name: 'Metformin 850mg',
    category: 'Diabetes',
    units: '310 units',
    revenue: '$7,820',
    change: '-3%',
    positive: false,
  },
  {
    name: 'Aspirin 81mg',
    category: 'OTC',
    units: '290 units',
    revenue: '$2,400',
    change: '+15%',
    positive: true,
  },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { isLoading: isStatsLoading } = useStats();

  // Authentication Guard
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  if (isPending || isStatsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                <BarChart3 className="h-6 w-6 text-primary" />
                Analytics & Reports
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View sales performance and inventory insights
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* KPI Cards Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Average Basket Value */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Basket Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${ANALYTICS_SUMMARY.avgBasketValue.toFixed(2)}
                </div>
                <p className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className="text-emerald-600 font-medium">▲ +4.2%</span>
                  <span>from last month</span>
                </p>
              </CardContent>
            </Card>

            {/* Profit Margin */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {ANALYTICS_SUMMARY.profitMargin}%
                </div>
                <p className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className="text-emerald-600 font-medium">▲ +1.8%</span>
                  <span>from last month</span>
                </p>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {ANALYTICS_SUMMARY.totalOrders.toLocaleString()}
                </div>
                <p className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className="text-destructive font-medium">▼ -0.5%</span>
                  <span>from last month</span>
                </p>
              </CardContent>
            </Card>

            {/* Inventory Turnover */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Inventory Turn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {ANALYTICS_SUMMARY.inventoryTurn}x
                </div>
                <p className="text-xs text-muted-foreground">Optimal</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts & Insights */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Sales Chart Placeholder */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Monthly Sales vs Targets
                </CardTitle>
                <CardDescription>January through June performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex h-40 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    Monthly Sales Chart Placeholder
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Day', 'Week', 'Month'].map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        className="rounded border border-input px-3 py-1 text-sm transition-colors hover:bg-muted"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Sellers Table */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Top Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-left">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Product
                          </th>
                          <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Category
                          </th>
                          <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Units Sold
                          </th>
                          <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Revenue
                          </th>
                          <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {TOP_SELLERS.map((item) => (
                          <tr key={item.name}>
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                              {item.category}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {item.units}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-foreground">
                              {item.revenue}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm font-medium ${
                                item.positive ? 'text-emerald-600' : 'text-destructive'
                              }`}
                            >
                              {item.change}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Showing {TOP_SELLERS.length} of {TOP_SELLERS.length} products
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Peak Sales Hours */}
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Peak Sales Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  Peak Hours Heatmap Placeholder
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-end">
            <Button asChild>
              <Link href="/inventory">
                <Package className="mr-2 h-4 w-4" />
                View Full Inventory
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
