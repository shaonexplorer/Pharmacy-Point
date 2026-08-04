'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useInventory } from '@/hooks/useInventory';
import { useCompanies } from '@/hooks/useCompanies';
import { useCategories } from '@/hooks/useCategories';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { Checkbox } from '@/components/ui/checkbox';
import type { InventoryItem } from '@pharmacy-point/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableCellMono,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Package,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Inventory Management Page
 *
 * Design spec (DESIGN.md → "3. Inventory Management"):
 *  - Product Table: zebra-striping, no vertical borders, label-md uppercase headers
 *  - Low Stock Filter: toggle to show only products below minimum stock levels
 *  - Stock Level Display: data-mono for quantities, tertiary for "In Stock"
 *  - Transaction History: separate view (not on this page)
 *
 * Signature element: prescription-border-l (4px Pharma Teal) on the page header
 * reinforces the clinical identity — like the colored bar on a prescription label.
 * ──────────────────────────────────────────────────────────────────────────── */

/* ── Helpers ───────────────────────────────────────────────────────── */

/**
 * Resolve a product's stock status using the API-provided `isLowStock` flag.
 *
 * Returns one of: 'out' | 'low' | 'ok'
 * - 'out'  → quantity === 0                       (error red)
 * - 'low'  → isLowStock && quantity > 0            (warning amber)
 * - 'ok'   → otherwise                            (tertiary / Safety Green)
 */
function getStockStatus(product: InventoryItem): 'out' | 'low' | 'ok' {
  if (product.quantity === 0) return 'out';
  if (product.isLowStock) return 'low';
  return 'ok';
}

function StockChip({ status }: { status: 'out' | 'low' | 'ok' }) {
  if (status === 'ok') {
    return (
      <Badge variant="success" size="sm">
        In Stock
      </Badge>
    );
  }
  if (status === 'low') {
    return (
      <Badge variant="warning" size="sm">
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" size="sm">
      Out of Stock
    </Badge>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */

export default function InventoryPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  /* ── Filter state ─────────────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Data fetching ────────────────────────────────────────────────── */
  const {
    data: inventoryData,
    isLoading,
    refetch,
  } = useInventory({
    page: currentPage,
    limit: 20,
    search: searchQuery || undefined,
    lowStock: showLowStockOnly || undefined,
    companyId: selectedCompany || undefined,
  });

  // Companies for the manufacturer filter (fetch all, no pagination)
  const { data: companiesData } = useCompanies({ page: 1, limit: 100 });
  const companies = companiesData?.data ?? [];

  // Categories for the category filter
  const { data: categories } = useCategories();

  /* ── Derived data ─────────────────────────────────────────────────── */
  const products = useMemo(() => inventoryData?.data ?? [], [inventoryData?.data]);
  const totalPages = inventoryData?.pagination?.totalPages ?? 1;
  const totalItems = inventoryData?.pagination?.total ?? 0;

  // Client-side category filter (inventory API doesn't accept a `category` param)
  const displayedProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Summary counts from the currently displayed rows
  const summary = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    for (const p of displayedProducts) {
      const status = getStockStatus(p);
      if (status === 'ok') inStock++;
      else if (status === 'low') lowStock++;
      else outOfStock++;
    }
    return { inStock, lowStock, outOfStock };
  }, [displayedProducts]);

  const hasActiveFilters = searchQuery || selectedCategory || selectedCompany || showLowStockOnly;

  /* ── Auth redirect ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  /* ── Handlers ─────────────────────────────────────────────────────── */
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedCompany('');
    setSearchQuery('');
    setShowLowStockOnly(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Render up to 5 page-number buttons centered around the current page
  function pageNumbers(): number[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = 2;
    if (currentPage <= half) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - half) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }

  /* ── Loading / auth guards ────────────────────────────────────────── */
  if (isPending || isLoading) {
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
    <div className="min-h-screen bg-background">
      <div className="flex-1 p-4 sm:p-6">
        <div className="container-max space-y-6">
          {/* ── Page Header (signature: prescription-border-l accent) ── */}
          <div className="prescription-border-l pl-4">
            <h1 className="text-headline-lg text-foreground">Inventory</h1>
            <p className="text-body-md text-on-surface-variant">
              Real-time tracking of active medication SKUs and stock alerts.
            </p>
          </div>

          {/* ── Summary Row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-label-md text-on-surface-variant">Total SKUs</p>
                    <p className="text-headline-md text-foreground">{totalItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-label-md text-on-surface-variant">Low Stock</p>
                    <p className="text-headline-md text-foreground">{summary.lowStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-label-md text-on-surface-variant">Out of Stock</p>
                    <p className="text-headline-md text-foreground">{summary.outOfStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Controls Card ───────────────────────────────────────── */}
          <Card className="hover:shadow-(--shadow-card) hover:translate-y-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-headline-md">Filters</CardTitle>
              <CardDescription>
                {displayedProducts.length} of {totalItems} items displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search medication SKUs or names..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4"
                />
              </div>

              {/* Category filter */}
              <div className="space-y-2">
                <p className="text-label-md text-on-surface-variant">Category:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    key="all-categories"
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                  >
                    All Categories
                  </Button>
                  {categories?.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setCurrentPage(1);
                      }}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Manufacturer / Company filter */}
              <div className="space-y-2">
                <p className="text-label-md text-on-surface-variant">Manufacturer:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    key="all-manufacturers"
                    variant={selectedCompany === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCompany('');
                      setCurrentPage(1);
                    }}
                  >
                    All Manufacturers
                  </Button>
                  {companies.map((company) => (
                    <Button
                      key={company.id}
                      variant={selectedCompany === company.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company.id);
                        setCurrentPage(1);
                      }}
                    >
                      {company.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Low stock toggle + clear filters */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="low-stock-toggle"
                    checked={showLowStockOnly}
                    onCheckedChange={(checked) => {
                      setShowLowStockOnly(checked === true);
                      setCurrentPage(1);
                    }}
                  />
                  <span className="text-body-md text-foreground">Show only low stock items</span>
                </label>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs text-destructive"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Toolbar ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="text-body-sm text-on-surface-variant">
              Showing {displayedProducts.length} of {totalItems} items
              {selectedCategory && (
                <>
                  <span className="mx-2">·</span>
                  <span className="font-medium text-foreground">{selectedCategory}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-1 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                Export Report
              </Button>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Add Product
              </Button>
            </div>
          </div>

          {/* ── Product Table ───────────────────────────────────────── */}
          {/*
            The <Table> component already wraps itself in a card-style container
            (overflow-auto, rounded-lg, border, bg-card). No extra wrapper needed.
          */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedProducts.map((product) => {
                const stockStatus = getStockStatus(product);

                return (
                  <TableRow key={product.id}>
                    {/* Product name */}
                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>

                    {/* SKU — data-mono for precise character alignment */}
                    <TableCellMono>
                      {product.sku || `SKU-${product.id.slice(0, 6).toUpperCase()}`}
                    </TableCellMono>

                    {/* Category — muted text per spec */}
                    <TableCell className="capitalize text-on-surface-variant">
                      {product.category || 'General'}
                    </TableCell>

                    {/* Stock level — data-mono + status chip */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-foreground">
                          {product.quantity} units
                        </span>
                        <StockChip status={stockStatus} />
                      </div>
                    </TableCell>

                    {/* Unit price — data-mono */}
                    <TableCellMono>{formatCurrency(product.price)}</TableCellMono>

                    {/* Actions — icon buttons */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {stockStatus === 'low' && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        <StockAdjustmentModal
                          product={product}
                          trigger={
                            <Button
                              type="button"
                              variant="ghostIcon"
                              size="sm"
                              title="Adjust Stock"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button asChild variant="ghostIcon" size="sm" title="Edit">
                          <Link href={`/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Empty state */}
              {displayedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                      <Package className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-body-md">No products found.</p>
                      <p className="text-body-sm">Adjust your filters or add new stock.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* ── Pagination ──────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-body-sm text-on-surface-variant">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>

                {pageNumbers().map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
