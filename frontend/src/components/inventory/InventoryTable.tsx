'use client';

import { useState } from 'react';
import {
  flexRender,
  type ColumnDef,
  type Updater,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';

import type { InventoryItem } from '@pharmacy-point/types';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, Package } from 'lucide-react';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Clinical Precision — Inventory Data Table
 *
 * Design spec (DESIGN.md → Data Tables):
 *  - Zebra-striping: dark mode, 5% luminosity difference between rows
 *  - Headers: label-md (uppercase, 12px, 600 weight, 0.05em tracking)
 *  - Borders: Subtle bottom border only — NO vertical borders allowed.
 *  - Row hover: subtle background change
 *
 * Follows the same TanStack Table v8 pattern as CustomerTable and CompanyTable,
 * but is extracted into a focused, reusable component that accepts typed
 * columns and data as props. Sorting is client-side (server pagination
 * is handled by the parent page).
 */
interface InventoryTableProps {
  data: InventoryItem[];
  columns: ColumnDef<InventoryItem>[];
  globalFilter: string | undefined;
  onGlobalFilterChange: (updater: Updater<string | undefined>) => void;
  isLoading?: boolean;
  error?: Error | null;
  /** Server-side pagination state (mirrors CompanyTable / CustomerTable / ProductTable) */
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function InventoryTable({
  data,
  columns,
  globalFilter,
  onGlobalFilterChange,
  isLoading = false,
  error = null,
  totalItems = 0,
  totalPages = 1,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
}: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    onPaginationChange: onPageChange
      ? (updater) => {
          if (typeof updater === 'function') {
            const newPagination = updater({
              pageIndex: currentPage - 1,
              pageSize,
            });
            onPageChange(newPagination.pageIndex + 1);
          } else {
            onPageChange(updater.pageIndex + 1);
          }
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p>{error.message}</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* Empty state — covers both no-data and global-filter-no-match scenarios,
     since TanStack Table's filtered row model is empty when the user's
     search doesn't match anything on the current page. */
  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card card-elevated">
        <div className="flex items-center justify-center py-12 text-on-surface-variant">
          <div className="flex flex-col items-center gap-3">
            <Package className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-body-md">No products found.</p>
            <p className="text-body-sm">Adjust your filters or add new stock.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
      {onPageChange && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={data.length}
          itemLabel="items"
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
