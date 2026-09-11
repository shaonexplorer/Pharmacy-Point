'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatCurrency } from '@/lib/formatters';
import { useOrders } from '@/hooks/useOrders';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { OrderWithItems, OrderStatus } from '@pharmacy-point/types';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);

  const { data, isLoading, isError, error } = useOrders({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    limit: 20,
  });

  const orders: OrderWithItems[] = data?.data ?? [];

  // Client-side search filter
  const filteredOrders = useMemo(() => {
    if (!globalFilter.trim()) return orders;
    const q = globalFilter.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.customer?.name?.toLowerCase().includes(q) ||
        order.customer?.phone?.toLowerCase().includes(q)
    );
  }, [orders, globalFilter]);

  const columns: ColumnDef<OrderWithItems>[] = [
    {
      accessorKey: 'id',
      header: 'Order #',
      cell: ({ getValue }) => {
        const id = getValue() as string;
        return <span className="text-data-mono font-medium">#{id.slice(0, 8)}</span>;
      },
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ getValue }) => {
        const customer = getValue() as OrderWithItems['customer'];
        const name = customer?.name ?? 'Walk-in';
        const phone = customer?.phone;
        return (
          <div>
            <span className="text-body-md text-foreground">{name}</span>
            {phone && <span className="block text-xs text-on-surface-variant">{phone}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return (
          <span className="text-sm text-on-surface-variant">{new Date(date).toLocaleString()}</span>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ getValue }) => {
        const total = getValue() as number;
        return <span className="text-data-mono font-medium">{formatCurrency(total)}</span>;
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ getValue }) => {
        const method = getValue() as string | null;
        const variant = method === 'card' ? 'secondary' : 'outline';
        return (
          <Badge variant={variant} className="text-xs uppercase">
            {method ?? 'cash'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue() as OrderStatus;
        return <OrderStatusBadge status={status} />;
      },
    },
    {
      accessorKey: 'id',
      header: '',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Link href={`/orders/${order.id}`}>
            <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary">
              View
            </Button>
          </Link>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: false,
    enableGlobalFilter: false,
  });

  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-headline-md font-semibold text-foreground">Orders</h1>
      </div> */}

      <Card className="card-elevated border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-headline-md">All Orders</CardTitle>
          <p className="text-sm text-on-surface-variant">
            {data?.pagination?.total ?? 0} orders found
          </p>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
              <Input
                placeholder="Search by order #, customer, or phone..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface-container-low rounded"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-on-surface-variant">
              <p>Error loading orders: {error?.message}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="whitespace-nowrap">
                            {header.isPlaceholder ? null : (
                              <div
                                className={cn(
                                  'flex items-center gap-1',
                                  header.column.getCanSort() && 'cursor-pointer select-none'
                                )}
                                onClick={header.column.getToggleSortingHandler()}
                                aria-sort={
                                  header.column.getIsSorted() === 'asc'
                                    ? 'ascending'
                                    : header.column.getIsSorted() === 'desc'
                                      ? 'descending'
                                      : 'none'
                                }
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === 'asc' && (
                                  <ChevronUp className="h-3 w-3 text-primary" />
                                )}
                                {header.column.getIsSorted() === 'desc' && (
                                  <ChevronDown className="h-3 w-3 text-primary" />
                                )}
                              </div>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                currentPage={data?.pagination?.page ?? 1}
                totalPages={totalPages}
                totalItems={data?.pagination?.total ?? 0}
                pageSize={filteredOrders.length}
                itemLabel="orders"
                onPageChange={(page) => {
                  const params = new URLSearchParams(window.location.search);
                  params.set('page', String(page));
                  window.history.pushState(
                    null,
                    '',
                    `${window.location.pathname}?${params.toString()}`
                  );
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
