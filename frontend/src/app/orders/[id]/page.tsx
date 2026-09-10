'use client';

import { useState, useEffect, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefundModal } from '@/components/orders/RefundModal';
import { ReturnModal } from '@/components/orders/ReturnModal';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import {
  Loader2,
  ArrowLeft,
  RotateCcw,
  Undo2,
  ShoppingCart,
  User,
  DollarSign,
  Clock,
  Package,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Order Detail Page
 *
 * Shows full order details including:
 *  - Order status badge (color-coded per DESIGN.md)
 *  - Customer information with contact details
 *  - Payment method and staff attribution
 *  - Line items table with product details
 *  - Refund and Return action modals
 *
 * Design spec:
 *  - prescription-border-l accent on header
 *  - card-elevated cards with shadow hover
 *  - data-mono for all numerical values (prices, totals)
 *  - Status badges with clinical color coding
 *  - Tertiary (Safety Green) for success states
 */
export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();

  const { data: orderResponse, isLoading, refetch } = useOrder(id);
  const order = orderResponse?.data;

  const [refundOpen, setRefundOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (!authPending && !session) {
      router.replace('/login');
    }
  }, [session, authPending, router]);

  if (authPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  if (!order) {
    return (
      <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
        <Card className="border-border bg-card card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Order not found. Please check the order ID or return to POS.</p>
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/pos">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to POS
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRefundable =
    order.status !== 'CANCELLED' &&
    order.status !== 'REFUNDED' &&
    order.status !== 'RETURNED';

  const canReturn = order.status === 'COMPLETED';

  const handleRefundSuccess = () => {
    refetch();
  };

  const handleReturnSuccess = () => {
    refetch();
  };

  return (
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="prescription-border-l pl-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-headline-lg text-foreground">Order Details</h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Order #{order.id.slice(-8)} · {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/prescriptions">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Prescriptions
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/pos">
              <ShoppingCart className="mr-2 h-4 w-4" /> Back to POS
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Status + Actions ── */}
      <Card className="border-border bg-card card-elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-headline-md">
              Order #{order.id.slice(-8)}
            </CardTitle>
            <CardDescription className="text-label-md text-on-surface-variant mt-1">
              Created on {formatDate(order.createdAt)}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {order && <OrderStatusBadge status={order.status} />}
            {order.isCreditSale && (
              <Badge
                variant="secondary"
                size="sm"
                className="border-warning/30 bg-warning/10 text-warning"
              >
                Credit Sale
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ── Order Vitals ── */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-secondary" />
                <p className="text-label-md text-on-surface-variant">Customer</p>
              </div>
              <p className="text-body-md font-medium text-foreground mt-1">
                {order.customer?.name ?? 'Walk-in'}
              </p>
              {order.customer?.phone && (
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  {order.customer.phone}
                </p>
              )}
              {order.customer?.email && (
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  {order.customer.email}
                </p>
              )}
            </div>

            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-tertiary" />
                <p className="text-label-md text-on-surface-variant">Order Total</p>
              </div>
              <p className="text-2xl font-bold text-data-mono text-foreground mt-1">
                {formatCurrency(order.total)}
              </p>
              {order.tax > 0 && (
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Tax: {formatCurrency(order.tax)}
                </p>
              )}
            </div>

            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <p className="text-label-md text-on-surface-variant">Payment</p>
              </div>
              <p className="text-body-md font-medium text-foreground mt-1 capitalize">
                {order.paymentMethod ?? 'Cash'}
              </p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Staff: {order.user?.name ?? 'N/A'}
              </p>
            </div>
          </div>

          {/* ── Credit Sale Due Amount ── */}
          {order.isCreditSale && order.customer && (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <p className="text-label-md text-warning">Credit Account</p>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Due amount: <span className="font-bold text-data-mono text-warning">
                  {formatCurrency(order.customer.dueAmount || 0)}
                </span>
              </p>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="flex gap-3">
            {isRefundable && (
              <Button
                variant="outline"
                size="tablet"
                onClick={() => setRefundOpen(true)}
                className="flex-1"
              >
                <Undo2 className="mr-2 h-4 w-4" /> Refund
              </Button>
            )}
            {canReturn && (
              <Button
                variant="outline"
                size="tablet"
                onClick={() => setReturnOpen(true)}
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Return
              </Button>
            )}
            {order.status === 'COMPLETED' && (
              <Button asChild variant="outline" size="tablet" className="flex-1">
                <Link href={`/orders/${order.id}/receipt`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Receipt
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Line Items Table ── */}
      <Card className="border-border bg-card card-elevated overflow-hidden">
        <CardHeader className="bg-surface-container/40 pb-3">
          <CardTitle className="text-headline-sm">Line Items</CardTitle>
          <CardDescription>{order.items.length} item(s) in this order</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">SKU</th>
                  <th className="text-center px-4 py-3 whitespace-nowrap">Qty</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Unit Price</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Line Total</th>
                  <th className="text-center px-4 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-on-surface-variant" />
                        <span className="text-sm font-medium text-foreground">
                          {item.product?.name ?? 'Unknown Product'}
                        </span>
                      </div>
                      {item.product?.category === 'Prescription Medications' && (
                        <Badge variant="outline" size="sm" className="mt-1">
                          Rx
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs text-on-surface-variant">
                        {item.product?.sku ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="font-mono text-sm text-foreground">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-mono text-sm text-foreground">
                        {formatCurrency(item.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {item.refunded && (
                        <OrderStatusBadge status="REFUNDED" />
                      )}
                      {item.returnedQuantity && item.returnedQuantity > 0 && (
                        <Badge variant="outline" size="sm" className="text-warning">
                          {item.returnedQuantity} returned
                        </Badge>
                      )}
                      {!item.refunded && (!item.returnedQuantity || item.returnedQuantity === 0) && (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Totals Summary ── */}
          <div className="border-t border-border/40 p-4">
            <div className="flex justify-end">
              <div className="w-56 space-y-1">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-mono text-foreground">
                    {formatCurrency(order.subtotal ?? order.total)}
                  </span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Tax ({order.taxRate ? `${(order.taxRate * 100).toFixed(1)}%` : 'N/A'})</span>
                  <span className="font-mono text-foreground">
                    {formatCurrency(order.tax ?? 0)}
                  </span>
                </div>
                <Separator className="border-border/40 my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="font-mono text-primary">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Refund Modal ── */}
      {refundOpen && (
        <RefundModal
          orderId={id}
          onClose={() => setRefundOpen(false)}
          onSuccess={handleRefundSuccess}
        />
      )}

      {/* ── Return Modal ── */}
      {returnOpen && (
        <ReturnModal
          orderId={id}
          items={order.items.map((item) => ({
            id: item.id,
            productName: item.product?.name ?? 'Unknown Product',
            quantity: item.quantity,
          }))}
          onClose={() => setReturnOpen(false)}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}
