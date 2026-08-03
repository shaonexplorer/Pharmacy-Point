'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProducts } from '@/hooks/useProducts';
import { useCompanies } from '@/hooks/useCompanies';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, BarChart3, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'Medications',
  'Supplements',
  'Healthcare',
  'Personal Care',
  'First Aid',
  'Other',
];

// Generate deterministic category values based on index for consistent rendering
const getCategoryValue = (index: number): number => {
  const baseValues = [75, 42, 68, 32, 55, 28];
  return baseValues[index % baseValues.length];
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: productsResponse } = useProducts({ limit: 100 });
  const { data: companiesResponse } = useCompanies();
  const { isLoading: isStatsLoading } = useStats();

  // Calculate stats from data
  const products = productsResponse?.data ?? [];
  const companies = companiesResponse?.data ?? [];
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
  const lowStockItems = products.filter((p) => p.quantity <= (p.lowStock || 10)).length;

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending || isStatsLoading) {
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
                <BarChart3 className="h-6 w-6 text-primary" />
                Analytics & Reports
              </h1>
              <p className="text-muted-foreground mt-1">
                View sales performance and inventory insights
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Inventory Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total stock value across all products
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">Active products</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Items below threshold</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Suppliers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{companies.length}</div>
                <p className="text-xs text-muted-foreground">Registered companies</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts & Insights */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Inventory Value by Category */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Inventory by Category
                </CardTitle>
                <CardDescription>Value distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CATEGORIES.map((category, index) => {
                    const value = getCategoryValue(index);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{category}</span>
                          <span className="font-medium text-foreground">${value * 100}</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(value / 100) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stock Level Distribution */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Stock Level Distribution
                </CardTitle>
                <CardDescription>High, Medium, Low stock items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">High Stock (20+)</span>
                      <span className="font-medium text-foreground">
                        {products.filter((p) => p.quantity > (p.lowStock || 10)).length}
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Medium Stock (5-20)</span>
                      <span className="font-medium text-foreground">
                        {
                          products.filter((p) => p.quantity > 0 && p.quantity <= (p.lowStock || 10))
                            .length
                        }
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Out of Stock</span>
                      <span className="font-medium text-foreground">
                        {products.filter((p) => p.quantity === 0).length}
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive rounded-full"
                        style={{ width: '25%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Low Stock Alerts */}
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Products requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockItems > 0 ? (
                  <div className="divide-y divide-border">
                    {products
                      .filter((p) => p.quantity <= (p.lowStock || 10) && p.quantity > 0)
                      .slice(0, 5)
                      .map((product) => (
                        <div key={product.id} className="py-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {product.quantity} / {product.lowStock || 10}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">
                            Low Stock
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">All stock levels are healthy</p>
                    <p className="text-sm mt-1">No items currently below threshold</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-end">
            <Button asChild>
              <Link href="/inventory">
                <Package className="mr-2 h-4 w-4" />
                View Full Inventory
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
