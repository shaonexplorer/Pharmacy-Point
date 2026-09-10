'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  Loader2,
  ArrowLeft,
  FileText,
  Search,
  X,
  ShoppingCart,
  User,
  Pill,
  Package,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import type { OrderWithItems } from '@pharmacy-point/types';

const PRESCRIPTION_CATEGORY = 'Prescription Medications';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded' },
  { value: 'RETURNED', label: 'Returned' },
] as const;

/**
 * Clinical Precision — Prescriptions Tracking Page
 *
 * A focused view of orders containing prescription medications, with
 * status tracking, filtering by status, and quick search by order number
 * or customer name.
 *
 * Design spec (DESIGN.md → Clinical Precision):
 *  - prescription-border-l accent on page header
 *  - Data tables: no zebra striping, 1px hairline #f1f5f9 dividers
 *  - Status badges with clinical color coding
 *  - data-mono for numerical values (totals, quantities, prices)
 *  - Responsive grid with sidebar trigger for mobile
 */
export default function PrescriptionsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useOrders({
    page: 1,
    limit: 100,
  });

  // Search by order ID substring or customer name
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const allOrders = (ordersData?.data ?? []) as OrderWithItems[];

  // Filter: prescription-related orders + search + status
  const filteredOrders = useMemo(() => {
    let rows = allOrders.filter((order) =>
      order.items.some((item) => item.product?.category === PRESCRIPTION_CATEGORY)
    );

    // Search by order ID or customer name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          order.customer?.name?.toLowerCase().includes(q) ||
          order.items.some((item) => item.product?.name?.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      rows = rows.filter((order) => order.status === statusFilter);
    }

    return rows;
  }, [allOrders, searchQuery, statusFilter]);

  // Paginate client-side
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Auth redirect
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  /* ── KPI Summary ── */
  const pendingCount = allOrders.filter((o) => o.status === 'PENDING').length;
  const completedCount = allOrders.filter((o) => o.status === 'COMPLETED').length;
  const returnedCount = allOrders.filter((o) => o.status === 'RETURNED').length;
  const totalPrescriptionValue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-background sm:max-w-7xl mx-auto">
      <div className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          {/* ── Page Header (signature: prescription-border-l accent) ── */}
          <div className="flex items-start justify-between">
            <div className="prescription-border-l pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary/10">
                  <Pill className="h-5 w-5 text-tertiary" />
                </div>
                <div>
                  <h1 className="text-headline-lg text-foreground">Prescriptions</h1>
                  <p className="text-body-md text-on-surface-variant">
                    Prescription order tracking and dispensing history
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hidden md:flex" />
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card card-elevated">
              <CardContent className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md text-on-surface-variant">Pending</p>
                    <p className="text-2xl font-bold text-data-mono text-foreground">
                      {pendingCount}
                    </p>
                    <p className="text-xs text-on-surface-variant">Awaiting dispensing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card card-elevated">
              <CardContent className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tertiary/10">
                    <Package className="h-5 w-5 text-tertiary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md text-on-surface-variant">Completed</p>
                    <p className="text-2xl font-bold text-data-mono text-foreground">
                      {completedCount}
                    </p>
                    <p className="text-xs text-on-surface-variant">Dispensed orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card card-elevated">
              <CardContent className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                    <ShoppingCart className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md text-on-surface-variant">Returned</p>
                    <p className="text-2xl font-bold text-data-mono text-foreground">
                      {returnedCount}
                    </p>
                    <p className="text-xs text-on-surface-variant">Products returned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card card-elevated">
              <CardContent className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md text-on-surface-variant">Total Value</p>
                    <p className="text-2xl font-bold text-data-mono text-foreground">
                      {formatCurrency(totalPrescriptionValue)}
                    </p>
                    <p className="text-xs text-on-surface-variant">All prescription orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Filter Bar ── */}
          <Card className="border-border bg-card card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-headline-sm flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Filters
              </CardTitle>
              <CardDescription>Search and filter prescription orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by order ID, customer, or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-1">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      <X className="mr-1 h-3 w-3" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Prescription Orders Table ── */}
          <Card className="border-border bg-card card-elevated overflow-hidden">
            <CardHeader className="bg-surface-container/40 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-headline-sm">Prescription Orders</CardTitle>
                  <CardDescription>
                    {paginatedOrders?.length} of {filteredOrders?.length} prescription orders
                    {searchQuery && (
                      <>
                        {' '}
                        matching <span className="font-medium">&quot;{searchQuery}&quot;</span>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-6 text-center text-destructive">
                  Failed to load orders. Try refreshing.
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Pill className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-body-md text-on-surface-variant">
                    No prescription orders found.
                  </p>
                  {hasActiveFilters && (
                    <Button variant="link" size="sm" onClick={handleClearFilters} className="mt-2">
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        <tr>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Order #</th>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Customer</th>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Medications</th>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Staff</th>
                          <th className="text-right px-4 py-3 whitespace-nowrap">Total</th>
                          <th className="text-center px-4 py-3 whitespace-nowrap">Status</th>
                          <th className="text-center px-4 py-3 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {paginatedOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-surface-container/40 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs text-on-surface-variant">
                                #{order.id.slice(-8)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-on-surface-variant" />
                                <span className="text-sm font-medium text-foreground">
                                  {order.customer?.name ?? 'Walk-in'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                {order.items
                                  .filter(
                                    (item) => item.product?.category === PRESCRIPTION_CATEGORY
                                  )
                                  .slice(0, 2)
                                  .map((item) => (
                                    <div key={item.id} className="flex justify-between gap-4">
                                      <span className="text-sm text-foreground">
                                        {item.product?.name ?? 'Unknown'}
                                      </span>
                                      <span className="font-mono text-xs text-on-surface-variant">
                                        {item.quantity}x
                                      </span>
                                    </div>
                                  ))}
                                {order.items.filter(
                                  (item) => item.product?.category === PRESCRIPTION_CATEGORY
                                ).length > 2 && (
                                  <span className="text-xs text-on-surface-variant">
                                    +
                                    {order.items.filter(
                                      (item) => item.product?.category === PRESCRIPTION_CATEGORY
                                    ).length - 2}{' '}
                                    more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {order.user?.name ? (
                                <span className="text-sm text-foreground">{order.user.name}</span>
                              ) : (
                                <span className="text-sm text-on-surface-variant">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <span className="font-mono text-sm font-medium text-foreground">
                                {formatCurrency(order.total)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <OrderStatusBadge status={order.status} />
                              {order.isCreditSale && (
                                <Badge
                                  variant="secondary"
                                  size="sm"
                                  className="mt-1 block w-fit mx-auto text-xs"
                                >
                                  Credit
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                                <Link href={`/orders/${order.id}`}>
                                  <FileText className="h-3.5 w-3.5" />
                                  <span className="ml-1 text-xs">View</span>
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-border/40 p-3">
                    <DataTablePagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={filteredOrders.length}
                      pageSize={paginatedOrders.length}
                      itemLabel="prescription orders"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
