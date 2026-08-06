'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Edit,
  Eye,
  Trash2,
  User,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import type { Customer } from '@pharmacy-point/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCellMono,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/common/DataTablePagination';

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Customer Data Table
 *
 * Design spec (DESIGN.md → Data Tables):
 *  - Zebra-striping: dark mode, 5% luminosity difference between rows
 *  - Headers: label-md (uppercase, 12px, 600 weight, 0.05em tracking)
 *  - Borders: Subtle bottom border only — NO vertical borders allowed.
 *  - Data cells: body-md (14px, 400 weight)
 *  - Numerical data: data-mono (JetBrains Mono, 14px, 500 weight) for precise alignment
 *  - Row hover: subtle background change
 *
 * Sorting indicators use ChevronUp / ChevronDown (proper Lucide icons) with
 * aria-sort attributes for accessibility. The "View" action uses Eye and the
 * "Edit" action uses Edit — distinct icons prevent confusion.
 * ──────────────────────────────────────────────────────────────────────────── */

interface CustomerTableProps {
  customers: Customer[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete?: (customer: Customer) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function CustomerTable({
  customers,
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  onDelete,
  isLoading = false,
  error = null,
}: CustomerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-medium text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-on-surface-variant" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-on-surface-variant">{row.original.email || '—'}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="text-on-surface-variant">{row.original.phone || '—'}</span>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: ({ row }) => (
          <span className="text-on-surface-variant line-clamp-1 max-w-xs">
            {row.original.address || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'dueAmount',
        header: 'Due Amount',
        cell: ({ row }) => {
          const amount = Number(row.original.dueAmount);
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount);
          return (
            <TableCellMono className={cn(amount > 0 ? 'text-error' : 'text-on-surface-variant')}>
              {formatted}
            </TableCellMono>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <TableCellMono>
              <Calendar className="mb-0.5 mr-1 h-3 w-3 inline" />
              {date.toLocaleDateString()}
            </TableCellMono>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/customers/${customer.id}`} aria-label="View customer">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/customers/${customer.id}/edit`} aria-label="Edit customer">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="ghostIcon"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(customer)}
                  aria-label="Delete customer"
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
    data: customers,
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
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  if (error) {
    return (
      <Card className="border-error/30 bg-error/10 card-elevated">
        <div className="flex items-center gap-2 p-4 text-error">
          <AlertCircle className="h-4 w-4" />
          <p className="text-body-md">{error.message}</p>
        </div>
      </Card>
    );
  }

  if (isLoading || customers.length === 0) {
    return null;
  }

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
        pageSize={customers.length}
        itemLabel="customers"
        onPageChange={onPageChange}
      />
    </>
  );
}
