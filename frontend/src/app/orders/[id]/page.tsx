'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefundModal } from '@/components/orders/RefundModal';
import { ReturnModal } from '@/components/orders/ReturnModal';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RotateCcw, Undo2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const [refundOpen, setRefundOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to load order');
      return res.json();
    },
  });

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/pos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to POS
      </Link>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-headline-md">Order Details</CardTitle>
            <p className="text-label-md text-on-surface-variant mt-1">{order?.id ? `Order #${order.id.slice(0, 8)}` : 'Loading...'}</p>
          </div>
          {order && <OrderStatusBadge status={order.status} />}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <p className="text-label-md text-on-surface-variant">Customer</p>
              <p className="text-body-md font-medium">{order?.customer?.name ?? 'Walk-in'}</p>
            </div>
            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <p className="text-label-md text-on-surface-variant">Total</p>
              <p className="text-data-mono font-medium">${order?.total?.toFixed(2) ?? '--'}</p>
            </div>
            <div className="rounded-md border border-border bg-surface-container-low/60 p-3">
              <p className="text-label-md text-on-surface-variant">Staff</p>
              <p className="text-body-md font-medium">{order?.user?.name ?? 'N/A'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="tablet" onClick={() => setRefundOpen(true)} className="flex-1">
              <Undo2 className="mr-2 h-4 w-4" /> Refund
            </Button>
            <Button variant="outline" size="tablet" onClick={() => setReturnOpen(true)} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" /> Return
            </Button>
          </div>
        </CardContent>
      </Card>

      <RefundModal open={refundOpen} onOpenChange={setRefundOpen} orderId={id} />
      <ReturnModal open={returnOpen} onOpenChange={setReturnOpen} orderId={id} />
    </div>
  );
}
