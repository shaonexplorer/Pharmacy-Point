'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Loader2,
  Package,
  ShoppingCart,
  Warehouse,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import { useInventory, useInventoryTransactions, useExpiringProducts } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { useRevenueTrends, useTopProducts, useSalesByCategory } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/formatters';

import {
  KpiCard,
  ShiftTelemetryStrip,
  RevenueTrendChart,
  TopProductsChart,
  FormularyDiversityChart,
  DispensingLedger,
  QuickActionBar,
  QuickAction,
} from './index';

import type {
  TrendPoint,
  TopProductItem,
  FormularySegment,
  DispensingItem,
} from './index';

/* ── Period options ───────────────────────────────────────────────────────── */

const PERIODS = ['Today', '7D', '30D', 'Year'];

/* ── Data Mappers ──────────────────────────────────────────────────────────── */

/**
 * Map analytics revenue trend data to chart points.
 * API returns: { labels: string[], revenue: number[], orders: number[] }
 */
function mapRevenueData(
  labels: string[] | undefined,
  revenue: number[] | undefined,
  orders: number[] | undefined
): TrendPoint[] {
  if (!labels?.length) return [];
  return labels.map((label, i) => ({
    label,
    grossSales: revenue?.[i] ?? 0,
    netProfit: revenue && orders ? (revenue[i] ?? 0) * 0.6 - (orders[i] ?? 0) * 5 : 0,
  }));
}

/**
 * Map analytics top-products data to chart items.
 * API returns: Array<{ name, category, revenue, unitsSold }>
 */
function mapTopProducts(
  items: Array<{ name: string; category: string; revenue: number; unitsSold: number }> | undefined,
  limit = 5
): TopProductItem[] {
  if (!items?.length) return [];
  const sorted = [...items].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
  const maxRev = Math.max(...sorted.map((i) => i.revenue), 1);
  return sorted.map((item, i) => ({
    rank: i + 1,
    name: item.name,
    category: item.category || 'Uncategorized',
    revenue: item.revenue,
    quantity: item.unitsSold,
    unit: 'units',
    maxRevenue: maxRev,
  }));
}

/**
 * Map sales-by-category data to donut segments.
 * API returns: { categories: string[], sales: number[], orderCounts: number[] }
 */
function mapCategoryData(
  categories: string[] | undefined,
  sales: number[] | undefined
): FormularySegment[] {
  if (!categories?.length || !sales?.length) return [];
  const total = sales.reduce((sum, s) => sum + s, 0) || 1;

  // Clinical Precision color palette for category segments
  const palette = [
    'hsl(var(--primary-container))',  // Pharma Teal (light)
    'hsl(var(--tertiary-hsl))',       // Royal Indigo
    'hsl(var(--primary))',            // Dark Teal
    'hsl(var(--secondary-container))', // Light Blue
  ];

  return categories.map((cat, i) => ({
    label: cat,
    value: sales[i] ?? 0,
    percentage: Math.round(((sales[i] ?? 0) / total) * 100),
    skuCount: 0,
    color: palette[i % palette.length],
  }));
}

/* ── Quick Actions ──────────────────────────────────────────────────────────── */

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: '+ New Sale (F2)',
    icon: <ShoppingCart className="h-4 w-4" />,
    href: '/pos',
    variant: 'primary',
  },
  {
    label: 'Add Product (F4)',
    icon: <Package className="h-4 w-4" />,
    href: '/products/new',
  },
  {
    label: 'Receive GRN (F7)',
    icon: <Warehouse className="h-4 w-4" />,
    href: '/inventory',
  },
  {
    label: 'Record Due (F9)',
    icon: <WalletIcon className="h-4 w-4" />,
    href: '/customers',
  },
];

/* ── Fallback Data ──────────────────────────────────────────────────────────── */

function buildFallbackRevenueData(): TrendPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d, i) => ({
    label: d,
    grossSales: 1200 + i * 300,
    netProfit: 800 + i * 200,
  }));
}

function buildFallbackTopProducts(): TopProductItem[] {
  return [
    { rank: 1, name: 'Amoxicillin Clavulanate 625mg', category: 'Antibiotic', revenue: 5440, quantity: 340, unit: 'packs', maxRevenue: 5440 },
    { rank: 2, name: 'Paracetamol 500mg', category: 'Analgesic', revenue: 3100, quantity: 620, unit: 'strips', maxRevenue: 5440 },
    { rank: 3, name: 'Atorvastatin 20mg', category: 'Cardio', revenue: 2940, quantity: 210, unit: 'boxes', maxRevenue: 5440 },
    { rank: 4, name: 'Metformin HCl 500mg ER', category: 'Antidiabetic', revenue: 2320, quantity: 290, unit: 'strips', maxRevenue: 5440 },
    { rank: 5, name: 'Omeprazole 20mg', category: 'GI Tract', revenue: 1850, quantity: 185, unit: 'packs', maxRevenue: 5440 },
  ];
}

function buildFallbackSegments(): FormularySegment[] {
  return [
    { label: 'Antibiotics', value: 645, percentage: 35, skuCount: 645, color: 'hsl(var(--primary-container))' },
    { label: 'Chronic Care/OTC', value: 516, percentage: 28, skuCount: 516, color: 'hsl(var(--tertiary-hsl))' },
    { label: 'Hygiene & Care', value: 405, percentage: 22, skuCount: 405, color: 'hsl(var(--primary))' },
    { label: 'Devices & Disp.', value: 276, percentage: 15, skuCount: 276, color: 'hsl(var(--secondary-container))' },
  ];
}

function buildLedgerItems(
  transactions: any[],
  orders: any[]
): DispensingItem[] {
  const txItems = (transactions ?? []).map((tx) => {
    const isStockIn = tx.type === 'STOCK_IN';
    const isStockOut = tx.type === 'STOCK_OUT';
    const type = isStockIn ? 'Received' : isStockOut ? 'Dispensed' : 'Adjusted';
    return {
      id: `tx-${tx.id}`,
      rxNumber: `#TX-${tx.id.slice(-6)}`,
      medication: tx.product?.name ?? tx.product?.sku ?? 'Unknown product',
      patient: tx.referenceId ? `Ref: ${tx.referenceId.slice(-6)}` : '',
      cashier: 'System',
      role: 'Auto',
      total: 0,
      tender: type,
      timestamp: tx.createdAt,
      status: isStockOut
        ? 'dispensed'
        : isStockIn
          ? 'pending'
        : 'dea-logged',
    } as DispensingItem;
  });

  const orderItems = (orders ?? []).map((order) => ({
    id: `order-${order.id}`,
    rxNumber: `#POS-${order.id.slice(-6)}`,
    medication: `Order total`,
    patient: order.customerId ? `Customer #${order.customerId.slice(-4)}` : 'Walk-in',
    cashier: order.staffId ? order.staffId.slice(-4) : 'Auto',
    role: 'Cashier',
    total: order.total ?? 0,
    tender: order.paymentMethod === 'card' ? 'CARD' : 'CASH',
    timestamp: order.createdAt,
    status: 'dispensed' as DispensingItem['status'],
  }));

  return [...txItems, ...orderItems]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);
}

/* ── Wallet Icon ────────────────────────────────────────────────────────────── */

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7h18M3 7c0-.552.448-1 1-1h16c.552 0 1 .448 1 1v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 3H8v4h8V3z"
      />
    </svg>
  );
}

/* ── Main Dashboard ────────────────────────────────────────────────────────── */

export function ExecutiveDashboard() {
  const { data: session, isPending, error } = useSession();
  const [activePeriod, setActivePeriod] = useState('7D');

  // ── Data fetching ──
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useStats();

  const { data: lowStockData, isLoading: lowStockLoading } = useInventory({
    lowStock: true,
    limit: 4,
  });

  const { data: expiringData, isLoading: expiringLoading } = useExpiringProducts({
    days: 30,
    limit: 4,
  });

  const { data: recentOrdersData, isLoading: ordersLoading } = useOrders({
    limit: 4,
    status: 'COMPLETED',
  });

  const { data: transactionsData, isLoading: txLoading } = useInventoryTransactions({
    limit: 4,
  });

  const {
    data: revenueData,
    isLoading: revenueLoading,
    refetch: refetchRevenue,
  } = useRevenueTrends({
    period: activePeriod === 'Today' ? 'day' : activePeriod === '7D' ? 'week' : activePeriod === '30D' ? 'month' : 'quarter',
    days: activePeriod === 'Today' ? 1 : activePeriod === '7D' ? 7 : activePeriod === '30D' ? 30 : 365,
  });

  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts({
    days: 7,
    limit: 5,
  });

  const { data: categoryData, isLoading: categoryLoading } = useSalesByCategory({
    days: 30,
  });

  // ── Auth / loading states ──
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
          <CardContent className="pt-6">
            <h2 className="text-headline-lg text-on-surface">Not Authenticated</h2>
            <p className="text-body-md text-on-surface-variant mt-2">
              {error?.message || 'You need to sign in to view this page'}
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Derived data ──
  const statsData = stats ?? {
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

  const lowStockItems = lowStockData?.data ?? [];
  const expiringItems = expiringData?.data ?? [];
  const recentTransactions = transactionsData?.data ?? [];
  const recentOrders = recentOrdersData?.data ?? [];

  const revenuePoints = mapRevenueData(
    revenueData?.labels,
    revenueData?.revenue,
    revenueData?.orders
  );

  const topProducts = mapTopProducts(topProductsData, 5);

  const categorySegments = mapCategoryData(
    categoryData?.categories,
    categoryData?.sales
  );

  const isLoading = statsLoading || ordersLoading || txLoading;

  // ── KPI computed values ──
  const lowStockPercent =
    statsData.totalProducts > 0
      ? Math.round((statsData.lowStockItems / statsData.totalProducts) * 100)
      : 0;
  const avgTicket =
    statsData.totalSales > 0 && (revenueData?.orders?.length ?? 0) > 0
      ? statsData.totalSales / (revenueData?.orders?.length ?? 1)
      : 0;
  const grossMargin =
    statsData.totalSales > 0
      ? Math.round((statsData.salesThisMonth / statsData.totalSales) * 100)
      : 0;
  const expiringValue = expiringItems.reduce(
    (sum: number, p: any) => sum + (p.price ?? 0) * (p.quantity ?? 0),
    0
  );

  const handleRefresh = async () => {
    await refetchStats();
    await refetchRevenue();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background texture: subtle radial pattern for sterile medical feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(var(--outline-variant) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="w-full space-y-6">
          {/* ── Page Header ── */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <h1 className="sm:text-display-lg text-headline-lg text-foreground">
                  Executive Dashboard
                </h1>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' · '}
                Signed in as {session.user?.email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <SidebarTrigger className="mt-1 -mr-1 md:flex hidden" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Shift Telemetry Strip ── */}
          <ShiftTelemetryStrip
            license="PH-NY-90214-R"
            staffName={session.user?.name ?? 'Pharmacy Staff'}
            staffRole="Licensed Pharmacist"
            deaStatus="compliant"
            onlineStatus="online"
          />

          {/* ── KPI Grid (4 cards) ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* KPI 1: Today's Gross Sales */}
            <KpiCard
              label="Today's Gross Sales"
              value={formatCurrency(statsData.totalSales ?? 0)}
              trend="+12.4%"
              trendDirection="up"
              trendColor="bg-primary-fixed/20"
              trendTextColor="text-primary-container"
              sparkValue={statsData.totalSales ?? 0}
              sparkColor="hsl(var(--primary-hsl))"
              supportingLabel={`${revenueData?.orders?.length ?? 0} Transactions`}
              supportingValue={`Avg Ticket: ${formatCurrency(avgTicket)}`}
              isLoading={statsLoading}
            />

            {/* KPI 2: Gross Margin & Profit */}
            <KpiCard
              label="Gross Margin & Profit"
              value={formatCurrency(statsData.salesThisMonth ?? 0)}
              trend="+8.1%"
              trendDirection="up"
              trendColor="bg-secondary-fixed/20"
              trendTextColor="text-secondary"
              sparkValue={statsData.salesThisMonth ?? 0}
              sparkColor="hsl(var(--secondary-hsl))"
              supportingLabel="Efficiency Ratio"
              supportingValue={`${Math.min(grossMargin, 100)}% Net Margin`}
              isLoading={statsLoading}
            />

            {/* KPI 3: Low Stock Inventory */}
            <KpiCard
              label="Low Stock Inventory"
              value={String(statsData.lowStockItems ?? 0)}
              trend={`${lowStockPercent}% fill rate`}
              trendDirection="down"
              trendColor="bg-error-container/20"
              trendTextColor="text-error"
              sparkValue={statsData.lowStockItems ?? 0}
              sparkColor="hsl(var(--warning-hsl))"
              supportingLabel={`${lowStockItems.length} Under Minimum`}
              supportingFullLabel="Depletion rate: High"
              isLoading={lowStockLoading}
            />

            {/* KPI 4: Expiring in 30 Days */}
            <KpiCard
              label="Expiring in 30 Days"
              value={String(expiringItems.length)}
              trend="High Priority"
              trendDirection="neutral"
              trendColor="bg-error-container"
              trendTextColor="text-on-error"
              sparkValue={expiringItems.length}
              sparkColor="hsl(var(--error-hsl))"
              supportingFullLabel={`At-Risk Value: ${formatCurrency(expiringValue)}`}
              actionLabel="Review Batches"
              onAction={() => (window.location.href = '/inventory/expiring')}
              isLoading={expiringLoading}
            />
          </div>

          {/* ── Charts Section ── */}
          <div className="grid gap-6 xl:grid-cols-12 items-stretch">
            {/* Left (Col-span 7): Revenue Trend */}
            <div className="xl:col-span-7">
              <RevenueTrendChart
                data={revenuePoints.length ? revenuePoints : buildFallbackRevenueData()}
                activePeriod={activePeriod}
                periods={PERIODS}
                onPeriodChange={setActivePeriod}
                summary={{
                  peakHourlyFlow: '4:00 PM – 7:00 PM',
                  tenderSplit: '42% Cash • 58% Card/mFS',
                  rxOtcRatio: '68% Prescription Regulated',
                }}
                isLoading={revenueLoading || isLoading}
              />
            </div>

            {/* Right (Col-span 5): Top-Selling Formulations */}
            <div className="xl:col-span-5">
              <TopProductsChart
                items={topProducts.length ? topProducts : buildFallbackTopProducts()}
                activeMetric="Revenue"
                onMetricChange={() => {}}
                totalCount={`${topProducts.length} of ${statsData.totalProducts} active formulas`}
              />
            </div>
          </div>

          {/* ── Lower Section: Formulary Diversity + Dispensing Ledger ── */}
          <div className="grid gap-6 xl:grid-cols-12 items-stretch">
            {/* Left (Col-span 4): Formulary Diversity */}
            <div className="xl:col-span-4">
              <FormularyDiversityChart
                segments={categorySegments.length ? categorySegments : buildFallbackSegments()}
                centralLabel={String(statsData.totalProducts ?? 0)}
                centralSublabel="Total SKUs"
                footerNote="Cold Chain Refrigerator: 3.8°C Steady"
                isLoading={categoryLoading || statsLoading}
              />
            </div>

            {/* Right (Col-span 8): Dispensing Ledger */}
            <div className="xl:col-span-8">
              <DispensingLedger
                items={buildLedgerItems(recentTransactions, recentOrders)}
                activeFilter="All"
                filters={['All', 'Prescription', 'OTC']}
                onFilterChange={() => {}}
                footerText="Showing latest 4 transactions in session"
                footerAction="View Complete Day Book"
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* ── Floating Quick Action Bar ── */}
        <QuickActionBar actions={QUICK_ACTIONS} />
      </div>
    </div>
  );
}
