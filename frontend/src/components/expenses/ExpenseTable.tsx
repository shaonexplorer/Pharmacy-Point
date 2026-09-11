'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ExpenseCategoryBadge } from '@/components/expenses/ExpenseCategoryBadge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import type { Expense } from '@pharmacy-point/types';

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Expense Data Table
 *
 * Design spec (DESIGN.md → Data Tables):
 *  - Headers: label-md (uppercase, 12px, 600 weight, 0.05em tracking)
 *  - Borders: Subtle bottom border only — NO vertical borders
 *  - Numerical data: data-mono (JetBrains Mono) for precise alignment
 *  - Row hover: subtle background change
 *
 * Sorting indicators use ChevronUp / ChevronDown with aria-sort for accessibility.
 * ──────────────────────────────────────────────────────────────────────────── */

interface ExpenseTableProps {
  expenses: Expense[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete?: (expense: Expense) => void;
}

export function ExpenseTable({
  expenses,
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  onDelete,
}: ExpenseTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: 'expenseDate',
        header: 'Date',
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return (
            <div className="flex items-center gap-1 text-body-md text-foreground">
              <Calendar className="mb-0.5 mr-1 h-4 w-4 inline" />
              {formatDate(date)}
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => {
          const category = getValue() as string;
          return <ExpenseCategoryBadge category={category} />;
        },
      },
      {
        accessorKey: 'vendor',
        header: 'Vendor',
        cell: ({ getValue }) => {
          const vendor = getValue() as string | null;
          return <span className="text-body-md text-foreground">{vendor || '—'}</span>;
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => {
          const desc = getValue() as string | null;
          return (
            <span className="text-body-md text-on-surface-variant line-clamp-2 max-w-sm">
              {desc || '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment',
        cell: ({ getValue }) => {
          const method = getValue() as string | null;
          const variant =
            method === 'card' ? 'secondary' : method === 'bank_transfer' ? 'outline' : 'default';
          return (
            <Badge variant={variant} className="text-xs uppercase">
              {method ?? 'cash'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => {
          const amount = getValue() as number;
          return (
            <span className="text-data-mono font-medium text-destructive">
              {formatCurrency(amount)}
            </span>
          );
        },
      },
      {
        accessorKey: 'user',
        header: 'Recorded By',
        cell: ({ getValue }) => {
          const user = getValue() as Expense['user'];
          if (!user) return <span className="text-sm text-on-surface-variant">—</span>;
          return (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-on-surface-variant" />
              <span className="text-body-sm text-foreground">{user.name || user.email}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Recorded',
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return <TableCellMono>{new Date(date).toLocaleDateString()}</TableCellMono>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const expense = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/expenses/${expense.id}`} aria-label="View expense">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/expenses/${expense.id}/edit`} aria-label="Edit expense">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="ghostIcon"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(expense)}
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onDelete]
  );

  const table = useReactTable({
    data: expenses,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: 10,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({
          pageIndex: currentPage - 1,
          pageSize: 10,
        });
        onPageChange(newPagination.pageIndex + 1);
      } else {
        onPageChange(updater.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <>
      {/* ── TanStack Table ── */}
      <div className="rounded-xl border border-border bg-card card-elevated">
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
      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={expenses.length}
        itemLabel="expenses"
        onPageChange={onPageChange}
      />
    </>
  );
}
