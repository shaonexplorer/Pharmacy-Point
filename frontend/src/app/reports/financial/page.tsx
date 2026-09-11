'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useFinancialReport } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatCurrency } from '@/lib/formatters';
import { FinancialReportChart } from '@/components/reports/FinancialReportChart';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  RefreshCw,
  Download,
  FileText,
  Calculator,
} from 'lucide-react';
import Link from 'next/link';
import type { FinancialReportResponse } from '@pharmacy-point/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function FinancialReportsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [days, setDays] = useState<number>(DEFAULT_DAYS);
  const [startDate, setStartDate] = useState<string>(() => getDateRange(DEFAULT_DAYS).startDate);
  const [endDate, setEndDate] = useState<string>(() => getDateRange(DEFAULT_DAYS).endDate);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const { data: financialData, isLoading } = useFinancialReport({
    startDate,
    endDate,
    paymentMethod: paymentMethod || undefined,
    status: status || undefined,
    groupBy: 'month',
  });

  // Authentication guard
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  const reportData = financialData as FinancialReportResponse | undefined;
  const summary = reportData?.summary ?? {
    grossRevenue: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    netProfit: 0,
    totalOrders: 0,
    totalUnits: 0,
    averageOrderValue: 0,
    totalRefunds: 0,
    totalExpenses: 0,
  };

  const chartData = financialData ? { summary } : { summary };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
              <Calculator className="h-6 w-6 text-primary" />
              <h1 className="text-headline-lg text-foreground">Financial Reports</h1>
            </div>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Profit & loss analysis, revenue tracking, and financial performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/reports/sales">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sales
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (reportData) {
                  const rows = [
                    ...reportData.data.map((item: any) => ({
                      ...item,
                      type: 'Revenue',
                    })),
                  ];
                  downloadCsv(
                    rows,
                    `financial-report-${new Date().toISOString().split('T')[0]}.csv`
                  );
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-headline-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Report Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 ">
              {/* Date Range */}
              <div className="">
                <label className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  Date Range
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

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── KPI Cards Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Gross Revenue */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-tertiary" />
                Gross Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.grossRevenue)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">{summary.totalOrders} orders</p>
            </CardContent>
          </Card>

          {/* Cost of Goods Sold */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Package className="h-4 w-4 text-warning" />
                Cost of Goods Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.costOfGoodsSold)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {summary.totalUnits} units sold
              </p>
            </CardContent>
          </Card>

          {/* Gross Profit */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                Gross Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.grossProfit)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">revenue minus COGS</p>
            </CardContent>
          </Card>

          {/* Net Profit */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.netProfit)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">after expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Additional KPI Row ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                {formatCurrency(summary.averageOrderValue)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">per transaction</p>
            </CardContent>
          </Card>

          {/* Total Units */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Package className="h-4 w-4 text-tertiary" />
                Total Units Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.totalUnits}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">across all orders</p>
            </CardContent>
          </Card>

          {/* Total Refunds */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Total Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-destructive">
                {formatCurrency(summary.totalRefunds)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">refunded orders</p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Calculator className="h-4 w-4 text-warning" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                purchase order integration coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">Profit & Loss Overview</CardTitle>
            <CardDescription>
              Revenue, COGS, and profit breakdown for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialReportChart data={chartData} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* ── Data Table ── */}
        {reportData && reportData.data.length > 0 && (
          <Card className="border-border bg-card card-elevated overflow-hidden">
            <CardHeader className="bg-surface-container/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Period Breakdown
                  </CardTitle>
                  <CardDescription>Revenue, COGS, and profit by period</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {reportData.data.length} periods
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="text-left px-4 py-3">Period</th>
                      <th className="text-right px-4 py-3">Revenue</th>
                      <th className="text-right px-4 py-3">COGS</th>
                      <th className="text-right px-4 py-3">Profit</th>
                      <th className="text-right px-4 py-3">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {reportData.data.map((item: any) => (
                      <tr
                        key={item.groupLabel}
                        className="hover:bg-surface-container/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-on-surface">{item.groupLabel}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-tertiary">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-warning">
                          {formatCurrency(item.cogs)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-secondary">
                          {formatCurrency(item.profit)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{item.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Empty State ── */}
        {reportData && reportData.data.length === 0 && (
          <Card className="border-border bg-card card-elevated">
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-on-surface-variant">
                No financial data found for the selected period.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          header,
          button,
          .no-print {
            display: none !important;
          }
          main {
            margin: 0;
            padding: 0;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
