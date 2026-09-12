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
import { AlertCircle, ChevronUp, ChevronDown, Edit, Trash2, Calendar, Eye, Users, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import type { Supplier } from '@pharmacy-point/types';
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
 * Clinical Precision — Supplier Data Table
 *
 * Design spec (DESIGN.md → Data Tables):
 *  - Zebra-striping, subtle bottom borders, uppercase headers (label-md)
 *  - Numerical data: data-mono for precise alignment
 *  - Representative count shows via Users icon with badge
 * ──────────────────────────────────────────────────────────────────────────── */

interface SupplierTableProps {
  suppliers: Supplier[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete?: (supplier: Supplier) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function SupplierTable({
  suppliers,
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  onDelete,
  isLoading = false,
  error = null,
}: SupplierTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Supplier Name',
        cell: ({ row }) => (
          <div className="font-medium text-foreground">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'contactName',
        header: 'Contact Person',
        cell: ({ row }) => (
          <span className="text-body-sm text-on-surface-variant">
            {row.original.contactName || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => {
          const email = row.original.email;
          return email ? (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1 text-body-sm text-secondary hover:underline"
            >
              <Mail className="h-3 w-3" />
              {email}
            </a>
          ) : (
            '—'
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => {
          const phone = row.original.phone;
          return phone ? (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1 text-body-sm text-secondary hover:underline"
            >
              <Phone className="h-3 w-3" />
              {phone}
            </a>
          ) : (
            '—'
          );
        },
      },
      {
        accessorKey: 'representatives',
        header: 'Representatives',
        cell: ({ row }) => {
          const count = row.original.representatives?.length ?? 0;
          if (count === 0) return <span className="text-body-sm text-on-surface-variant">—</span>;
          return (
            <div className="flex items-center gap-1 text-body-sm">
              <Users className="h-3 w-3 text-secondary" />
              <span className="text-foreground">{count} rep{count === 1 ? '' : 's'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'paymentTerms',
        header: 'Payment Terms',
        cell: ({ row }) => (
          <span className="text-body-sm text-on-surface-variant">
            {row.original.paymentTerms || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'leadTimeDays',
        header: 'Lead Time (days)',
        cell: ({ row }) => (
          <TableCellMono>{row.original.leadTimeDays ?? 7}</TableCellMono>
        ),
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
          const supplier = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/suppliers/${supplier.id}`} aria-label="View supplier">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/suppliers/${supplier.id}/edit`} aria-label="Edit supplier">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="ghostIcon"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(supplier)}
                  aria-label="Delete supplier"
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
    data: suppliers,
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

  if (isLoading || suppliers.length === 0) {
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
        pageSize={suppliers.length}
        itemLabel="suppliers"
        onPageChange={onPageChange}
      />
    </>
  );
}
