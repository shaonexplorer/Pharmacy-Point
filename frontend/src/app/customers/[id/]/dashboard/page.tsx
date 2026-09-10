'use client';

import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableCellMono,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useCustomerDashboard } from '@/hooks/useCustomers';
import { DuePaymentForm } from '@/components/customers/DuePaymentForm';
import { LoyaltyPointsDisplay } from '@/components/customers/LoyaltyPointsDisplay';
import { DueAccountAlertSettings } from '@/components/customers/DueAccountAlertSettings';
import { CustomerSegmentation } from '@/components/customers/CustomerSegmentation';
import {
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Clock,
  ShoppingCart,
  FileText,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { OrderWithItems, DuePaymentWithCustomer } from '@pharmacy-point/types';

const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Silver: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Platinum: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-success/10 text-success',
  PENDING: 'bg-warning/10 text-warning',
  CANCELLED: 'bg-muted text-muted-foreground',
  REFUNDED: 'bg-secondary/10 text-secondary',
  PARTIALLY_REFUNDED: 'bg-warning/10 text-warning',
  RETURNED: 'bg-error/10 text-error',
};

function s(count: number) {
  return count === 1 ? '' : 's';
}

export default function CustomerDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: dashboardResponse, isLoading, error } = useCustomerDashboard(id ?? '');

  const dashboard = dashboardResponse?.data;
  const customer = dashboard?.customer;
  const orders = dashboard?.orders ?? [];
  const payments = dashboard?.payments ?? [];

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-dashboard', id] });
    queryClient.invalidateQueries({ queryKey: ['customers', 'detail', id] });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-2 text-body-sm text-on-surface-variant">Loading customer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card className="border-error/30 bg-error/10 card-elevated">
          <CardContent className="flex items-center gap-2 p-4 text-error">
            <FileText className="h-4 w-4" />
            <p className="text-body-md">
              {error instanceof Error ? error.message : 'Failed to load customer dashboard.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboard || !customer) {
    return (
      <div className="flex-1 p-6">
        <Card className="border-border bg-card card-elevated">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-body-md text-on-surface-variant">Customer not found.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/customers">
                <ExternalLink className="mr-2 h-4 w-4" />
                Back to Customers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dueAmount = Number(customer.dueAmount ?? 0);
  const lifetimeValue = Number(dashboard.lifetimeValue ?? 0);
  const totalPoints = dashboard.loyaltyPoints ?? 0;
  const pointsEarned = dashboard.pointsEarned ?? 0;
  const pointsRedeemed = dashboard.pointsRedeemed ?? 0;
  const tier = dashboard.loyaltyTier ?? 'Bronze';

  const tierColor = TIER_COLORS[tier] ?? TIER_COLORS.Bronze;

  return (
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="w-full space-y-6">
        {/* Page Header */}
        <div className="prescription-border-l pl-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-headline-lg text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {customer.name} - Dashboard
              </h1>
              <p className="mt-1 text-body-md text-on-surface-variant">
                {customer.email ?? 'No email'} {customer.phone ? ' - ' + customer.phone : ''}
              </p>
            </div>
            <Badge className={cn('text-xs font-medium', tierColor)}>
              {tier} Tier
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="card-elevated p-5">
                <div className="text-body-sm text-on-surface-variant">Lifetime Value</div>
                <div className="text-2xl font-bold data-mono text-primary">
                  {formatCurrency(lifetimeValue)}
                </div>
              </Card>
              <Card className="card-elevated p-5">
                <div className="text-body-sm text-on-surface-variant">Points Earned</div>
                <div className="text-2xl font-bold data-mono">
                  {pointsEarned}
                </div>
              </Card>
              <Card className="card-elevated p-5">
                <div className="text-body-sm text-on-surface-variant">Points Redeemed</div>
                <div className="text-2xl font-bold data-mono">
                  {pointsRedeemed}
                </div>
              </Card>
              <Card className="card-elevated p-5">
                <div className="text-body-sm text-on-surface-variant">Due Amount</div>
                <div
                  className={cn(
                    'text-2xl font-bold data-mono',
                    dueAmount > 0 ? 'text-error' : 'text-success'
                  )}
                >
                  {formatCurrency(dueAmount)}
                </div>
              </Card>
            </div>

            {/* Contact Info + Due Payment */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Customer Information
                  </CardTitle>
                  <CardDescription>
                    Contact details and account summary.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-label-md text-on-surface-variant w-32">Name:</span>
                    <span className="text-foreground">{customer.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-label-md text-on-surface-variant w-32">Email:</span>
                    <span className="text-foreground">{customer.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-label-md text-on-surface-variant w-32">Phone:</span>
                    <span className="text-foreground">{customer.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-label-md text-on-surface-variant w-32">Customer since:</span>
                    <span className="text-foreground">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-on-surface-variant" />
                      <span className="text-label-md text-on-surface-variant">Loyalty Points:</span>
                      <span className="text-foreground font-bold data-mono">
                        {totalPoints} points
                      </span>
                    </div>
                    {dueAmount > 0 && (
                      <DuePaymentForm
                        customerId={customer.id}
                        onSuccess={handlePaymentSuccess}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <LoyaltyPointsDisplay
                  points={totalPoints}
                  tier={tier}
                  lifetimeSpend={lifetimeValue}
                />
                <DueAccountAlertSettings />
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  {orders.length} total orders - Lifetime value: {formatCurrency(lifetimeValue)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-on-surface-variant">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-body-md">No orders found for this customer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: OrderWithItems) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-body-sm">
                                <Calendar className="h-3 w-3 text-on-surface-variant" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  ORDER_STATUS_COLORS[order.status] ?? 'bg-muted text-muted-foreground'
                                )}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right data-mono">
                              {formatCurrency(Number(order.total))}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button asChild variant="ghostIcon" size="sm">
                                <Link href={'/orders/' + order.id}>
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  {payments.length} payment record{s(payments.length)} for this customer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-on-surface-variant">
                    <DollarSign className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-body-md">No payment records found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Recorded By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment: DuePaymentWithCustomer) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="flex items-center gap-1 text-body-sm">
                                <Clock className="h-3 w-3 text-on-surface-variant" />
                                {new Date(payment.createdAt).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-data-mono text-success">
                                +{formatCurrency(Number(payment.amount))}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-on-surface-variant">
                                {payment.notes || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {payment.orderId ? (
                                <span className="text-body-sm data-mono">
                                  #{payment.orderId.slice(0, 8)}
                                </span>
                              ) : (
                                <span className="text-on-surface-variant">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-body-sm text-on-surface-variant">
                                {payment.user?.name ?? payment.user?.email ?? 'System'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Loyalty & Rewards</CardTitle>
                <CardDescription>
                  Points balance, tier benefits, and customer segmentation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <LoyaltyPointsDisplay
                  points={totalPoints}
                  tier={tier}
                  lifetimeSpend={lifetimeValue}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Card className="border border-border bg-surface-container-low/40 p-4 text-center">
                    <div className="text-2xl font-bold data-mono text-primary">{pointsEarned}</div>
                    <div className="text-xs text-on-surface-variant">Points Earned</div>
                  </Card>
                  <Card className="border border-border bg-surface-container-low/40 p-4 text-center">
                    <div className="text-2xl font-bold data-mono text-secondary">{pointsRedeemed}</div>
                    <div className="text-xs text-on-surface-variant">Points Redeemed</div>
                  </Card>
                  <Card className="border border-border bg-surface-container-low/40 p-4 text-center">
                    <div className="text-2xl font-bold data-mono text-tertiary">
                      {Math.round(lifetimeValue)}
                    </div>
                    <div className="text-xs text-on-surface-variant">$1 = 1 point</div>
                  </Card>
                </div>

                <div className="pt-4">
                  <CustomerSegmentation
                    onFilterChange={(_filters) => {
                      /* segmentation filter - could drive a customer list */
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
