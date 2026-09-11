'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Package, RotateCw, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useOrder, useReturns, orderKeys } from '@/hooks/useOrders';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { RefundModal } from '@/components/orders/RefundModal';
import { ReturnModal } from '@/components/orders/ReturnModal';
import { ReceiptEmailForm } from '@/components/orders/ReceiptEmailForm';
import { formatCurrency } from '@/lib/formatters';
import type { OrderWithItems, OrderItemWithProduct } from '@pharmacy-point/types';

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const [refundOpen, setRefundOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: orderResponse, isLoading, refetch } = useOrder(id);
  const order: OrderWithItems | undefined = orderResponse?.data;
  const orderItems: OrderItemWithProduct[] = order?.items ?? [];

  // Return history
  const { data: returnsResponse, isLoading: isLoadingReturns } = useReturns(id);
  const returnedItems = returnsResponse?.data?.returnedItems ?? [];

  const handleRefundSuccess = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
  };

  const handleReturnSuccess = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    queryClient.invalidateQueries({ queryKey: [...orderKeys.detail(id), 'returns'] });
  };

  // Determine if refund/return actions are available based on status
  const canRefund = order && order.status !== 'REFUNDED' && order.status !== 'CANCELLED';
  const canReturn =
    order && order.status !== 'RETURNED' && order.status !== 'CANCELLED' && orderItems.length > 0;
  const hasReturnableItems = orderItems.some(
    (item) => (item.quantity || 0) - (item.returnedQuantity || 0) > 0
  );
  const canReturnFinal = canReturn && hasReturnableItems;

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-low rounded w-3/4"></div>
          <div className="h-4 bg-surface-container-low rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-surface-container-low rounded"></div>
            <div className="h-4 bg-surface-container-low rounded"></div>
            <div className="h-4 bg-surface-container-low rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <p className="text-on-surface-variant">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <Link
        href="/pos"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to POS
      </Link>

      {/* Order Header Card */}
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-headline-md">Order Details</CardTitle>
            <p className="text-label-md text-on-surface-variant mt-1">
              Order #{order.id.slice(0, 8)} — {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <p className="text-label-md text-on-surface-variant">Customer</p>
              <p className="text-body-md font-medium">{order.customer?.name ?? 'Walk-in'}</p>
            </div>
            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <p className="text-label-md text-on-surface-variant">Total</p>
              <p className="text-data-mono font-medium">{formatCurrency(order.total)}</p>
            </div>
            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <p className="text-label-md text-on-surface-variant">Payment</p>
              <p className="text-body-md font-medium">
                {(order.paymentMethod ?? 'cash').toUpperCase()}
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <p className="text-label-md text-on-surface-variant">Staff</p>
              <p className="text-body-md font-medium">{order.user?.name ?? 'N/A'}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {canRefund && (
              <Button
                variant="outline"
                size="tablet"
                className="flex-1"
                onClick={() => setRefundOpen(true)}
              >
                <Undo2 className="mr-2 h-4 w-4" />
                Refund
              </Button>
            )}
            {canReturnFinal && (
              <Button
                variant="outline"
                size="tablet"
                className="flex-1"
                onClick={() => setReturnOpen(true)}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Return
              </Button>
            )}
            {order.status === 'COMPLETED' && (
              <Button
                variant="secondary"
                size="tablet"
                className="flex-1"
                onClick={() => setRefundOpen(true)}
              >
                <Package className="mr-2 h-4 w-4" />
                Partial Refund
              </Button>
            )}
          </div>

          {/* Receipt email form */}
          {order.receiptEmail && <ReceiptEmailForm orderId={order.id} onSent={refetch} />}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-headline-md">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {item.product?.name ?? 'Unknown Product'}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    SKU: {item.product?.sku ?? '—'} | ${item.product?.price?.toFixed(2) ?? '0.00'} ×{' '}
                    {item.quantity}
                  </p>
                  {item.refunded && <span className="text-xs text-secondary">Refunded</span>}
                  {item.returnedQuantity && item.returnedQuantity > 0 && (
                    <span className="text-xs text-secondary ml-2">
                      Returned: {item.returnedQuantity}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-data-mono font-medium">
                    ${formatCurrency(Number(item.price) * item.quantity).replace('$', '')}
                  </p>
                  {(item.refunded || (item.returnedQuantity && item.returnedQuantity > 0)) && (
                    <span className="text-xs text-on-surface-variant">
                      {item.refunded && 'Refunded · '}
                      {item.returnedQuantity &&
                        item.returnedQuantity > 0 &&
                        `Returned: ${item.returnedQuantity}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="border-t border-border pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-body-md">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="text-data-mono">{formatCurrency(Number(order.subtotal))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Discount</span>
                <span className="text-data-mono text-destructive">
                  -{formatCurrency(Number(order.discount))}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-data-mono text-primary">
                {formatCurrency(Number(order.total))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return History */}
      {order.status !== 'CANCELLED' && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">Return History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingReturns ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-surface-container-low rounded w-3/4"></div>
                <div className="h-4 bg-surface-container-low rounded w-1/2"></div>
              </div>
            ) : returnedItems.length > 0 ? (
              <div className="space-y-3">
                {returnedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {item.product?.name ?? 'Unknown Product'}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        Returned: {item.returnedQuantity} | SKU: {item.product?.sku ?? '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Clock className="h-4 w-4" />
                No returns recorded for this order.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <RefundModal
        orderId={order.id}
        open={refundOpen}
        maxAmount={Number(order.total)}
        onClose={() => setRefundOpen(false)}
        onSuccess={handleRefundSuccess}
      />
      <ReturnModal
        orderId={order.id}
        items={orderItems.map((item) => ({
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          returnedQuantity: item.returnedQuantity,
        }))}
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        onSuccess={handleReturnSuccess}
      />
    </div>
  );
}
