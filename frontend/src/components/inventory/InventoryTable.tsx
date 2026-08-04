'use client';

import { useState } from 'react';
import {
  flexRender,
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';

import type { InventoryItem } from '@pharmacy-point/types';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
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
  isLoading?: boolean;
  error?: Error | null;
}

export function InventoryTable({
  data,
  columns,
  isLoading = false,
  error = null,
}: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
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

  return (
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
  );
}
