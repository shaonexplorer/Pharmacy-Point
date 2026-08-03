'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogOut, Loader2, Package, Store, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useCompanies } from '@/hooks/useCompanies';
import { useStats } from '@/hooks/useStats';

export default function DashboardPage() {
  const { data: session, error, isPending } = useSession();
  const { data: productsResponse } = useProducts({ limit: 1 });
  const { data: companiesResponse } = useCompanies({ limit: 1 });
  const { data: statsData } = useStats();

  // Calculate stats from available data
  const stats = statsData || {
    totalProducts: productsResponse?.pagination?.total ?? 0,
    totalCompanies: companiesResponse?.pagination?.total ?? 0,
    lowStockItems: 0,
    totalSales: 0,
    salesThisMonth: 0,
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Not Authenticated</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error?.message || 'You need to sign in to view this page'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {session.user.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Manage your pharmacy inventory, suppliers, and sales from one centralized dashboard.
              View real-time analytics and track stock levels.
            </p>
          </div>

          {/* KPI Cards - 3 columns on desktop, 1 on mobile */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalProducts > 0 ? '+12 from last month' : 'Start adding products'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Companies</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">All active suppliers</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Low Stock Items
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Items below threshold</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                asChild
                className="justify-start gap-3 rounded-lg p-4 shadow-sm hover:shadow-md"
                variant="default"
              >
                <Link href="/products/new">
                  <Package className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Add Product</div>
                    <span className="text-xs text-muted-foreground">New inventory item</span>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                className="justify-start gap-3 rounded-lg p-4 shadow-sm hover:shadow-md"
                variant="outline"
              >
                <Link href="/companies/new">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">Add Company</div>
                    <span className="text-xs text-muted-foreground">New supplier</span>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                className="justify-start gap-3 rounded-lg p-4 shadow-sm hover:shadow-md"
                variant="outline"
              >
                <Link href="/inventory">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">View Inventory</div>
                    <span className="text-xs text-muted-foreground">Manage stock</span>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                className="justify-start gap-3 rounded-lg p-4 shadow-sm hover:shadow-md"
                variant="outline"
              >
                <Link href="/analytics">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">Analytics</div>
                    <span className="text-xs text-muted-foreground">Sales reports</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Recent Activity</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Recent Products
                  </CardTitle>
                  <CardDescription>Recently added inventory items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent products</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Sales This Month
                  </CardTitle>
                  <CardDescription>Revenue and transaction summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No sales data available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-8">
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
