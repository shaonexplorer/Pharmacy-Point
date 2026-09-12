'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useSuppliers, useDeleteSupplier } from '@/hooks/useSuppliers';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Plus, Store, AlertCircle, Search, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/common';

/* ───────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Suppliers Management Page
 *
 * Signature: prescription-border-l (4px Pharma Teal left accent) on header
 * ───────────────────────────────────────────────────────────────────────── */

export default function SuppliersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: response, isLoading, error } = useSuppliers({
    page: currentPage,
    search: searchQuery || undefined,
  });

  const deleteSupplierMutation = useDeleteSupplier();

  const suppliersResponse = response;
  const suppliers = suppliersResponse?.data ?? [];
  const totalItems = suppliersResponse?.pagination.total ?? 0;
  const totalPages = suppliersResponse?.pagination.totalPages ?? 1;

  const handleDeleteClick = (supplier: { id: string; name: string }) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplierMutation.mutateAsync(supplierToDelete.id);
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="w-full space-y-6">
        {/* ── Page Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <h1 className="text-headline-lg text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              Suppliers
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Manage your pharmacy suppliers and their representatives.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild>
              <Link href="/suppliers/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-4"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* ── Delete Mutation Error ── */}
        {deleteSupplierMutation.isError && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">
                {deleteSupplierMutation.error?.message || 'Failed to delete supplier'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Error State ── */}
        {!isLoading && error && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">
                {error instanceof Error ? error.message : 'Failed to load suppliers'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Loading State ── */}
        {isLoading && (
          <div className="flex min-h-75 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !error && suppliers.length === 0 && (
          <Card className="border-border bg-card card-elevated border-dashed">
            <CardContent className="flex min-h-75 flex-col items-center justify-center text-center px-8">
              <Store className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-headline-md text-foreground">No suppliers found</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">
                {searchQuery
                  ? 'No suppliers match your search. Try adjusting your query.'
                  : 'Get started by adding your first supplier.'}
              </p>
              {!searchQuery && (
                <Button asChild className="mt-4">
                  <Link href="/suppliers/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Supplier Table ── */}
        {!isLoading && !error && suppliers.length > 0 && (
          <SupplierTable
            suppliers={suppliers}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onDelete={handleDeleteClick}
          />
        )}

        {/* ── Delete Confirmation Dialog ── */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Supplier"
          description={
            supplierToDelete
              ? `Are you sure you want to delete "${supplierToDelete.name}"? This action cannot be undone.`
              : ''
          }
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={deleteSupplierMutation.isPending}
        />
      </div>
    </div>
  );
}
