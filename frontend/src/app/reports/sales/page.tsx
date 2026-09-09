'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProducts } from '@/hooks/useProducts';
import { useSalesReport, useSalesSummary, useSalesByPaymentMethod } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { SalesReportChart } from '@/components/reports/SalesReportChart';
import {
  Loader2,
  ArrowLeft,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Filter,
  Calendar,
  ChevronDown,
  Download,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

/* ── Default date range ── */
const DEFAULT_DAYS = 30;

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

/* ── CSV Export Helper ──────────────────────────────────── */
function downloadCsv(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvLines = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Clinical Precision — Sales Reports Page (Step 2 of Phase 3)
 *
 * Features:
 * - Filter form with date range, product, category, payment method
 * - KPI cards: total revenue, transaction count, average basket size, total units
 * - Revenue-by-group chart (grouped by day/week/month/category/payment method)
 * - Sales by payment method breakdown
 * - Responsive grid layout
 * - All data fetched from real API endpoints
 * - CSV and PDF export functionality
 */

export default function SalesReportsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Fetch products for filter dropdown
  const { data: productsData } = useProducts({ limit: 100 });

  // Time period state
  const [days, setDays] = useState<number>(DEFAULT_DAYS);
  const [startDate, setStartDate] = useState<string>(() => getDateRange(DEFAULT_DAYS).startDate);
  const [endDate, setEndDate] = useState<string>(() => getDateRange(DEFAULT_DAYS).endDate);
  const [groupBy, setGroupBy] = useState<string>('day');
  const [productFilter, setProductFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');

  // Fetch data
  const { data: reportData, isLoading: isReportLoading } = useSalesReport({
    startDate,
    endDate,
    groupBy,
    productId: productFilter || undefined,
    category: categoryFilter || undefined,
    paymentMethod: paymentFilter || undefined,
    page: 1,
    limit: 50,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useSalesSummary({ days });

  const { data: paymentData } = useSalesByPaymentMethod({ startDate, endDate });

  // Authentication Guard
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  // Compute date range when days change
  useEffect(() => {
    const range = getDateRange(days);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [days]);

  const summary = summaryData ?? {
    totalRevenue: 0,
    transactionCount: 0,
    averageBasketSize: 0,
    totalUnits: 0,
    uniqueProducts: 0,
    uniqueCustomers: 0,
  };

  const chartData = reportData?.data ?? [];

  if (isPending) {
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
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-headline-lg text-foreground">Sales Reports</h1>
            </div>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Detailed sales analytics with flexible grouping and filtering
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/analytics">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Analytics
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-headline-sm flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Date Range */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Quick Period */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Quick Period</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={14}>Last 14 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={60}>Last 60 Days</option>
                  <option value={90}>Last 90 Days</option>
                </select>
              </div>

              {/* Group By */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Group By</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="category">Category</option>
                  <option value="paymentMethod">Payment Method</option>
                </select>
              </div>

              {/* Product Filter */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Product</label>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Products</option>
                  {productsData?.data?.map((p: { id: string; name: string }) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Categories</option>
                  {/* Static categories from known product types */}
                  {['Medications', 'Supplements', 'Personal Care', 'Diagnostics', 'First Aid', 'Herbal Remedies'].map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Payment Method</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

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
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {summary.transactionCount} transactions
              </p>
            </CardContent>
          </Card>

          {/* Average Basket Size */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-secondary" />
                Avg Basket Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.averageBasketSize)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                per transaction
              </p>
            </CardContent>
          </Card>

          {/* Total Units Sold */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Package className="h-4 w-4 text-tertiary" />
                Units Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.totalUnits}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                across {summary.uniqueProducts} products
              </p>
            </CardContent>
          </Card>

          {/* Unique Customers */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Users className="h-4 w-4 text-warning" />
                Unique Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.uniqueCustomers}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                customers in period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Main Chart ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">
              Sales by {groupBy === 'day' ? 'Day' : groupBy === 'week' ? 'Week' : groupBy === 'month' ? 'Month' : groupBy === 'category' ? 'Category' : 'Payment Method'}
            </CardTitle>
            <CardDescription>
              Revenue and order count {startDate && endDate ? `from ${startDate} to ${endDate}` : 'for the selected period'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesReportChart data={chartData} isLoading={isReportLoading} />
          </CardContent>
        </Card>

        {/* ── Payment Method Breakdown ── */}
        {paymentData && paymentData.length > 0 && (
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Sales by Payment Method</CardTitle>
              <CardDescription>Revenue distribution across payment types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {paymentData.map((item: { paymentMethod: string; totalSales: number; orderCount: number }) => (
                  <div
                    key={item.paymentMethod}
                    className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {item.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                      </p>
                      <p className="text-xs text-on-surface-variant">{item.orderCount} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-data-mono text-foreground">
                        {formatCurrency(item.totalSales)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Export Buttons ── */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const exportData = reportData?.data?.map((item: any) => ({
                [groupBy === 'day'
                  ? 'Date'
                  : groupBy === 'week'
                    ? 'Week'
                    : groupBy === 'month'
                      ? 'Month'
                      : groupBy === 'category'
                        ? 'Category'
                        : groupBy === 'paymentMethod'
                          ? 'Payment Method'
                          : 'Date',
                ...(groupBy !== 'paymentMethod' && { 'Total Sales': item.totalSales }),
                ...(groupBy !== 'paymentMethod' && { 'Order Count': item.orderCount }),
                ...(groupBy !== 'paymentMethod' && { Units: item.totalUnits }),
              })) ?? [];
              downloadCsv(exportData, `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
            }}
          >
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>

        {/* ── Action Button ── */}
        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link href="/inventory">
              <Package className="mr-2 h-4 w-4" />
              View Inventory
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}