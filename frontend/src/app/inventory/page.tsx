'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useInventory } from '@/hooks/useInventory';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import type { InventoryItem } from '@pharmacy-point/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';

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
        <div className="container-max space-y-6">
          {/* Top Bar / Search */}
          <div className="mb-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
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
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>

            <h2 className="text-headline-lg text-foreground">Inventory SKUs</h2>
            <p className="text-body-md text-on-surface-variant">
              Real-time tracking of active medication SKUs and stock alerts.
            </p>
          </div>

          {/* Filters Section */}
          <Card className="border-border bg-card card-elevated p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-label-md text-on-surface-variant">Category:</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive =
                      (selectedCategory === '' && cat === 'All Categories') ||
                      selectedCategory === cat;
                    return (
                      <Button
                        key={cat}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCategoryChange(cat)}
                      >
                        {cat}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-label-md text-on-surface-variant">Manufacturer:</p>
                <div className="flex flex-wrap gap-2">
                  {MANUFACTURERS.map((mfg) => {
                    const isActive =
                      (selectedCompany === '' && mfg === 'All Manufacturers') ||
                      selectedCompany === mfg;
                    return (
                      <Button
                        key={mfg}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCompanyChange(mfg)}
                      >
                        {mfg}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLowStockOnly}
                    onChange={(e) => {
                      setShowLowStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-body-sm text-foreground">Show only low stock items</span>
                </label>
                {lowStockCount > 0 && !showLowStockOnly && (
                  <span className="text-xs text-on-surface-variant">
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
          </Card>

          {/* Product Table Section */}
          <div className="overflow-x-auto rounded-lg border border-border bg-card card-elevated">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const isLowStock = product.quantity <= (product.lowStock || 10);

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium text-foreground">
                        {product.name}
                      </TableCell>
                      <TableCellMono>
                        {product.sku || `SKU-${product.id.slice(0, 6).toUpperCase()}`}
                      </TableCellMono>
                      <TableCell className="capitalize text-on-surface-variant">
                        {product.category || 'General'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-data-mono text-foreground">
                            {product.quantity} units
                          </span>
                          {isLowStock && (
                            <Badge variant="warning" size="sm">
                              Low Stock
                            </Badge>
                          )}
                          {!isLowStock && product.quantity > 0 && (
                            <Badge variant="success" size="sm">
                              In Stock
                            </Badge>
                          )}
                          {product.quantity === 0 && (
                            <Badge variant="destructive" size="sm">
                              Out
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCellMono>
                        {formatCurrency(product.price)}
                      </TableCellMono>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
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
                          {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
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

                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-on-surface-variant">
                      No products found. Adjust filters or add new stock.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-body-sm text-on-surface-variant">
                Showing {products.length} of {totalItems} entries
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
                <span className="text-body-sm text-on-surface-variant">
                  Page {currentPage} of {totalPages}
                </span>
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
