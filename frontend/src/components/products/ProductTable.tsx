'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit,
  Eye,
  Loader2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@pharmacy-point/types';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableCellMono,
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
              <div className="text-data-mono text-on-surface-variant">SKU: {row.original.sku}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span className="capitalize text-on-surface-variant">{row.original.category || '—'}</span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => <TableCellMono>{formatCurrency(row.original.price)}</TableCellMono>,
      },
      {
        accessorKey: 'quantity',
        header: 'Stock',
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const lowStock = row.original.lowStock ?? 0;
          const isLowStock = quantity <= lowStock;
          const isOutOfStock = quantity === 0;

          let badgeVariant: 'success' | 'warning' | 'destructive';
          let badgeLabel: string;

          if (isOutOfStock) {
            badgeVariant = 'destructive';
            badgeLabel = 'Out of Stock';
          } else if (isLowStock) {
            badgeVariant = 'warning';
            badgeLabel = 'Low Stock';
          } else {
            badgeVariant = 'success';
            badgeLabel = 'In Stock';
          }

          return (
            <div className="flex items-center gap-2">
              <span className="text-data-mono font-medium text-foreground">{quantity} units</span>
              <Badge variant={badgeVariant} size="sm">
                {badgeLabel}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => (
          <span className="text-on-surface-variant">{row.original.company?.name ?? '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button asChild variant="ghostIcon" size="sm">
                <Link href={`/products/${product.id}`} aria-label="View product">
                  <Eye className="h-4 w-4" />
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
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/5 p-4 card-elevated">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-body-md">{error.message}</p>
        </div>
      </div>
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
      {/* Data Table — no vertical borders, subtle bottom borders only */}
      <div className="overflow-hidden rounded-lg border border-border bg-card card-elevated">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-1 transition-colors',
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-foreground'
                            : ''
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && (
                          <ChevronUp className="h-3 w-3 text-on-surface-variant" />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <ChevronDown className="h-3 w-3 text-on-surface-variant" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-body-sm text-on-surface-variant">
            Showing {products.length} of {totalItems} products
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
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
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && currentPage > 3 && currentPage < totalPages - 2 && (
              <span className="text-body-sm text-on-surface-variant" aria-hidden="true">
                …
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
