'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useCompanies } from '@/hooks/useCompanies';
import type { Product, Company } from '@pharmacy-point/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Re-export ProductTable for use in inventory page
import { ProductTable } from '@/components/products/ProductTable';
import { ProductSearch } from '@/components/products/ProductSearch';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ConfirmDialog } from '@/components/common';

export default function InventoryPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: companiesResponse } = useCompanies();
  const companies: Company[] = companiesResponse?.data ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts({
    page: currentPage,
    limit: 20,
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    companyId: selectedCompany || undefined,
  });

  const deleteProductMutation = useDeleteProduct();

  const products = productsData?.data ?? [];
  const totalPages = productsData?.pagination?.totalPages ?? 1;
  const totalItems = productsData?.pagination?.total ?? 0;
  const lowStockCount = products.filter((p) => p.quantity <= (p.lowStock || 10)).length;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

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

  const uniqueCategories = [...new Set(products.map((p) => p.category))].sort();

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
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Inventory
              </h1>
              <p className="text-muted-foreground mt-1">
                {totalItems} products {totalPages > 1 && `(page ${currentPage} of ${totalPages})`}
              </p>
            </div>
            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total Products</div>
              <div className="text-xl font-bold text-foreground">{totalItems}</div>
            </Card>
            <Card className="border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Low Stock</div>
              <div className="text-xl font-bold text-warning">{lowStockCount}</div>
            </Card>
            <Card className="border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-xl font-bold text-foreground">{uniqueCategories.length}</div>
            </Card>
            <Card className="border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Companies</div>
              <div className="text-xl font-bold text-foreground">{companies.length}</div>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 space-y-4">
            <ProductSearch onSearch={handleSearch} placeholder="Search by name or SKU..." />
            <ProductFilters
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              selectedCompany={selectedCompany}
              onCompanyChange={handleCompanyChange}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
              companies={companies}
              availableCategories={uniqueCategories}
            />
          </div>

          {/* Error */}
          {deleteProductMutation.isError && (
            <Card className="mb-6 border-destructive bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{deleteProductMutation.error?.message || 'Failed to delete product'}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex min-h-75 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <Card className="border-destructive bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{error instanceof Error ? error.message : 'Failed to load products'}</p>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && products.length === 0 && (
            <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No products found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {hasActiveFilters
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first product.'}
              </p>
              {!hasActiveFilters && (
                <Button asChild className="mt-4">
                  <Link href="/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Product Table */}
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

          {/* Delete Confirmation Dialog */}
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
            onConfirm={handleConfirmDelete}
            loading={deleteProductMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
