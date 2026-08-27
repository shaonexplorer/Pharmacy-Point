'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableCellMono,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  ArrowLeft,
  BarChart3,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Analytics & Reports Page
 *
 * Design spec (DESIGN.md → "4. Sales & Analytics Reports"):
 *  - Revenue Overview: large chart showing sales trends over time.
 *  - Top Products: table with data-mono for quantities and prices.
 *  - Time Filtering: controls to view data by day, week, month, or custom range.
 *
 * Signature element: prescription-border-l (4px Pharma Teal left accent)
 * on the page header reinforces the clinical identity.
 * ────────────────────────────────────────────────────────────────────────── */

/* ── Mock metrics (static, prevents re-creation on render) ────────────────── */
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

/* ── Time period options ── */
const TIME_PERIODS = ['Day', 'Week', 'Month', 'Quarter'] as const;

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { isLoading: isStatsLoading } = useStats();
  const [timeFilter, setTimeFilter] = useState('Month');

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
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className=" space-y-6">
        {/* ── Page Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-headline-lg text-foreground">Analytics &amp; Reports</h1>
            </div>
            <p className="mt-1 text-body-md text-on-surface-variant">
              View sales performance and inventory insights.
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

        {/* ── KPI Cards Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Average Basket Value */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant">
                Average Basket Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(ANALYTICS_SUMMARY.avgBasketValue)}
              </div>
              <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                <TrendingUp className="h-3 w-3 text-tertiary" />
                <span className="text-tertiary font-medium">+4.2%</span>
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>

          {/* Profit Margin */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant">Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {ANALYTICS_SUMMARY.profitMargin}%
              </div>
              <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                <TrendingUp className="h-3 w-3 text-tertiary" />
                <span className="text-tertiary font-medium">+1.8%</span>
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {ANALYTICS_SUMMARY.totalOrders.toLocaleString()}
              </div>
              <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                <TrendingDown className="h-3 w-3 text-warning" />
                <span className="text-warning font-medium">-0.5%</span>
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>

          {/* Inventory Turnover */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant">
                Inventory Turn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {ANALYTICS_SUMMARY.inventoryTurn}x
              </div>
              <p className="flex items-center gap-1 text-xs">
                <span className="text-tertiary font-medium">Optimal</span>
                <span className="text-on-surface-variant">turnover rate</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts & Insights ── */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full">
          {/* Monthly Sales Chart */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Monthly Sales vs Targets</CardTitle>
              <CardDescription>January through June performance</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <div className="space-y-4">
                {/* Chart placeholder with Clinical Precision styling */}
                <div className="relative h-44 w-full rounded-lg bg-surface-container-low border border-border flex items-end gap-1 p-3 overflow-hidden">
                  <div className="absolute inset-0 flex items-end gap-1 p-3">
                    {[40, 65, 45, 80, 55, 70].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end">
                        <div
                          className="w-full rounded-t-sm bg-primary/60 transition-all duration-300 hover:bg-primary/80"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="relative z-1 h-full w-full flex items-end">
                    {[40, 65, 45, 80, 55, 70].map((_, i) => (
                      <div key={i} className="flex-1 border-t border-primary/30" />
                    ))}
                  </div>
                </div>
                {/* Time period filters */}
                <div className="flex flex-wrap gap-2">
                  {TIME_PERIODS.map((period) => (
                    <Button
                      key={period}
                      variant={timeFilter === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeFilter(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Sellers Table */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Top Sellers</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Units Sold</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {TOP_SELLERS.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                          <TableCell className="capitalize text-on-surface-variant">
                            {item.category}
                          </TableCell>
                          <TableCell className="text-on-surface-variant">{item.units}</TableCell>
                          <TableCellMono>{item.revenue}</TableCellMono>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 font-medium',
                                item.positive ? 'text-tertiary' : 'text-warning'
                              )}
                            >
                              {item.positive ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {item.change}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Showing {TOP_SELLERS.length} of {TOP_SELLERS.length} products
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Category Breakdown</CardTitle>
              <CardDescription>Sales distribution by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-lg bg-surface-container-low border border-border flex items-end gap-1 p-3">
                  {[60, 35, 25, 15].map((height, i) => {
                    const colors = [
                      'bg-primary/70',
                      'bg-secondary/70',
                      'bg-tertiary/70',
                      'bg-warning/70',
                    ];
                    const labels = ['Antibiotics', 'Cholesterol', 'Diabetes', 'OTC'];
                    return (
                      <div
                        key={labels[i]}
                        className="flex flex-col items-center flex-1 h-full justify-end"
                      >
                        <div
                          className={cn(
                            'w-full rounded-t-sm transition-all duration-300 hover:opacity-80',
                            colors[i % colors.length]
                          )}
                          style={{ height: `${height}%` }}
                        />
                        <span className="mt-1 text-xs text-on-surface-variant">{labels[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peak Sales Hours */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Peak Sales Hours</CardTitle>
              <CardDescription>Busiest times for dispensing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 6 }, (_, i) => {
                  const hours = ['8-10', '10-12', '12-14', '14-16', '16-18', '18-20'];
                  const intensity = [20, 45, 80, 65, 40, 15][i];
                  return (
                    <div key={hours[i]} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-secondary/70 transition-all duration-300 hover:bg-secondary/90"
                        style={{ height: `${intensity}%` }}
                      />
                      <span className="text-xs text-on-surface-variant">{hours[i]}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Additional Insights ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Analytics */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Customer Analytics
              </CardTitle>
              <CardDescription>New vs returning customer distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-label-md text-on-surface-variant">New Customers</span>
                  <span className="text-data-mono text-foreground font-medium">68%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-label-md text-on-surface-variant">Returning Customers</span>
                  <span className="text-data-mono text-foreground font-medium">32%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-1/3 rounded-full bg-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest dispensing events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tertiary/10">
                    <Package className="h-3.5 w-3.5 text-tertiary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">Stock received: Amoxicillin 500mg</p>
                    <p className="text-xs text-on-surface-variant">420 units · 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                    <Package className="h-3.5 w-3.5 text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">Sale dispensed: Lipitor 20mg</p>
                    <p className="text-xs text-on-surface-variant">385 units · 3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">Order completed: #ORD-8F3A12</p>
                    <p className="text-xs text-on-surface-variant">Total: $124.50 · 4 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
