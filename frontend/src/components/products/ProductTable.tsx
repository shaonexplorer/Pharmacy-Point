'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@pharmacy-point/types';
import { formatCurrency } from '@/lib/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProductTableProps {
  products: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete?: (product: Product) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function ProductTable({
  products,
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  onDelete,
  isLoading = false,
  error = null,
}: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.original.name}
            {row.original.sku && (
              <div className="text-sm text-muted-foreground">SKU: {row.original.sku}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => row.original.category,
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => <span className="font-mono">{formatCurrency(row.original.price)}</span>,
      },
      {
        accessorKey: 'quantity',
        header: 'Stock',
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const lowStock = row.original.lowStock;
          const isLowStock = quantity <= lowStock;

          return (
            <div className="flex flex-col">
              <span className="font-medium">{quantity}</span>
              {isLowStock && (
                <span className="text-xs text-destructive font-medium">Low Stock</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => row.original.company?.name ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/products/${product.id}`} aria-label="View product">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/products/${product.id}/edit`} aria-label="Edit product">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="ghostIcon"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(product)}
                  aria-label="Delete product"
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
    data: products,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: 12,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({
          pageIndex: currentPage - 1,
          pageSize: 12,
        });
        onPageChange(newPagination.pageIndex + 1);
      } else {
        onPageChange(updater.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      {/* TanStack Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
            Showing {products.length} of {totalItems} products
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
