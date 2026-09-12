'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { usePurchaseOrder, useApprovePurchaseOrder, useReceivePurchaseOrder, useCancelPurchaseOrder } from '@/hooks/usePurchaseOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
  ArrowLeft,
  ShoppingCart,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Save,
  Trash2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'warning' | 'destructive' | 'success' }> = {
  PENDING: { label: 'Pending', icon: Clock, variant: 'warning' },
  APPROVED: { label: 'Approved', icon: CheckCircle, variant: 'secondary' },
  RECEIVED: { label: 'Received', icon: Package, variant: 'success' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, variant: 'destructive' },
};

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Purchase Order Detail Page
 * ──────────────────────────────────────────────────────────────────────────── */

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();
  const [cancelNotes, setCancelNotes] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: response, isLoading, error, refetch } = usePurchaseOrder(id);
  const po = response?.data;

  const approveMutation = useApprovePurchaseOrder();
  const receiveMutation = useReceivePurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();

  const statusConfig = po ? (STATUS_CONFIG[po.status] ?? STATUS_CONFIG.PENDING) : STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ id: po!.id, approvedBy: session?.user?.id ?? undefined });
    } catch {
      // Error handled by mutation
    }
  };

  const handleReceive = async () => {
    try {
      await receiveMutation.mutateAsync(po!.id);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ id: po!.id, notes: cancelNotes });
      setShowCancelConfirm(false);
      setCancelNotes('');
    } catch {
      // Error handled by mutation
    }
  };

  // Redirect to login if not authenticated
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

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
        <Card className="border-error/30 bg-error/10 card-elevated">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-error shrink-0" />
            <p className="text-body-md text-error">
              {error instanceof Error ? error.message : 'Failed to load purchase order'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
        <Card className="border-border bg-card card-elevated border-dashed">
          <CardContent className="flex min-h-75 flex-col items-center justify-center text-center px-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-headline-md text-foreground">Purchase Order not found</h3>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/purchase-orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Purchase Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = po.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const receivedItems = po.items?.reduce((sum, item) => sum + (item.receivedQty ?? 0), 0) ?? 0;
  const remainingItems = totalItems - receivedItems;

  const canApprove = po.status === 'PENDING';
  const canReceive = po.status === 'APPROVED' || po.status === 'PENDING';
  const canCancel = po.status === 'PENDING' || po.status === 'APPROVED';

  return (
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="w-full space-y-6">
        {/* ── Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/purchase-orders">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-headline-lg text-foreground">
                    PO #{po.poNumber}
                  </h1>
                  <Badge
                    variant={statusConfig.variant}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  {po.supplier?.name} · Created {formatDate(po.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <SidebarTrigger className="hidden md:flex" />
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2">
          {canApprove && (
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {approveMutation.isPending ? 'Approving...' : 'Approve Order'}
            </Button>
          )}
          {canReceive && (
            <Button onClick={handleReceive} disabled={receiveMutation.isPending} variant="secondary">
              <Package className="mr-2 h-4 w-4" />
              {receiveMutation.isPending ? 'Receiving...' : 'Receive Items'}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructiveOutline"
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          )}
        </div>

        {/* ── Error banners ── */}
        {approveMutation.isError && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-error" />
              <p className="text-body-sm text-error">{approveMutation.error?.message}</p>
            </CardContent>
          </Card>
        )}
        {receiveMutation.isError && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-error" />
              <p className="text-body-sm text-error">{receiveMutation.error?.message}</p>
            </CardContent>
          </Card>
        )}
        {cancelMutation.isError && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-error" />
              <p className="text-body-sm text-error">{cancelMutation.error?.message}</p>
            </CardContent>
          </Card>
        )}

        {/* ── Supplier Information ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-secondary mt-0.5" />
                <div>
                  <span className="text-label-sm text-on-surface-variant">Supplier</span>
                  <p className="text-body-md text-foreground">
                    {po.supplier?.name || '—'}
                  </p>
                </div>
              </div>

              {po.supplier?.contactName && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Contact Person</span>
                    <p className="text-body-md text-foreground">{po.supplier.contactName}</p>
                  </div>
                </div>
              )}

              {po.supplier?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Email</span>
                    <p className="text-body-md text-foreground">{po.supplier.email}</p>
                  </div>
                </div>
              )}

              {po.supplier?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Phone</span>
                    <p className="text-body-md text-foreground">{po.supplier.phone}</p>
                  </div>
                </div>
              )}

              {po.supplierRepresentative && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Representative</span>
                    <p className="text-body-md text-foreground">{po.supplierRepresentative.name}</p>
                    {po.supplierRepresentative.whatsappNumber && (
                      <p className="text-body-sm text-on-surface-variant">
                        WhatsApp: {po.supplierRepresentative.whatsappNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {po.expectedDeliveryDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Expected Delivery</span>
                    <p className="text-body-md text-foreground">
                      {formatDate(po.expectedDeliveryDate)}
                    </p>
                  </div>
                </div>
              )}

              {po.supplier?.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Address</span>
                    <p className="text-body-md text-foreground whitespace-pre-wrap">
                      {po.supplier.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Order Items ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">Line Items</CardTitle>
            <CardDescription>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} · {receivedItems} received
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-16">SKU</TableHead>
                  <TableHead className="w-20">Qty</TableHead>
                  <TableHead className="w-24">Received</TableHead>
                  <TableHead className="w-24">Unit Price</TableHead>
                  <TableHead className="w-24">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {item.product?.name || item.productId || 'Unnamed Product'}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-on-surface-variant">{item.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <TableCellMono>{item.product?.sku || '—'}</TableCellMono>
                    </TableCell>
                    <TableCell>
                      <TableCellMono>{item.quantity}</TableCellMono>
                    </TableCell>
                    <TableCell>
                      <TableCellMono>{item.receivedQty ?? 0}</TableCellMono>
                    </TableCell>
                    <TableCell>
                      <TableCellMono>{formatCurrency(item.unitPrice)}</TableCellMono>
                    </TableCell>
                    <TableCell>
                      <TableCellMono>
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </TableCellMono>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Summary */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Total Amount</span>
                <span className="text-data-mono font-bold text-headline-md text-foreground">
                  {formatCurrency(po.totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Notes ── */}
        {po.notes && (
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">
                {po.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Cancel Confirmation ── */}
        {showCancelConfirm && (
          <Card className="border-error/30 bg-error/5 card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md text-error">Cancel Purchase Order</CardTitle>
              <CardDescription>
                This action cannot be undone. Enter a reason for cancellation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
              />
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleCancel}>
                  Confirm Cancel
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
