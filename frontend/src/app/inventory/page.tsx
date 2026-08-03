'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useInventory } from '@/hooks/useInventory';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import type { InventoryItem } from '@pharmacy-point/types';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['All Categories', 'Antibiotics', 'Analgesics', 'Antivirals', 'Cardiovascular'];
const MANUFACTURERS = ['All Manufacturers', 'Pfizer', 'Novartis', 'Roche', 'AstraZeneca'];

export default function InventoryPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: inventoryData, isLoading } = useInventory({
    page: currentPage,
    limit: 20,
    search: searchQuery || undefined,
    lowStock: showLowStockOnly || undefined,
    companyId: selectedCompany || undefined,
  });

  const products = inventoryData?.data ?? [];
  const totalPages = inventoryData?.pagination?.totalPages ?? 1;
  const totalItems = inventoryData?.pagination?.total ?? 0;

  const lowStockCount = products.filter((p) => p.quantity <= p.lowStock).length;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All Categories' ? '' : category);
    setCurrentPage(1);
  };

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company === 'All Manufacturers' ? '' : company);
    setCurrentPage(1);
  };

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
      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Top Bar / Search */}
          <div className="mb-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search medication SKUs or names..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-foreground">Inventory SKUs</h2>
            <p className="text-sm text-muted-foreground">
              Real-time tracking of active medication SKUs and stock alerts.
            </p>
          </div>

          {/* Filters Section */}
          <div className="mb-6 space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category:
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`rounded px-3 py-1 text-sm transition-colors border ${
                      (selectedCategory === '' && cat === 'All Categories') ||
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-input hover:bg-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Manufacturer:
              </p>
              <div className="flex flex-wrap gap-2">
                {MANUFACTURERS.map((mfg) => (
                  <button
                    key={mfg}
                    onClick={() => handleCompanyChange(mfg)}
                    className={`rounded px-3 py-1 text-sm transition-colors border ${
                      (selectedCompany === '' && mfg === 'All Manufacturers') ||
                      selectedCompany === mfg
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-input hover:bg-muted'
                    }`}
                  >
                    {mfg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => {
                    setShowLowStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Show only low stock items</span>
              </label>
              {lowStockCount > 0 && !showLowStockOnly && (
                <span className="text-xs text-muted-foreground">
                  {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} below threshold
                </span>
              )}
            </div>

            {(selectedCategory || selectedCompany || searchQuery) && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-destructive"
                >
                  <X className="mr-1 h-3 w-3" /> Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Product Table Section */}
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="min-w-full divide-y divide-border text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stock Level
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const isLowStock = product.quantity <= (product.lowStock || 10);

                  return (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                        {product.sku || `SKU-${product.id.slice(0, 6).toUpperCase()}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                        {product.category || 'General'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">
                            {product.quantity} units
                          </span>
                          {isLowStock && (
                            <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-foreground">
                        ${Number(product.price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <StockAdjustmentModal
                            product={product}
                            trigger={
                              <button
                                type="button"
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Adjust Stock"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            }
                          />
                          {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
                          <button
                            type="button"
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No products found. Adjust filters or add new stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-muted-foreground">
                Showing {products.length} of {totalItems} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
