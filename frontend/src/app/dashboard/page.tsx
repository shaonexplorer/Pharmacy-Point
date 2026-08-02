'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  LogOut,
  Loader2,
  Package,
  Store,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, error, isPending } = useSession();

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
              Welcome back, {session.user.name || 'User'}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your pharmacy inventory and company profiles from one centralized dashboard.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">152</div>
                <p className="text-xs text-muted-foreground">+12 from last month</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Companies</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">8</div>
                <p className="text-xs text-muted-foreground">All active</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Low Stock Items
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">5</div>
                <p className="text-xs text-muted-foreground">Below threshold</p>
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
                <Link href="/products">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">View Products</div>
                    <span className="text-xs text-muted-foreground">See all items</span>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                className="justify-start gap-3 rounded-lg p-4 shadow-sm hover:shadow-md"
                variant="outline"
              >
                <Link href="/companies">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">View Companies</div>
                    <span className="text-xs text-muted-foreground">See all suppliers</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>

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