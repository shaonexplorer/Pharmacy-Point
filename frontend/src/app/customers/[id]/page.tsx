'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: response, isLoading, error } = useCustomer(id);
  const deleteCustomerMutation = useDeleteCustomer();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.push('/login');
    }
  }, [session, authPending, router]);

  const customer = response?.data;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customer) return;

    try {
      await deleteCustomerMutation.mutateAsync(customer.id);
      router.push('/customers');
    } catch {
      // Error handled by mutation
    }
  };

  const errorMessage = error instanceof Error ? error.message : 'Failed to load customer';

  if (authPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="container-max">
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{errorMessage}</p>
              </div>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/customers">← Back to Customers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="container-max">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Customer not found.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/customers">← Back to Customers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate order totals
  const orders = customer.orders ?? [];
  const totalOrders = orders.length;
  const totalOrderValue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container-max">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/customers">← Back</Link>
            </Button>
            <h1 className="text-headline-lg text-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              {customer.name}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/customers/${customer.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              disabled={deleteCustomerMutation.isPending}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteCustomerMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Customer Details */}
        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{customer.name}</h2>
                  {customer.dueAmount > 0 && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-error/10 px-3 py-1 text-sm font-medium text-error">
                      <DollarSign className="h-4 w-4" />
                      Due: ${customer.dueAmount.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-body-sm">
                      <Mail className="h-4 w-4 text-on-surface-variant" />
                      <span className="text-on-surface-variant">Email:</span>
                      <span className="text-foreground">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-body-sm">
                      <Phone className="h-4 w-4 text-on-surface-variant" />
                      <span className="text-on-surface-variant">Phone:</span>
                      <span className="text-foreground">{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-body-sm md:col-span-2">
                      <MapPin className="h-4 w-4 text-on-surface-variant mt-0.5" />
                      <span className="text-on-surface-variant">Address:</span>
                      <span className="text-foreground">{customer.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-body-sm">
                    <DollarSign className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-on-surface-variant">Due Amount:</span>
                    <span
                      className={
                        customer.dueAmount > 0 ? 'text-error font-medium text-data-mono' : 'text-foreground text-data-mono'
                      }
                    >
                      ${customer.dueAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t border-border pt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Updated: {new Date(customer.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order History
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Total Orders: {totalOrders}</span>
                <span>Total Value: ${totalOrderValue.toFixed(2)}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 card-elevated"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground data-mono">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-body-sm text-on-surface-variant">
                        Status: {order.status} • Total: <span className="text-data-mono">{formatCurrency(order.total)}</span>
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === 'COMPLETED'
                          ? 'success'
                          : order.status === 'CANCELLED'
                            ? 'destructive'
                            : 'pending'
                      }
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No orders found for this customer.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Customer"
          description={`Are you sure you want to delete "${customer.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={deleteCustomerMutation.isPending}
        />
      </div>
    </div>
  );
}
