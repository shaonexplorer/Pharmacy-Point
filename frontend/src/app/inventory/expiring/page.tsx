'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  FileText,
  AlertTriangle,
  Clock,
  PackageOpen,
  Trash2,
  ArrowLeft,
  CalendarDays,
  BarChart3,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { ExpiryChip, getExpiryStatus } from '@/components/inventory/StockChip';
import { useExpiringProducts, useExpiredProducts } from '@/hooks/useInventory';
import type { InventoryItem } from '@pharmacy-point/types';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { DataTablePagination } from '@/components/common/DataTablePagination';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: (info) => <span className="font-medium text-on-surface">{String(info.getValue())}</span>,
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: (info) => (
      <span className="font-mono text-xs text-on-surface-variant">{String(info.getValue())}</span>
    ),
  },
  {
    accessorKey: 'batchNo',
    header: 'Batch',
    cell: (info) => <span className="text-xs">{String(info.getValue() ?? '—')}</span>,
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
    cell: (info) => <span className="font-mono text-xs">{String(info.getValue())}</span>,
  },
  {
    accessorKey: 'price',
    header: 'Unit Price',
    cell: (info) => (
      <span className="font-mono text-xs">{formatCurrency(Number(info.getValue()))}</span>
    ),
  },
  {
    accessorKey: 'expiryDate',
    header: 'Expiry',
    cell: (info) => {
      const val = info.getValue() as string | null;
      if (!val) return <span className="text-xs">—</span>;
      return (
        <div className="flex items-center gap-2 text-xs">
          <span>{new Date(val).toLocaleDateString()}</span>
          <ExpiryChip status={getExpiryStatus(val)} />
        </div>
      );
    },
  },
  {
    accessorKey: 'id',
    header: 'Waste Value',
    cell: (info) => {
      const row = info.row.original;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(row.quantity * row.price)}
        </span>
      );
    },
    meta: { align: 'right' },
  },
];

function toCsv(rows: InventoryItem[]): string {
  const headers = [
    'Name',
    'SKU',
    'Barcode',
    'Batch',
    'Category',
    'Qty',
    'Price',
    'Expiry',
    'Waste',
  ];
  const lines = [
    headers.join(','),
    ...rows.map((r) => {
      const waste = (r.quantity * r.price).toFixed(2);
      const exp = r.expiryDate ? new Date(r.expiryDate).toISOString().split('T')[0] : '';
      return [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.sku}"`,
        `"${r.barcode ?? ''}"`,
        `"${r.batchNo ?? ''}"`,
        `"${r.category ?? ''}"`,
        r.quantity,
        r.price.toFixed(2),
        exp,
        waste,
      ].join(',');
    }),
  ];
  return lines.join('\n');
}

function downloadCsv(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
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
export default function ExpirationReportPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState('expiring');

  const {
    data: expiringRes,
    isLoading: loadingExp,
    refetch: refetchExpiring,
  } = useExpiringProducts({ days, limit: 100 });
  const {
    data: expiredRes,
    isLoading: loadingExpd,
    refetch: refetchExpired,
  } = useExpiredProducts({ limit: 100 });

  const expiring = expiringRes?.data ?? [];
  const expired = expiredRes?.data ?? [];

  const handleRefresh = () => {
    refetchExpiring();
    refetchExpired();
  };

  if (isPending || !session) {
    return (
      <div className="py-8 text-center text-on-surface-variant">
        <BarChart3 className="mx-auto mb-3 h-8 w-8" />
        <p className="text-sm">Loading session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header strip */}
      <header className="border-b bg-surface-container shadow-sm">
        <div className="mx-auto max-w-[1440px] px-6 py-6 md:px-10">
          <button
            type="button"
            onClick={() => router.push('/inventory')}
            className="mb-3 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-on-surface tracking-tight md:text-3xl">
                Expiration Report
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                Track upcoming expirations, identify waste risk, and export for compliance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csv = toCsv(tab === 'expiring' ? expiring : expired);
                  downloadCsv(csv, `expiration-${tab}-${days}-days.csv`);
                }}
              >
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 space-y-8">
        {/* KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-surface-container border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Expiring within {days} days
                </p>
                <p className="text-2xl font-semibold text-on-surface">{expiring.length}</p>
                <p className="text-xs text-on-surface-variant">Products</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <PackageOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Expired in stock
                </p>
                <p className="text-2xl font-semibold text-on-surface">{expired.length}</p>
                <p className="text-xs text-on-surface-variant">Products</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Estimated waste (expiring)
                </p>
                <p className="text-2xl font-semibold text-destructive">
                  {formatCurrency(expiring.reduce((sum, i) => sum + i.quantity * i.price, 0))}
                </p>
                <p className="text-xs text-on-surface-variant">Value at cost</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Expired waste value
                </p>
                <p className="text-2xl font-semibold text-destructive">
                  {formatCurrency(expired.reduce((sum, i) => sum + i.quantity * i.price, 0))}
                </p>
                <p className="text-xs text-on-surface-variant">Lost inventory value</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Controls */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-surface-container px-3 py-2 shadow-sm">
              <CalendarDays className="h-4 w-4 text-on-surface-variant" />
              <label htmlFor="days" className="text-sm font-medium text-on-surface">
                Window:
              </label>
              <Input
                id="days"
                type="number"
                min={7}
                max={365}
                value={days}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 7) setDays(v);
                }}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs text-on-surface-variant">days</span>
            </div>
            <Button size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
          <div className="text-sm text-on-surface-variant">
            Showing{' '}
            <span className="font-medium text-on-surface">
              {tab === 'expiring' ? expiring.length : expired.length}
            </span>{' '}
            items
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('expiring')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-sm ${tab === 'expiring' ? 'bg-surface text-foreground shadow-md ring-1 ring-border' : 'bg-surface-container text-on-surface-variant hover:bg-surface hover:text-on-surface border border-border/60'}`}
            >
              <Clock className="h-4 w-4" /> Expiring Soon
            </button>
            <button
              type="button"
              onClick={() => setTab('expired')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-sm ${tab === 'expired' ? 'bg-surface text-foreground shadow-md ring-1 ring-border' : 'bg-surface-container text-on-surface-variant hover:bg-surface hover:text-on-surface border border-border/60'}`}
            >
              <AlertTriangle className="h-4 w-4" /> Expired
            </button>
          </div>

          {tab === 'expiring' && (
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="bg-surface-container/60 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Upcoming Expirations</CardTitle>
                    <CardDescription>
                      Within next {days} days — ordered by shortest expiry first.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {expiring.length} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ExpiringTable data={expiring} loading={loadingExp} />
              </CardContent>
            </Card>
          )}

          {tab === 'expired' && (
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="bg-surface-container/60 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Expired Products Still in Stock</CardTitle>
                    <CardDescription>
                      These items have passed expiry but remain on hand — priority for removal.
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="font-mono">
                    {expired.length} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ExpiredTable data={expired} loading={loadingExpd} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer note */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>
            Waste value calculated at current unit price × quantity in stock. Export includes batch
            and barcode for regulatory filing.
          </span>
        </div>
      </main>

      {/* Print styles embedded for PDF export */}
      <style jsx global>{`
        @media print {
          header,
          .no-print,
          button {
            display: none !important;
          }
          main {
            margin: 0;
            padding: 0;
            max-width: 100%;
          }
          table {
            font-size: 10pt;
          }
        }
      `}</style>
    </div>
  );
}

function ExpiringTable({ data, loading }: { data: InventoryItem[]; loading: boolean }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="text-left px-4 py-3 whitespace-nowrap cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    <span className="ml-1 text-[10px] text-on-surface-variant">
                      {h.column.getIsSorted() === 'asc'
                        ? 'asc'
                        : h.column.getIsSorted() === 'desc'
                          ? 'desc'
                          : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-on-surface-variant"
                >
                  Loading…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-on-surface-variant"
                >
                  No products expiring within window.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 whitespace-nowrap ${cell.column.id === 'id' ? 'text-right' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <DataTablePagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        onPageChange={(p) => table.setPageIndex(p - 1)}
        totalItems={data.length}
        pageSize={table.getState().pagination.pageSize}
        itemLabel="items"
      />
    </div>
  );
}

function ExpiredTable({ data, loading }: { data: InventoryItem[]; loading: boolean }) {
  const expiredCols: ColumnDef<InventoryItem>[] = [
    {
      ...columns[0],
      cell: (info) => (
        <span className="font-medium text-destructive">{String(info.getValue())}</span>
      ),
    },
    columns[1],
    columns[2],
    columns[3],
    columns[4],
    {
      accessorKey: 'expiryDate',
      header: 'Expired',
      cell: (info) => {
        const val = info.getValue() as string | null;
        if (!val) return <span className="text-xs">—</span>;
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-destructive font-medium">
              {new Date(val).toLocaleDateString()}
            </span>
            <ExpiryChip status="expired" />
          </div>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'Waste Value',
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className="text-right font-mono text-sm text-destructive">
            {formatCurrency(row.quantity * row.price)}
          </span>
        );
      },
      meta: { align: 'right' },
    },
  ];
  const table = useReactTable({
    data,
    columns: expiredCols,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="text-left px-4 py-3 whitespace-nowrap cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    <span className="ml-1 text-[10px] text-on-surface-variant">
                      {h.column.getIsSorted() === 'asc'
                        ? 'asc'
                        : h.column.getIsSorted() === 'desc'
                          ? 'desc'
                          : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr>
                <td
                  colSpan={expiredCols.length}
                  className="px-4 py-6 text-center text-on-surface-variant"
                >
                  Loading…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={expiredCols.length}
                  className="px-4 py-6 text-center text-on-surface-variant"
                >
                  No expired products currently in stock.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 whitespace-nowrap ${cell.column.id === 'id' ? 'text-right' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <DataTablePagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        onPageChange={(p) => table.setPageIndex(p - 1)}
        totalItems={data.length}
        pageSize={table.getState().pagination.pageSize}
        itemLabel="items"
      />
    </div>
  );
}
