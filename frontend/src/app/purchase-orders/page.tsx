'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableCellMono,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import {
  Loader2,
  Plus,
  Search,
  X,
  ShoppingCart,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { PurchaseOrder } from '@pharmacy-point/types';

/** Status badge configuration — maps POStatus to Clinical Precision colors */
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'warning' | 'destructive' | 'success' }> = {
  PENDING: { label: 'Pending', icon: Clock, variant: 'warning' },
  APPROVED: { label: 'Approved', icon: CheckCircle, variant: 'secondary' },
  RECEIVED: { label: 'Received', icon: Package, variant: 'success' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, variant: 'destructive' },
};

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Purchase Orders Listing Page
 * ──────────────────────────────────────────────────────────────────────────── */

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: response, isLoading, error, refetch } = usePurchaseOrders({
    page: currentPage,
    limit: 20,
  });

  const purchaseOrders: PurchaseOrder[] = response?.data ?? [];
  const totalItems = response?.pagination?.total ?? 0;
  const totalPages = response?.pagination?.totalPages ?? 1;

  // Client-side search across poNumber and supplier name
  const filteredPOs = useMemo(() => {
    if (!searchQuery) return purchaseOrders;
    const q = searchQuery.toLowerCase();
    return purchaseOrders.filter(
      (po) =>
        po.poNumber?.toLowerCase().includes(q) ||
        po.supplier?.name?.toLowerCase().includes(q) ||
        po.supplierRepresentative?.name?.toLowerCase().includes(q)
    );
  }, [purchaseOrders, searchQuery]);

  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      {
        accessorKey: 'poNumber',
        header: 'PO Number',
        cell: ({ row }) => (
          <Link
            href={`/purchase-orders/${row.original.id}`}
            className="font-medium text-secondary hover:underline"
          >
            {row.original.poNumber}
          </Link>
        ),
      },
      {
        accessorKey: 'supplier',
        header: 'Supplier',
        cell: ({ row }) => (
          <span className="text-body-sm text-foreground">
            {row.original.supplier?.name || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'supplierRepresentative',
        header: 'Representative',
        cell: ({ row }) => (
          <span className="text-body-sm text-on-surface-variant">
            {row.original.supplierRepresentative?.name || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ row }) => (
          <TableCellMono>{formatCurrency(row.original.totalAmount)}</TableCellMono>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
          const Icon = config.icon;
          return (
            <Badge variant={config.variant} size="sm" className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'expectedDeliveryDate',
        header: 'Expected Delivery',
        cell: ({ row }) => (
          <TableCellMono>
            {row.original.expectedDeliveryDate
              ? formatDate(row.original.expectedDeliveryDate)
              : '—'}
          </TableCellMono>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <TableCellMono>{formatDate(row.original.createdAt)}</TableCellMono>
        ),
      },
      {
        id: 'items',
        header: 'Items',
        cell: ({ row }) => (
          <TableCellMono>
            {row.original.items?.length ?? 0} item{(row.original.items?.length ?? 0) === 1 ? '' : 's'}
          </TableCellMono>
        ),
      },
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: filteredPOs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({
          pageIndex: currentPage - 1,
          pageSize: 20,
        });
        setCurrentPage(newPagination.pageIndex + 1);
      } else {
        setCurrentPage(updater.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    manualPagination: true,
    pageCount: totalPages,
    rowCount: filteredPOs.length,
  });

  // Redirect to login if not authenticated
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

  if (!session) {
    return null;
  }

  return (
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="w-full space-y-6">
        {/* ── Page Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <h1 className="text-headline-lg text-foreground flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Purchase Orders
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Manage supplier purchase orders and track delivery status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild>
              <Link href="/procurement">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by PO number, supplier, or rep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">
                {error instanceof Error ? error.message : 'Failed to load purchase orders'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !error && purchaseOrders.length === 0 && (
          <Card className="border-border bg-card card-elevated border-dashed">
            <CardContent className="flex min-h-75 flex-col items-center justify-center text-center px-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-headline-md text-foreground">No purchase orders found</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">
                {searchQuery
                  ? 'No purchase orders match your search.'
                  : 'Get started by adding products to the procurement cart.'}
              </p>
              {!searchQuery && (
                <Button asChild className="mt-4">
                  <Link href="/procurement">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Order
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Table ── */}
        {!isLoading && !error && purchaseOrders.length > 0 && (
          <>
            <div className="rounded-xl border border-border bg-card card-elevated">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder ? null : (
                            <div
                              className={`flex items-center gap-1 ${
                                header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                              }`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: ' 🔼',
                                desc: ' 🔽',
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* ── Pagination ── */}
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={filteredPOs.length}
              itemLabel="orders"
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
