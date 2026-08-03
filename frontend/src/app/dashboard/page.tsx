'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  LogOut,
  Loader2,
  Package,
  Store,
  BarChart3,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useCompanies } from '@/hooks/useCompanies';
import { useStats } from '@/hooks/useStats';

export default function DashboardPage() {
  const { data: session, error, isPending } = useSession();
  const { data: productsResponse } = useProducts({ limit: 1 });
  const { data: companiesResponse } = useCompanies();
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
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {session.user.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Manage your pharmacy inventory, suppliers, and sales from one centralized dashboard.
              View real-time analytics and track stock levels.
            </p>
          </div>

          {/* Key Metrics - Matching Stitch Design */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Daily Sales */}
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="font-semibold text-foreground">Daily Sales</h2>
                    <p className="text-sm text-success">▲ 12.5%</p>
                  </div>
                  <div className="text-2xl font-bold text-foreground">$4,280.50</div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Rx */}
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="font-semibold text-foreground">Pending Rx</h2>
                    <p className="text-sm text-muted-foreground">! </p>
                  </div>
                  <div className="text-2xl font-bold text-foreground">24</div>
                </div>
                <p className="text-sm text-muted-foreground">8 awaiting verification</p>
              </CardContent>
            </Card>

            {/* Low Stock */}
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="font-semibold text-foreground">Inventory</h2>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                  <div className="text-2xl font-bold text-foreground">12</div>
                </div>
                <p className="text-sm text-muted-foreground">3 critical items</p>
              </CardContent>
            </Card>

            {/* Active Patients */}
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="font-semibold text-foreground">Active Patients</h2>
                    <p className="text-sm text-success">▲ 4%</p>
                  </div>
                  <div className="text-2xl font-bold text-foreground">1,842</div>
                </div>
                <p className="text-sm text-muted-foreground">12 new today</p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Revenue Section */}
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Sales Revenue</h2>
              <p className="text-sm text-muted-foreground">Last 30 days performance</p>
            </div>
            <div className="flex flex-col sm:flex-row">
              <Button variant="outline" size="sm" className="mr-2">
                Day
              </Button>
              <Button variant="outline" size="sm" className="mr-2">
                Week
              </Button>
              <Button variant="default" size="sm">
                Month
              </Button>
            </div>
            {/* In a real implementation, you would show a chart here */}
            <div className="aspect-w-16 aspect-h-9 bg-muted rounded-lg mt-4">
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sales Revenue Chart Placeholder
              </div>
            </div>
          </div>

          {/* Prescription Distribution */}
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Prescription Distribution</h2>
              <p className="text-sm text-muted-foreground">148 Total Rx</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Chronic Care</span>
                <span className="font-medium text-foreground">65%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Acute Meds</span>
                <span className="font-medium text-foreground">25%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Other</span>
                <span className="font-medium text-foreground">10%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-muted rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Recent Transactions</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted">
                    <td className="px-4 py-3 text-sm font-mono text-foreground">#RX-8291</td>
                    <td className="px-4 py-3 text-sm text-foreground">Sarah Johnson</td>
                    <td className="px-4 py-3 text-sm text-success">Completed</td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">$45.00</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">⋯⋯⋯</td>
                  </tr>
                  <tr className="hover:bg-muted">
                    <td className="px-4 py-3 text-sm font-mono text-foreground">#RX-8292</td>
                    <td className="px-4 py-3 text-sm text-foreground">Robert Chen</td>
                    <td className="px-4 py-3 text-sm text-warning">Pending</td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">$124.20</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">⋯⋯⋯</td>
                  </tr>
                  <tr className="hover:bg-muted">
                    <td className="px-4 py-3 text-sm font-mono text-foreground">#RX-8293</td>
                    <td className="px-4 py-3 text-sm text-foreground">Emily Davis</td>
                    <td className="px-4 py-3 text-sm text-success">Completed</td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">$12.50</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">⋯⋯⋯</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Low Stock Alerts</h2>
              <span className="text-sm text-destructive font-medium">3 CRITICAL</span>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Amoxicillin 500mg</h3>
                <p className="text-sm text-muted-foreground">8 units remaining</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Restock
                  </Button>
                  <Button variant="outline" size="sm" className="text-muted-foreground">
                    Dismiss
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Lisinopril 10mg</h3>
                <p className="text-sm text-muted-foreground">15 units remaining</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Restock
                  </Button>
                  <Button variant="outline" size="sm" className="text-muted-foreground">
                    Dismiss
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Metformin 850mg</h3>
                <p className="text-sm text-muted-foreground">22 units remaining</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Restock
                  </Button>
                  <Button variant="outline" size="sm" className="text-muted-foreground">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Inventory Button */}
          <div className="mt-6 flex justify-end">
            <Button variant="default">Manage Inventory</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
