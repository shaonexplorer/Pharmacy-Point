'use client';

import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Package,
  Store,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  Warehouse,
  Plus,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import type { Stats } from '@/hooks/useStats';
import { useInventory, useInventoryTransactions } from '@/hooks/useInventory';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ── Helpers ────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor = 'text-primary',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext: string;
  iconColor?: string;
}) {
  return (
    <Card className="border-border bg-card card-elevated group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10',
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-label-md text-on-surface-variant">{label}</p>
            <p className="text-2xl font-bold text-foreground data-mono">{value}</p>
            {subtext && <p className="text-xs text-on-surface-variant">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Prescription tear-line divider — a dotted border that evokes the
 * perforated edge of a prescription label.
 */
function TearLine({ label }: { label?: string }) {
  return (
    <div className="relative my-6 flex items-center">
      <div className="absolute inset-0 flex items-center">
        <div className="border-t border-dashed border-border w-full" />
      </div>
      {label && (
        <div className="relative mx-auto px-3 py-1 text-label-md text-on-surface-variant bg-card">
          {label}
        </div>
      )}
    </div>
  );
}

/**
 * Medication bottle visualization — a small SVG vial whose fill level
 * and colour communicate stock urgency.
 */
function StockVial({ quantity, lowStock }: { quantity: number; lowStock: number }) {
  const threshold = Math.max(lowStock || 10, 1);
  const isCritical = quantity <= threshold / 2;
  const isLow = quantity <= threshold;

  // Fill the vial to a percentage relative to 2× the low-stock threshold
  const fillPct = Math.min(100, Math.max(0, (quantity / (threshold * 2)) * 100));

  const fillColor = isCritical ? 'hsl(var(--error-hsl))' : isLow ? 'hsl(var(--warning-hsl))' : 'hsl(var(--tertiary-hsl))';

  return (
    <div className="relative mx-auto h-20 w-8">
      {/* Cap */}
      <div className="absolute top-0 left-1/2 -ml-3 h-3 w-6 rounded-b-md bg-foreground" />
      {/* Bottle body */}
      <div className="absolute inset-0 top-3 rounded-full border-2 border-border bg-card/50" />
      {/* Liquid fill */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-300"
        style={{
          height: `${fillPct}%`,
          minHeight: '2px',
          backgroundColor: fillColor,
        }}
      />
    </div>
  );
}

/**
 * Inline SVG bar chart — visualises key pharmacy metrics at a glance
 * without an external charting dependency.
 */
function InventorySnapshot({ stats }: { stats: Stats }) {
  const bars = [
    { label: 'Products', value: stats.totalProducts, color: 'hsl(var(--primary-hsl))' },
    { label: 'Suppliers', value: stats.totalCompanies, color: 'hsl(var(--secondary-hsl))' },
    { label: 'Low Stock', value: stats.lowStockItems, color: 'hsl(var(--warning-hsl))' },
    { label: 'Sold MTD', value: stats.salesThisMonth, color: 'hsl(var(--tertiary-hsl))' },
    { label: 'Received', value: stats.stockInThisMonth ?? 0, color: 'hsl(var(--secondary-hsl))' },
  ];

  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <Card className="border-border bg-card card-elevated">
      <CardHeader>
        <CardTitle className="text-headline-md">Inventory Snapshot</CardTitle>
        <CardDescription className="text-body-md text-on-surface-variant">Key metrics at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bars.map((bar) => {
            const widthPct = (bar.value / maxValue) * 100;
            return (
              <div key={bar.label} className="flex items-center gap-3">
                <span className="w-16 text-label-md text-on-surface-variant">{bar.label}</span>
                <div className="relative flex-1">
                  <div className="h-6 w-full overflow-hidden rounded-md bg-muted/30">
                    <div
                      className="h-full rounded-md transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.max(2, widthPct)}%`,
                        backgroundColor: bar.color,
                      }}
                    />
                  </div>
                </div>
                <span className="w-16 text-right text-sm font-mono font-medium text-foreground">
                  {bar.value}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format an InventoryTransaction type into a coloured badge.
 */
function TransactionTypeBadge({ type }: { type: string }) {
  const config: Record<
    string,
    { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' }
  > = {
    STOCK_IN: { label: 'Received', variant: 'success' },
    STOCK_OUT: { label: 'Dispensed', variant: 'destructive' },
    ADJUSTMENT: { label: 'Adjusted', variant: 'secondary' },
  };
  const cfg = config[type] ?? { label: type, variant: 'secondary' };
  return (
    <Badge variant={cfg.variant} size="sm">
      {cfg.label}
    </Badge>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { data: session, error, isPending } = useSession();
  const { data: statsData, isLoading: statsLoading } = useStats();
  const { data: lowStockData, isLoading: lowStockLoading } = useInventory({
    lowStock: true,
    limit: 4,
  });
  const { data: transactionsData, isLoading: txLoading } = useInventoryTransactions({
    limit: 4,
    type: undefined,
  });

  // Default stats — only used while loading or if API fails
  const fallbackStats: Stats = {
    totalProducts: 0,
    totalCompanies: 0,
    lowStockItems: 0,
    totalSales: 0,
    salesThisMonth: 0,
    totalInventoryValue: 0,
    stockInThisMonth: 0,
    stockOutThisMonth: 0,
  };

  const stats = statsData ?? fallbackStats;
  const lowStockItems = lowStockData?.data ?? [];
  const recentTransactions = transactionsData?.data ?? [];

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Not Authenticated</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error?.message || 'You need to sign in to view this page'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = statsLoading || lowStockLoading || txLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 p-4 sm:p-6">
        <div className="container-max space-y-6">
          {/* ── Header ── */}
          <div className="flex flex-col space-y-1">
            <h1 className="text-display-lg text-foreground">Pharmacy Dashboard</h1>
            <p className="text-body-md text-on-surface-variant">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' · '}Signed in as {session.user?.email}
            </p>
          </div>

          {/* ── Hero Metric: Total Inventory Value ── */}
          <Card className="border-border bg-card card-elevated">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-label-md text-on-surface-variant">Total Inventory Value</p>
                  <p className="text-4xl font-bold text-data-mono text-foreground">
                    {formatCurrency(stats.totalInventoryValue ?? 0)}
                  </p>
                  <p className="text-body-md text-on-surface-variant">
                    {stats.totalProducts} products across {stats.totalCompanies} suppliers
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Warehouse className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <TearLine />

          {/* ── Stat Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Package}
              label="Total Products"
              value={stats.totalProducts.toLocaleString()}
              subtext="Active SKUs"
            />
            <StatCard
              icon={Store}
              label="Suppliers"
              value={stats.totalCompanies.toLocaleString()}
              subtext="Registered vendors"
            />
            <StatCard
              icon={AlertTriangle}
              label="Low Stock"
              value={stats.lowStockItems.toLocaleString()}
              subtext={lowStockItems.length > 0 ? `${lowStockItems.length} shown` : 'No alerts'}
              iconColor="text-warning"
            />
            <StatCard
              icon={TrendingUp}
              label="Units Sold (MTD)"
              value={stats.salesThisMonth.toLocaleString()}
              subtext="Stock-out this month"
            />
          </div>

          {/* ── Quick Actions ── */}
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/pos">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Start POS
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/inventory">
                <Warehouse className="mr-2 h-4 w-4" />
                Manage Inventory
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/inventory?lowStock=true">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Low Stock Alerts
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>

          <TearLine />

          {/* ── Main Content: Chart + Recent Transactions ── */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Inventory Snapshot Chart */}
            {isLoading ? (
              <div className="flex min-h-70 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <InventorySnapshot stats={stats} />
            )}

            {/* Right: Recent Transactions */}
            <Card className="border-border bg-card card-elevated">
              <CardHeader>
                <CardTitle className="text-headline-md">Recent Activity</CardTitle>
                <CardDescription className="text-body-md text-on-surface-variant">
                  Latest {recentTransactions.length} inventory transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {txLoading ? (
                  <div className="flex min-h-50 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="flex min-h-50 items-center justify-center text-center">
                    <div className="space-y-2">
                      <ClipboardList className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                      <p className="text-body-md text-on-surface-variant">
                        No inventory transactions recorded yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-data-mono text-xs text-on-surface-variant">
                              {formatDate(tx.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground">
                                {tx.product?.name ?? '—'}
                              </div>
                              {tx.product?.sku && (
                                <p className="text-xs text-on-surface-variant">{tx.product.sku}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <TransactionTypeBadge type={tx.type} />
                            </TableCell>
                            <TableCellMono className="text-right">
                              {tx.quantity}
                            </TableCellMono>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Low Stock Alerts ── */}
          <div>
            <TearLine label="Low Stock Alerts" />

            {lowStockLoading ? (
              <div className="flex min-h-30 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : lowStockItems.length === 0 ? (
              <Card className="border-border bg-card card-elevated">
                <CardContent className="flex min-h-30 flex-col items-center justify-center text-center p-6">
                  <AlertTriangle className="h-8 w-8 text-tertiary mb-2" />
                  <p className="text-body-md text-on-surface-variant">
                    All stock levels are healthy. No low-stock items to display.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lowStockItems.map((product) => {
                  const isCritical = product.quantity <= (product.lowStock || 10) / 2;
                  const statusVariant = isCritical ? 'destructive' : 'warning';
                  return (
                    <Card key={product.id} className="border-border bg-card card-elevated">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Medication bottle visualisation */}
                          <StockVial
                            quantity={product.quantity}
                            lowStock={product.lowStock || 10}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground truncate">{product.name}</p>
                              <Badge variant={statusVariant} size="sm">
                                {isCritical ? 'Critical' : 'Low'}
                              </Badge>
                            </div>
                            <p className="text-xs text-on-surface-variant font-mono">
                              SKU: {product.sku}
                            </p>
                            <p className="text-body-md text-on-surface-variant">
                              {product.quantity} units remaining
                              {' · '}threshold: {product.lowStock}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href="/inventory">
                              <Warehouse className="mr-1 h-3 w-3" />
                              Restock
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm" className="flex-1">
                            <Link href={`/products/${product.id}`}>
                              <FileText className="mr-1 h-3 w-3" />
                              Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
