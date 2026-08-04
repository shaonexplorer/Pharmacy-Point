'use client';

import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Package,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  FileText,
  UserPlus,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import type { Stats, InventoryTransaction, Order } from '@pharmacy-point/types';
import { useInventory, useInventoryTransactions } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency, formatTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ── Helpers ────────────────────────────────────────────────────────── */

/**
 * Deterministic sparkline data derived from a metric value.
 * Produces a smooth wave whose amplitude is proportional to the value —
 * used purely for visual trend indication on KPI cards.
 */
function sparklineData(value: number, count = 6): number[] {
  const base = Math.max(12, value % 48);
  return Array.from({ length: count }, (_, i) => {
    const wave = Math.sin(i * 0.9) * 8 + Math.cos(i * 0.5) * 4;
    return Math.max(4, Math.round(base + wave));
  });
}

/**
 * Minimal inline-SVG sparkline — a single smooth path with a soft gradient fill.
 * No external charting dependency; height is 20px to fit inside a KPI card.
 *
 * DESIGN.md → KPI Cards: "Small sparkline or bar chart on KPI cards using
 * primary_color or tertiary_color."
 */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;

  const w = 80;
  const h = 20;
  const pad = 2;
  const plotH = h - 2 * pad;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * w,
    y: pad + plotH - ((d - min) / range) * plotH,
  }));

  // Smooth path via quadratic beziers between midpoints
  let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    path += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}, ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  path += ` L ${pts[pts.length - 1].x.toFixed(1)} ${pts[pts.length - 1].y.toFixed(1)}`;
  const areaPath = `${path} L ${pts[pts.length - 1].x.toFixed(1)} ${h} L ${pts[0].x.toFixed(1)} ${h} Z`;

  const gradId = `spark-${color.replace(/[^a-z0-9]/gi, '-')}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={path}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * KPI card with an inline sparkline and Clinical Precision color coding.
 *
 * DESIGN.md → KPI Cards:
 *  - Primary metric: headline-md (20px, 600 weight, 28px line-height)
 *  - Description: label-md (12px, 600 weight, 0.05em tracking)
 *  - Container: Surface Level 1 with rounded-lg (16px)
 *  - Sparkline uses primary_color or tertiary_color
 */
function KpiCard({
  icon: Icon,
  label,
  value,
  subtext,
  sparkColor,
  sparkValue,
  iconColor = 'text-primary',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext: string;
  sparkColor: string;
  sparkValue: number;
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
        <div className="mt-3">
          <Sparkline data={sparklineData(sparkValue)} color={sparkColor} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Quick-action card — a tappable Card that navigates to a workflow.
 *
 * DESIGN.md → Quick Actions: "Cards for 'Add Product,' 'New Order,' 'Stock
 * Adjustment,' 'Add Customer.'"
 */
function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
  iconColor,
  iconBg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Card className="border-border bg-card card-elevated transition-shadow duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)]">
      <CardContent className="p-4">
        <Link href={href} className="group block">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                iconBg
              )}
            >
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-medium text-foreground group-hover:text-primary transition-colors'
                )}
              >
                {label}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
            </div>
          </div>
        </Link>
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

  const fillColor = isCritical
    ? 'hsl(var(--error-hsl))'
    : isLow
      ? 'hsl(var(--warning-hsl))'
      : 'hsl(var(--tertiary-hsl))';

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
function InventorySnapshot({ stats, isLoading }: { stats: Stats; isLoading: boolean }) {
  const bars = [
    { label: 'Products', value: stats.totalProducts, color: 'hsl(var(--primary-hsl))' },
    { label: 'Suppliers', value: stats.totalCompanies, color: 'hsl(var(--secondary-hsl))' },
    { label: 'Low Stock', value: stats.lowStockItems, color: 'hsl(var(--warning-hsl))' },
    {
      label: 'Sales (MTD)',
      value: stats.stockOutThisMonth ?? 0,
      color: 'hsl(var(--tertiary-hsl))',
    },
    { label: 'Received', value: stats.stockInThisMonth ?? 0, color: 'hsl(var(--secondary-hsl))' },
  ];

  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <Card className="border-border bg-card card-elevated">
      <CardHeader>
        <CardTitle className="text-headline-md">Inventory Snapshot</CardTitle>
        <CardDescription className="text-body-md text-on-surface-variant">
          Key metrics at a glance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex min-h-70 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Unified activity timeline item — merges inventory transactions and orders
 * into a single chronological feed.
 */
interface ActivityItem {
  id: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  badgeLabel: string;
  badgeVariant: 'success' | 'warning' | 'secondary' | 'destructive' | 'default';
}

/**
 * Merge inventory transactions and recent orders into a sorted activity feed.
 */
function buildActivityItems(
  transactions: InventoryTransaction[] | undefined,
  orders: Order[] | undefined
): ActivityItem[] {
  const txItems: ActivityItem[] = (transactions ?? []).map((tx) => {
    const isStockIn = tx.type === 'STOCK_IN';
    const isStockOut = tx.type === 'STOCK_OUT';
    return {
      id: `tx-${tx.id}`,
      timestamp: tx.createdAt,
      icon: isStockIn ? Package : isStockOut ? ShoppingCart : Warehouse,
      iconColor: isStockIn ? 'text-tertiary' : isStockOut ? 'text-secondary' : 'text-warning',
      iconBg: isStockIn ? 'bg-tertiary/10' : isStockOut ? 'bg-secondary/10' : 'bg-warning/10',
      title: isStockIn ? 'Stock received' : isStockOut ? 'Sale dispensed' : 'Stock adjusted',
      description: tx.product?.name ?? tx.product?.sku ?? 'Unknown product',
      badgeLabel: isStockIn ? 'Received' : isStockOut ? 'Dispensed' : 'Adjusted',
      badgeVariant: isStockIn ? 'success' : isStockOut ? 'destructive' : 'secondary',
    };
  });

  const orderItems: ActivityItem[] = (orders ?? []).map((order) => ({
    id: `order-${order.id}`,
    timestamp: order.createdAt,
    icon: ShoppingCart,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Order completed',
    description: `Order #${order.id.slice(-6)} · ${formatCurrency(order.total)}`,
    badgeLabel: 'Completed',
    badgeVariant: 'success',
  }));

  return [...txItems, ...orderItems]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);
}

/* ── Dashboard ──────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { data: session, error, isPending } = useSession();
  const { data: statsData, isLoading: statsLoading } = useStats();

  // Low stock items for KPI subtext + alerts section
  const { data: lowStockData, isLoading: lowStockLoading } = useInventory({
    lowStock: true,
    limit: 4,
  });

  // Pending orders count (just need pagination.total)
  const { data: pendingOrdersData } = useOrders({ status: 'PENDING', limit: 1 });

  // Recent completed orders for the activity timeline
  const { data: recentOrdersData, isLoading: ordersLoading } = useOrders({
    limit: 4,
    status: 'COMPLETED',
  });

  // Recent inventory transactions for the activity timeline
  const { data: transactionsData, isLoading: txLoading } = useInventoryTransactions({
    limit: 4,
  });

  const fallbackStats: Stats = {
    totalProducts: 0,
    totalCompanies: 0,
    lowStockItems: 0,
    totalSales: 0,
    salesThisMonth: 0,
    totalInventoryValue: 0,
    stockInThisMonth: 0,
    stockOutThisMonth: 0,
    pendingOrders: 0,
  };

  const stats = statsData ?? fallbackStats;
  const lowStockItems = lowStockData?.data ?? [];
  const recentTransactions = transactionsData?.data ?? [];
  const recentOrders = recentOrdersData?.data ?? [];
  const pendingOrdersCount = pendingOrdersData?.pagination?.total ?? 0;

  const activityItems = buildActivityItems(recentTransactions, recentOrders);

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

  const isLoading = statsLoading || ordersLoading || txLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full space-y-6">
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

          {/* ── KPI Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={Package}
              label="Total Products"
              value={stats.totalProducts.toLocaleString()}
              subtext="Active SKUs"
              sparkColor="hsl(var(--primary-hsl))"
              sparkValue={stats.totalProducts}
              iconColor="text-primary"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Low Stock"
              value={stats.lowStockItems.toLocaleString()}
              subtext={lowStockItems.length > 0 ? `${lowStockItems.length} shown` : 'No alerts'}
              sparkColor="hsl(var(--warning-hsl))"
              sparkValue={stats.lowStockItems}
              iconColor="text-warning"
            />
            <KpiCard
              icon={TrendingUp}
              label="Total Sales"
              value={formatCurrency(stats.totalSales ?? 0)}
              subtext="All completed orders"
              sparkColor="hsl(var(--tertiary-hsl))"
              sparkValue={Math.round(stats.totalSales ?? 0)}
              iconColor="text-tertiary"
            />
            <KpiCard
              icon={Clock}
              label="Pending Orders"
              value={pendingOrdersCount.toLocaleString()}
              subtext="Awaiting fulfillment"
              sparkColor="hsl(var(--secondary-hsl))"
              sparkValue={pendingOrdersCount}
              iconColor="text-secondary"
            />
          </div>

          {/* ── Quick Action Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              icon={Package}
              label="Add Product"
              description="Register a new medication"
              href="/products/new"
              iconColor="text-secondary"
              iconBg="bg-secondary/10"
            />
            <QuickActionCard
              icon={ShoppingCart}
              label="New Order"
              description="Start point of sale"
              href="/pos"
              iconColor="text-primary"
              iconBg="bg-primary/10"
            />
            <QuickActionCard
              icon={Warehouse}
              label="Stock Adjustment"
              description="Adjust inventory levels"
              href="/inventory"
              iconColor="text-warning"
              iconBg="bg-warning/10"
            />
            <QuickActionCard
              icon={UserPlus}
              label="Add Customer"
              description="Register a new customer"
              href="/customers/new"
              iconColor="text-secondary"
              iconBg="bg-secondary/10"
            />
          </div>

          <TearLine />

          {/* ── Main Content: Chart + Recent Activity ── */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Inventory Snapshot Chart */}
            <InventorySnapshot stats={stats} isLoading={isLoading} />

            {/* Right: Recent Activity */}
            <Card className="border-border bg-card card-elevated">
              <CardHeader>
                <CardTitle className="text-headline-md">Recent Activity</CardTitle>
                <CardDescription className="text-body-md text-on-surface-variant">
                  Latest inventory transactions and orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex min-h-70 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : activityItems.length === 0 ? (
                  <div className="flex min-h-70 items-center justify-center text-center">
                    <div className="space-y-2">
                      <ClipboardList className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                      <p className="text-body-md text-on-surface-variant">
                        No recent activity recorded yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 ">
                    {activityItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="flex items-start gap-3">
                          <div
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                              item.iconBg
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{item.title}</p>
                              <Badge variant={item.badgeVariant} size="sm">
                                {item.badgeLabel}
                              </Badge>
                            </div>
                            <p className="text-sm text-on-surface-variant truncate">
                              {item.description}
                            </p>
                          </div>
                          <time className="text-xs text-on-surface-variant whitespace-nowrap ml-auto">
                            {formatTime(item.timestamp)}
                          </time>
                        </div>
                      );
                    })}
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
