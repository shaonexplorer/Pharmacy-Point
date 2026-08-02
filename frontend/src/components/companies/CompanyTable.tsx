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
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import type { Company } from '@pharmacy-point/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CompanyTableProps {
  companies: Company[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete?: (company: Company) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function CompanyTable({
  companies,
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  onDelete,
  isLoading = false,
  error = null,
}: CompanyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Company Name',
        cell: ({ row }) => <div className="font-medium text-foreground">{row.original.name}</div>,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-2 max-w-xs">
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return <span className="text-muted-foreground">{date.toLocaleDateString()}</span>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/companies/${company.id}`} aria-label="View company">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/companies/${company.id}/edit`} aria-label="Edit company">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="ghostIcon"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(company)}
                  aria-label="Delete company"
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
    data: companies,
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

  if (companies.length === 0) {
    return null;
  }

  return (
    <>
      {/* TanStack Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {companies.length} of {totalItems} companies
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                const half = Math.floor(5 / 2);
                if (currentPage > totalPages - half) {
                  pageNum = totalPages - 4 + i;
                } else if (currentPage > half) {
                  pageNum = currentPage - half + i;
                }
              }
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && currentPage > 3 && currentPage < totalPages - 2 && (
              <span className="text-muted-foreground" aria-hidden="true">
                ...
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}