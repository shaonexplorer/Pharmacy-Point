'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useCompanies } from '@/hooks/useCompanies';
import type { Product, Company } from '@pharmacy-point/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Loader2, Package, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductSearch } from '@/components/products/ProductSearch';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ConfirmDialog } from '@/components/common';
import { TearLine } from '@/components/dashboard';

export default function ProductsPage() {
  const router = useRouter();
  const { data: session, isPending, error: authError } = useSession();
  const { data: companiesResponse } = useCompanies();
  const companies: Company[] = companiesResponse?.data ?? [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  // React Query hooks
  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts({
    page: currentPage,
    limit: 12,
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    companyId: selectedCompany || undefined,
  });

  const deleteProductMutation = useDeleteProduct();

  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const totalPages = productsData?.pagination.totalPages ?? 1;
  const totalItems = productsData?.pagination.total ?? 0;

  // Derive low-stock count from current page data
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.quantity <= (p.lowStock ?? 0)).length;
  }, [products]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedCompany('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const hasActiveFilters = !!searchQuery || !!selectedCategory || !!selectedCompany;

  // Auth loading
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Auth error or not authenticated
  if (authError || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md border-border bg-card card-elevated">
          <CardContent className="px-6 py-8">
            <AlertCircle className="h-8 w-8 text-error mb-3" />
            <h3 className="text-headline-md text-foreground">Not Authenticated</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              {authError?.message || 'You need to sign in to view this page.'}
            </p>
            <Button asChild variant="default" className="mt-4 w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle prescription-grid texture: evokes medical prescription pads */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(var(--outline-variant)_1px,transparent_1px)] bg-size-[24px_24px] mask-[linear-gradient(to_bottom,black,transparent_20%,transparent_80%,black)]" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="w-full space-y-6">
          {/* ── Header ── */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-display-lg text-foreground">Products</h1>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Manage your medication catalogue — add, edit, and monitor stock levels.
            </p>
          </div>

          {/* ── Search & Actions ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <ProductSearch onSearch={handleSearch} placeholder="Search by name or SKU..." />
            <Button asChild variant="default">
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* ── Filters ── */}
          <ProductFilters
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            selectedCompany={selectedCompany}
            onCompanyChange={handleCompanyChange}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
            companies={companies}
          />

          {/* ── Delete Error ── */}
          {deleteProductMutation.isError && (
            <div className="rounded-lg border border-error bg-error/5 p-4 card-elevated">
              <div className="flex items-center gap-2 text-error">
                <AlertCircle className="h-4 w-4" />
                <p className="text-body-md">
                  {deleteProductMutation.error?.message || 'Failed to delete product'}
                </p>
              </div>
            </div>
          )}

          {/* ── Low Stock Alert ── */}
          {!isLoading && !error && lowStockCount > 0 && !hasActiveFilters && (
            <div className="rounded-lg border border-warning-container/50 bg-warning-container/10 p-4 card-elevated">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">
                    {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} below low-stock
                    threshold
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Review inventory levels and consider restocking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Product Table ── */}
          {!isLoading && !error && products.length > 0 && (
            <ProductTable
              products={products}
              totalItems={totalItems}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onDelete={handleDeleteClick}
            />
          )}

          {/* ── Loading State ── */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-muted"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          )}

          {/* ── Error State ── */}
          {!isLoading && error && (
            <Card className="border-error bg-card card-elevated">
              <CardContent className="flex items-center gap-3 px-4">
                <AlertCircle className="h-5 w-5 text-error shrink-0" />
                <p className="text-body-md text-error">
                  {error instanceof Error ? error.message : 'Failed to load products'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── Empty State ── */}
          {!isLoading && !error && products.length === 0 && (
            <Card className="border-border bg-card card-elevated border-dashed">
              <CardContent className="flex min-h-75 flex-col items-center justify-center text-center px-8">
                {hasActiveFilters ? (
                  <>
                    <Search className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-headline-md text-foreground">No products found</h3>
                    <p className="mt-2 text-body-md text-on-surface-variant">
                      Try adjusting your search or filter criteria.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={handleClearFilters}
                    >
                      <X className="mr-2 h-3 w-3" />
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-headline-md text-foreground">No products found</h3>
                    <p className="mt-2 text-body-md text-on-surface-variant">
                      Get started by adding your first product.
                    </p>
                    <Button asChild variant="default" className="mt-4">
                      <Link href="/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Pagination Note ── */}
          {products.length > 0 && <TearLine />}
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={deleteProductMutation.isPending}
      />
    </div>
  );
}
