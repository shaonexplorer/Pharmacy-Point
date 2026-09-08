'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useStats } from '@/hooks/useStats';
import {
  useAnalytics,
  useRevenueTrends,
  useSalesByCategory,
  useInventoryAnalytics,
  useTopProducts,
} from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import {
  RevenueTrendChart,
  SalesByCategoryChart,
  InventoryStatusChart,
  TopProductsChart,
} from '@/components/charts';
import {
  Loader2,
  ArrowLeft,
  BarChart3,
  Package,
  TrendingUp,
  ShoppingCart,
  Warehouse,
  DollarSign,
  Users,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

/* ── Time period options ── */
const TIME_PERIODS = ['day', 'week', 'month', 'quarter'] as const;
const DEFAULT_DAYS: Record<string, number> = {
  day: 1,
  week: 7,
  month: 30,
  quarter: 90,
};

/**
 * Clinical Precision — Analytics & Reports Page (Step 1 of Phase 3)
 *
 * Features:
 * - KPI cards: daily/weekly/monthly sales, inventory health, top products
 * - Revenue trends line chart
 * - Sales by category bar chart
 * - Inventory status pie chart
 * - Top products table
 * - Responsive grid layout
 * - All data fetched from real API endpoints
 *
 * Design spec (DESIGN.md → "4. Sales & Analytics Reports"):
 *  - Revenue Overview: large chart showing sales trends over time.
 *  - Top Products: table with data-mono for quantities and prices.
 *  - Category Breakdown: pie or donut chart.
 *  - Time Filtering: controls to view data by day, week, month, or custom range.
 *
 * Signature element: prescription-border-l (4px Pharma Teal left accent)
 * on the page header reinforces the clinical identity.
 */

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: statsData } = useStats();
  const { isLoading: isStatsLoading } = useStats();

  // Time period state
  const [period, setPeriod] = useState<string>('month');
  const days = DEFAULT_DAYS[period] ?? 30;

  // Fetch analytics data
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalytics({
    period,
    days,
  });
  const { data: revenueData, isLoading: isRevenueLoading } = useRevenueTrends({
    period,
    days,
  });
  const { data: categoryData, isLoading: isCategoryLoading } = useSalesByCategory({ days });
  const { data: inventoryData, isLoading: isInventoryLoading } = useInventoryAnalytics();
  const { data: topProductsData, isLoading: isTopProductsLoading } = useTopProducts({
    days,
    limit: 5,
  });

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

  const overview = analyticsData?.overview ?? {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    stockOutThisPeriod: 0,
    newCustomers: 0,
  };
  const inventoryStatus = inventoryData ?? {
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalInventoryValue: 0,
  };
  const topProducts = topProductsData ?? [];

  return (
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-headline-lg text-foreground">Analytics &amp; Reports</h1>
            </div>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Data-driven insights for pharmacy management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Period Filter ── */}
        <div className="flex flex-wrap gap-2">
          {TIME_PERIODS.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>

        {/* ── KPI Cards Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(overview.totalRevenue)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {overview.totalOrders} orders this period
              </p>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-secondary" />
                Avg Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(overview.avgOrderValue)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Per transaction
              </p>
            </CardContent>
          </Card>

          {/* New Customers */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Users className="h-4 w-4 text-tertiary" />
                New Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {overview.newCustomers}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Registered this period
              </p>
            </CardContent>
          </Card>

          {/* Inventory Health */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-warning" />
                Inventory Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {inventoryStatus.inStock}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                in stock · {inventoryStatus.lowStock} low · {inventoryStatus.outOfStock} out
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Grid ── */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full">
          {/* Revenue Trends Chart */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Revenue Trends</CardTitle>
              <CardDescription>
                {period === 'day' ? 'Daily' : period === 'week' ? 'Weekly' : period === 'quarter' ? 'Quarterly' : 'Monthly'} revenue over the last {days} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart data={revenueData ?? { labels: [], revenue: [], orders: [] }} isLoading={isRevenueLoading} />
            </CardContent>
          </Card>

          {/* Inventory Status Chart */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Inventory Status</CardTitle>
              <CardDescription>Stock distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryStatusChart data={inventoryStatus} isLoading={isInventoryLoading} />
            </CardContent>
          </Card>
        </div>

        {/* ── Sales by Category & Top Products ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sales by Category */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Sales by Category</CardTitle>
              <CardDescription>Revenue distribution by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesByCategoryChart
                data={categoryData ?? { categories: [], sales: [], orderCounts: [] }}
                isLoading={isCategoryLoading}
              />
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Top Products</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <TopProductsChart data={topProducts} isLoading={isTopProductsLoading} />
            </CardContent>
          </Card>
        </div>

        {/* ── Low Stock Alerts ── */}
        {inventoryStatus.lowStock > 0 && (
          <div>
            <Card className="border-border bg-card card-elevated">
              <CardHeader>
                <CardTitle className="text-headline-md flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>
                  {inventoryStatus.lowStock} product(s) below minimum stock threshold
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Quick inventory summary bars */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Low Stock Items</p>
                      <p className="text-data-mono text-foreground font-bold">{inventoryStatus.lowStock}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Out of Stock</p>
                      <p className="text-data-mono text-foreground font-bold">{inventoryStatus.outOfStock}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-tertiary/5 border border-tertiary/20">
                    <Package className="h-5 w-5 text-tertiary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Total Products</p>
                      <p className="text-data-mono text-foreground font-bold">{inventoryStatus.totalProducts}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Action Button ── */}
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/inventory">
              <Package className="mr-2 h-4 w-4" />
              View Full Inventory
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
