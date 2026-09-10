'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCustomerReport } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { CustomerReportChart } from '@/components/reports/CustomerReportChart';
import type { CustomerReportResponse } from '@pharmacy-point/types';
import {
  Loader2,
  ArrowLeft,
  Users,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  FileText,
  UserCheck,
  UserX,
  Award,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import type { CustomerReportItem } from '@pharmacy-point/types';

/* ── Helpers ── */
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

/* ── Page ── */
export default function CustomerReportsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Filter state
  const [tierFilter, setTierFilter] = useState<string>('');
  const [activeDays, setActiveDays] = useState<number>(30);
  const [hasDueAccounts, setHasDueAccounts] = useState<string>('');
  const [limit, setLimit] = useState<number>(50);

  const { data: reportData, isLoading } = useCustomerReport({
    tier: tierFilter || undefined,
    activeDays: activeDays > 0 ? activeDays : undefined,
    hasDueAccounts: hasDueAccounts === '' ? undefined : hasDueAccounts === 'true',
    limit,
  });

  // Auth guard
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  const report = reportData as CustomerReportResponse | undefined;

  const summary = report?.summary ?? {
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    averageSpend: 0,
    totalLifetimeSpend: 0,
    totalDueAccounts: 0,
    totalDueAmount: 0,
    tierDistribution: {},
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
  };

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
              <h1 className="text-headline-lg text-foreground">Customer Reports</h1>
            </div>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Customer segmentation, loyalty analytics, and due account metrics
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (report?.customers) {
                  downloadCsv(
                    report.customers as unknown as Record<string, unknown>[],
                    `customer-report-${new Date().toISOString().split('T')[0]}.csv`
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
              <Filter className="h-4 w-4 text-primary" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Tier Filter */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Award className="h-3 w-3" /> Loyalty Tier
                </label>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Tiers</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              {/* Active Days */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Active Window (days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={activeDays}
                  onChange={(e) => setActiveDays(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Due Accounts Filter */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Wallet className="h-3 w-3" /> Due Accounts
                </label>
                <select
                  value={hasDueAccounts}
                  onChange={(e) => setHasDueAccounts(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Customers</option>
                  <option value="true">With Due Accounts</option>
                  <option value="false">No Due Accounts</option>
                </select>
              </div>

              {/* Limit */}
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Results Limit</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── KPI Cards Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Customers */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.totalCustomers}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">registered customers</p>
            </CardContent>
          </Card>

          {/* Active vs Inactive */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-tertiary" />
                Active / Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.activeCustomers} / {summary.inactiveCustomers}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                last 30 days activity
              </p>
            </CardContent>
          </Card>

          {/* Total Lifetime Spend */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-secondary" />
                Lifetime Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {formatCurrency(summary.totalLifetimeSpend)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                avg {formatCurrency(summary.averageSpend)} per customer
              </p>
            </CardContent>
          </Card>

          {/* Due Accounts */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Wallet className="h-4 w-4 text-warning" />
                Due Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.totalDueAccounts}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {formatCurrency(summary.totalDueAmount)} outstanding
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Loyalty Analytics KPI Row ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Points Earned */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Points Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.totalPointsEarned.toLocaleString()}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">total loyalty points</p>
            </CardContent>
          </Card>

          {/* Points Redeemed */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <Award className="h-4 w-4 text-secondary" />
                Points Redeemed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-foreground">
                {summary.totalPointsRedeemed.toLocaleString()}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">points used for discounts</p>
            </CardContent>
          </Card>

          {/* Tier Distribution Summary */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-tertiary" />
                Tier Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {report?.tierDistribution?.map((t) => (
                  <div key={t.tier} className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">{t.tier}</span>
                    <span className="font-mono text-foreground">
                      {t.count} ({t.percentage}%)
                    </span>
                  </div>
                )) ?? (
                  <p className="text-xs text-on-surface-variant">No data</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inactive Customers */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-on-surface-variant flex items-center gap-2">
                <UserX className="h-4 w-4 text-destructive" />
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-data-mono text-destructive">
                {summary.inactiveCustomers}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                no purchases in 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">Customer Analytics</CardTitle>
            <CardDescription>
              Tier distribution and spending breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerReportChart
              data={{ summary, tierDistribution: report?.tierDistribution ?? [] }}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* ── Customer Segmentation Table ── */}
        <Card className="border-border bg-card card-elevated overflow-hidden">
          <CardHeader className="bg-surface-container/60 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Customer Segmentation
                </CardTitle>
                <CardDescription>
                  Customers ordered by lifetime spend
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono">
                {report?.customers?.length ?? 0} customers
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-on-surface-variant">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading customer data…
              </div>
            ) : report?.customers && report.customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-center px-4 py-3">Tier</th>
                      <th className="text-right px-4 py-3">Lifetime Spend</th>
                      <th className="text-right px-4 py-3">Orders</th>
                      <th className="text-right px-4 py-3">Due Amount</th>
                      <th className="text-center px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {report.customers.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-on-surface">{item.name}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">{item.email || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={
                              item.loyaltyTier === 'Platinum'
                                ? 'default'
                                : item.loyaltyTier === 'Gold'
                                ? 'secondary'
                                : item.loyaltyTier === 'Silver'
                                ? 'outline'
                                : 'secondary'
                            }
                            className="font-mono text-xs"
                          >
                            {item.loyaltyTier}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {formatCurrency(item.lifetimeSpend)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {item.orderCount}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {item.dueAmount > 0 ? (
                            <span className="text-warning font-medium">
                              {formatCurrency(item.dueAmount)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={item.isActive ? 'default' : 'secondary'}
                            className="font-mono text-xs"
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-on-surface-variant">No customers found matching the selected criteria.</p>
              </CardContent>
            )}
          </CardContent>
        </Card>
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
