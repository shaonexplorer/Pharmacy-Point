'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Package,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import type { Stats, InventoryItem } from '@pharmacy-point/types';
import { useInventory, useInventoryTransactions } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  KpiCard,
  KpiCardSkeleton,
  QuickActionCard,
  TearLine,
  InventorySnapshot,
  ActivityTimeline,
  LowStockAlerts,
} from '@/components/dashboard';

/* ── Constants ────────────────────────────────────────────────────────── */

interface KpiCardSpec {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  getValue: (stats: Stats) => string;
  getSubtext: (stats: Stats, lowStockItems: InventoryItem[]) => string;
  sparkColor: string;
  getSparkValue: (stats: Stats) => number;
  iconColor: string;
  iconBg: string;
}

const KPI_CARDS: KpiCardSpec[] = [
  {
    icon: Package,
    label: 'Total Products',
    getValue: (stats) => stats.totalProducts.toLocaleString(),
    getSubtext: () => 'Active SKUs',
    sparkColor: 'hsl(var(--primary-hsl))',
    getSparkValue: (stats) => stats.totalProducts,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    icon: AlertTriangle,
    label: 'Low Stock',
    getValue: (stats) => stats.lowStockItems.toLocaleString(),
    getSubtext: (_stats, lowStockItems) =>
      lowStockItems.length > 0 ? `${lowStockItems.length} shown` : 'No alerts',
    sparkColor: 'hsl(var(--warning-hsl))',
    getSparkValue: (stats) => stats.lowStockItems,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
  },
  {
    icon: TrendingUp,
    label: 'Total Sales',
    getValue: (stats) => formatCurrency(stats.totalSales ?? 0),
    getSubtext: () => 'All completed orders',
    sparkColor: 'hsl(var(--tertiary-hsl))',
    getSparkValue: (stats) => Math.round(stats.totalSales ?? 0),
    iconColor: 'text-tertiary',
    iconBg: 'bg-tertiary/10',
  },
  {
    icon: Clock,
    label: 'Pending Orders',
    getValue: (stats) => (stats.pendingOrders ?? 0).toLocaleString(),
    getSubtext: () => 'Awaiting fulfillment',
    sparkColor: 'hsl(var(--secondary-hsl))',
    getSparkValue: (stats) => stats.pendingOrders ?? 0,
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
  },
];

const QUICK_ACTIONS = [
  {
    icon: Package,
    label: 'Add Product',
    description: 'Register a new medication',
    href: '/products/new',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
  },
  {
    icon: ShoppingCart,
    label: 'New Order',
    description: 'Start point of sale',
    href: '/pos',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    icon: Warehouse,
    label: 'Stock Adjustment',
    description: 'Adjust inventory levels',
    href: '/inventory',
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
  },
  {
    icon: UserPlus,
    label: 'Add Customer',
    description: 'Register a new customer',
    href: '/customers/new',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
  },
] as const;

/* ── Dashboard Page ──────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { data: session, error, isPending } = useSession();
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useStats();

  // Low stock items for KPI subtext + alerts section
  const { data: lowStockData, isLoading: lowStockLoading } = useInventory({
    lowStock: true,
    limit: 4,
  });

  // Recent completed orders for the activity timeline
  const { data: recentOrdersData, isLoading: ordersLoading } = useOrders({
    limit: 4,
    status: 'COMPLETED',
  });

  // Recent inventory transactions for the activity timeline
  const { data: transactionsData, isLoading: txLoading } = useInventoryTransactions({
    limit: 4,
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

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

  const isLoading = statsLoading || ordersLoading || txLoading;

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

  return (
    <div className="min-h-screen bg-background sm:max-w-7xl mx-auto">
      {/* Subtle prescription-grid texture: evokes medical prescription pads */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(var(--outline-variant)_1px,transparent_1px)] bg-size-[24px_24px] mask-[linear-gradient(to_bottom,black,transparent_20%,transparent_80%,black)]" />

      <div className="sm:container-max mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="w-full space-y-6">
          {/* ── Header ── */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Warehouse className="h-5 w-5 text-primary" />
                </div>
                <h1 className="sm:text-display-lg text-foreground">Pharmacy Dashboard</h1>
              </div>
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

            <div className="flex items-center gap-2">
              {/* Sidebar toggle (desktop collapse/expand) */}
              <SidebarTrigger className="mt-1 -mr-1 md:flex hidden" />
              {/* Refresh button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                className="h-8"
              >
                <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              </Button>
            </div>
          </div>

          {/* ── Hero Metric: Total Inventory Value ── */}
          <Card className="relative overflow-hidden border-border bg-card">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-tertiary/5" />
            </div>
            <CardContent className="relative px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-label-md text-on-surface-variant">Total Inventory Value</p>
                  <p className="text-4xl font-bold text-data-mono text-foreground">
                    {formatCurrency(stats.totalInventoryValue ?? 0)}
                  </p>
                  <p className="text-body-md text-on-surface-variant">
                    {stats.totalProducts} products across {stats.totalCompanies} suppliers
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Warehouse className="h-6 w-6 text-primary" />
                </div>
              </div>
              {/* Subtle "breathing" bar — evokes medical monitor vitals */}
              <div className="mt-3 h-1 w-full max-w-50 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full w-3/4 rounded-full bg-tertiary transition-all duration-500"
                  style={{
                    animation: 'breath 3s ease-in-out infinite',
                    animationDelay: '0.5s',
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <TearLine />

          {/* ── KPI Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KPI_CARDS.map((card, i) => {
              const { icon: Icon, label } = card;
              const sparkValue = card.getSparkValue(stats);
              const sparkColor = card.sparkColor;

              if (isLoading) {
                return <KpiCardSkeleton key={card.label} className="animate-delay-[100ms]" />;
              }

              return (
                <div
                  key={card.label}
                  className="animate-in fade-in slide-in-from-bottom"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <KpiCard
                    icon={Icon}
                    label={label}
                    value={card.getValue(stats)}
                    subtext={card.getSubtext(stats, lowStockItems)}
                    sparkColor={sparkColor}
                    sparkValue={sparkValue}
                    iconColor={card.iconColor}
                    iconBg={card.iconBg}
                    isLoading={false}
                    className="h-full"
                  />
                </div>
              );
            })}
          </div>

          {/* ── Quick Action Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action, i) => (
              <div
                key={action.label}
                className="animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${(i + 4) * 75}ms` }}
              >
                <QuickActionCard
                  icon={action.icon}
                  label={action.label}
                  description={action.description}
                  href={action.href}
                  iconColor={action.iconColor}
                  iconBg={action.iconBg}
                />
              </div>
            ))}
          </div>

          <TearLine />

          {/* ── Main Content: Chart + Recent Activity ── */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Inventory Snapshot Chart */}
            <InventorySnapshot stats={stats} isLoading={isLoading} />

            {/* Right: Recent Activity */}
            <ActivityTimeline
              transactions={recentTransactions}
              orders={recentOrders}
              isLoading={isLoading}
            />
          </div>

          {/* ── Low Stock Alerts ── */}
          <div>
            <TearLine label="Low Stock Alerts" />
            <LowStockAlerts items={lowStockItems} isLoading={lowStockLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
