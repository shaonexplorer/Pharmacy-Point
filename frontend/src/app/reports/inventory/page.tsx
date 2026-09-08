'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useInventoryReport } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatCurrency } from '@/lib/formatters';
import { InventoryReportChart } from '@/components/reports/InventoryReportChart';
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  Clock,
  TrendingDown,
  Download,
  FileText,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { InventoryReportResponse } from '@pharmacy-point/types';

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

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function InventoryReportsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [slowMovingDays, setSlowMovingDays] = useState(30);
  const [expiryDays, setExpiryDays] = useState(30);

  const { data: inventoryData, isLoading } = useInventoryReport({
    slowMovingDays,
    expiryDays,
  });

  // Authentication guard
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  const reportData = inventoryData as InventoryReportResponse | undefined;

  const summary = reportData?.summary ?? {
    totalProducts: 0,
    totalInventoryValue: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    slowMovingCount: 0,
  };

  const chartData = inventoryData ? { summary } : { summary: summary };

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
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-headline-lg text-foreground">Inventory Reports</h1>
            </div>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Stock levels, low-stock alerts, slow-moving items, and expiry warnings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/inventory">
                <Package className="mr-2 h-4 w-4" />
                View Inventory
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (reportData) {
                  const rows = [
                    ...reportData.lowStockItems.map((item: any) => ({ ...item, status: 'Low Stock' })),
                    ...reportData.slowMovingItems.map((item: any) => ({ ...item, status: 'Slow Moving' })),
                    ...reportData.expiringItems.map((item: any) => ({ ...item, status: 'Expiring Soon' })),
                  ];
                  downloadCsv(rows, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Slow-Moving Window (days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={slowMovingDays}
                  onChange={(e) => setSlowMovingDays(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Expiry Warning Window (days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── KPI Cards Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.totalProducts}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">all active products</p>
            </CardContent>
          </Card>

          {/* Total Inventory Value */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-secondary" />
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.totalInventoryValue)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">total at current price</p>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.lowStockCount}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">products below threshold</p>
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Clock className="h-4 w-4 text-destructive" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.expiringCount}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">within warning window</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Additional KPI Row ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Out of Stock */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Package className="h-4 w-4 text-destructive" />
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-destructive">
                {summary.outOfStockCount}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">zero inventory</p>
            </CardContent>
          </Card>

          {/* Slow Moving */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-warning" />
                Slow Moving
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.slowMovingCount}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">no sales in {slowMovingDays}d</p>
            </CardContent>
          </Card>

          {/* Expired */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-destructive">
                {summary.expiredCount}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">past expiry date</p>
            </CardContent>
          </Card>

          {/* In Stock */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Package className="h-4 w-4 text-tertiary" />
                In Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.inStockCount}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">above threshold</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">Stock Status Overview</CardTitle>
            <CardDescription>
              Low stock vs available inventory and stock distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryReportChart data={chartData} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* ── Low Stock Items ── */}
        {reportData && reportData.lowStockItems.length > 0 && (
          <Card className="border-border bg-card card-elevated overflow-hidden">
            <CardHeader className="bg-surface-container/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Low Stock Items
                  </CardTitle>
                  <CardDescription>Products below their reorder threshold</CardDescription>
                </div>
                <Badge variant="warning" className="font-mono">{reportData.lowStockItems.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-left px-4 py-3">SKU</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-right px-4 py-3">Qty</th>
                      <th className="text-right px-4 py-3">Price</th>
                      <th className="text-right px-4 py-3">Value</th>
                      <th className="text-center px-4 py-3">Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {reportData.lowStockItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-on-surface">{item.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{item.sku}</td>
                        <td className="px-4 py-3 text-xs">{item.category || '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-destructive font-medium">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(item.quantity * item.price)}</td>
                        <td className="px-4 py-3 text-center text-xs">
                          {item.expiryDate ? (
                            <span className={new Date(item.expiryDate) < new Date() ? 'text-destructive font-medium' : 'text-on-surface-variant'}>
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Slow Moving Items ── */}
        {reportData && reportData.slowMovingItems.length > 0 && (
          <Card className="border-border bg-card card-elevated overflow-hidden">
            <CardHeader className="bg-surface-container/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-warning" />
                    Slow-Moving Items
                  </CardTitle>
                  <CardDescription>No completed sales in the last {slowMovingDays} days</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">{reportData.slowMovingItems.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-left px-4 py-3">SKU</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-right px-4 py-3">Qty</th>
                      <th className="text-right px-4 py-3">Price</th>
                      <th className="text-right px-4 py-3">Value</th>
                      <th className="text-center px-4 py-3">Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {reportData.slowMovingItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-on-surface">{item.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{item.sku}</td>
                        <td className="px-4 py-3 text-xs">{item.category || '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(item.quantity * item.price)}</td>
                        <td className="px-4 py-3 text-center text-xs">
                          {item.expiryDate ? (
                            <span className={new Date(item.expiryDate) < new Date() ? 'text-destructive font-medium' : 'text-on-surface-variant'}>
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Expiring Soon Items ── */}
        {reportData && reportData.expiringItems.length > 0 && (
          <Card className="border-border bg-card card-elevated overflow-hidden">
            <CardHeader className="bg-surface-container/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-destructive" />
                    Expiring Soon
                  </CardTitle>
                  <CardDescription>Products expiring within {expiryDays} days</CardDescription>
                </div>
                <Badge variant="destructive" className="font-mono">{reportData.expiringItems.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-left px-4 py-3">SKU</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-right px-4 py-3">Qty</th>
                      <th className="text-right px-4 py-3">Price</th>
                      <th className="text-right px-4 py-3">Value</th>
                      <th className="text-center px-4 py-3">Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {reportData.expiringItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-on-surface">{item.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{item.sku}</td>
                        <td className="px-4 py-3 text-xs">{item.category || '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(item.quantity * item.price)}</td>
                        <td className="px-4 py-3 text-center text-xs text-destructive font-medium">
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Empty State ── */}
        {reportData && reportData.lowStockItems.length === 0 && reportData.slowMovingItems.length === 0 && reportData.expiringItems.length === 0 && (
          <Card className="border-border bg-card card-elevated">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-on-surface-variant">No inventory alerts found. Your stock levels look healthy.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          header, button, .no-print { display: none !important; }
          main { margin: 0; padding: 0; max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
