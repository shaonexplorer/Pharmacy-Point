'use client';

/**
 * Clinical Precision — Procurement Page
 *
 * Full-page interface for reviewing the procurement cart, selecting a supplier
 * and representative, and submitting a purchase order. This is the primary
 * destination for the "Procurement" navigation entry.
 *
 * Signature: prescription-border-l (4px Pharma Teal left accent) on header,
 * data-mono for all numerical pricing, 8px rhythm spacing.
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreatePurchaseOrder } from '@/hooks/usePurchaseOrders';
import { useProcurementCart } from '@/context/ProcurementCartContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ShoppingCart,
  Save,
  Loader2,
  AlertCircle,
  Calendar,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Package,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableCellMono,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/formatters';
import { buildWhatsAppLink, formatPOWhatsAppMessage } from '@/lib/whatsapp';
import type { PurchaseOrderWithItems, WhatsAppPOResponse } from '@pharmacy-point/types';

export default function ProcurementPage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  // The PO returned by the last successful creation (used for WhatsApp sharing)
  const [createdPO, setCreatedPO] = useState<PurchaseOrderWithItems | null>(null);

  // WhatsApp API status and sending state
  const [whatsAppConfigured, setWhatsAppConfigured] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const [whatsAppResponse, setWhatsAppResponse] = useState<WhatsAppPOResponse | null>(null);

  // Check if WhatsApp Business API is configured on mount
  useEffect(() => {
    api.notifications.whatsAppStatus().then((res) => {
      setWhatsAppConfigured(res.data?.configured ?? false);
    }).catch(() => {
      setWhatsAppConfigured(false);
    });
  }, []);

  const {
    items,
    subtotal,
    isEmpty,
    itemCount,
    totalQuantity,
    addItem,
    removeItem,
    updateQuantity,
    resetCart,
    clearItems,
  } = useProcurementCart();

  const { data: suppliersResponse } = useSuppliers({ page: 1, limit: 100 });
  const suppliers = suppliersResponse?.data ?? [];

  const createPOMutation = useCreatePurchaseOrder();

  // Filter representatives by selected supplier
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const representatives = selectedSupplier?.representatives ?? [];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.replace('/login');
    }
  }, [session, authPending, router]);

  const handleSubmit = async () => {
    if (!selectedSupplierId || items.length === 0) return;

    try {
      const poResponse = await createPOMutation.mutateAsync({
        supplierId: selectedSupplierId,
        supplierRepresentativeId: selectedRepId ?? undefined,
        expectedDeliveryDate: expectedDate || undefined,
        notes: notes || undefined,
        createdById: session?.user?.id ?? undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      // Capture the created PO so we can offer WhatsApp sharing
      setCreatedPO(poResponse?.data ?? null);

      // Reset WhatsApp state for the new PO
      setWhatsAppError(null);
      setWhatsAppResponse(null);

      // Reset cart and form on success
      resetCart();
      setSelectedSupplierId(null);
      setSelectedRepId(null);
      setExpectedDate('');
      setNotes('');
      // Show success view instead of immediately navigating
    } catch {
      // Error handled by mutation state
    }
  };

  const handleQuantityChange = (productId: string, newQty: number) => {
    updateQuantity(productId, Math.max(1, newQty));
  };

  const handleClearCart = () => {
    clearItems();
    setCreatedPO(null);
  };

  if (authPending) {
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
    <div className="min-h-screen bg-background sm:max-w-7xl mx-auto">
      <div className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          {/* ── Page Header (signature: prescription-border-l accent) ── */}
          <div className="prescription-border-l pl-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/inventory">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-headline-lg text-foreground flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Procurement
                </h1>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Review your cart and place purchase orders with suppliers.
                </p>
              </div>
            </div>
          </div>

          {/* ── Empty State ── */}
          {isEmpty && !createdPO && (
            <Card className="border-border bg-card card-elevated border-dashed">
              <CardContent className="flex min-h-75 flex-col items-center justify-center text-center px-8">
                <Package className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-headline-md text-foreground">Cart is empty</h3>
                <p className="mt-2 text-body-md text-on-surface-variant">
                  Go to the Inventory page and click "Add to Cart" on products that need restocking.
                </p>
                <Button asChild variant="default" className="mt-4">
                  <Link href="/inventory">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go to Inventory
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Cart Items + Order Details / Success View ── */}
          {(!isEmpty || createdPO) && (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              {/* Left Column: Cart Items */}
              <Card className="border-border bg-card card-elevated">
                <CardHeader>
                  <CardTitle className="text-headline-md">
                    Cart Items ({totalQuantity} units)
                  </CardTitle>
                  <CardDescription>
                    {items.length} {items.length === 1 ? 'product' : 'products'} selected
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="w-20">Qty</TableHead>
                        <TableHead className="w-24">Unit Price</TableHead>
                        <TableHead className="w-24">Total</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div className="font-medium text-foreground">{item.product.name}</div>
                            <div className="text-xs text-on-surface-variant">
                              SKU: {item.product.sku}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  handleQuantityChange(item.productId, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-data-mono w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  handleQuantityChange(item.productId, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TableCellMono>{formatCurrency(item.unitPrice)}</TableCellMono>
                          </TableCell>
                          <TableCell>
                            <TableCellMono>
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </TableCellMono>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => removeItem(item.productId)}
                              aria-label={`Remove ${item.product.name}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="border-t border-border px-4 py-3">
                    <div className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">Total ({totalQuantity} units)</span>
                      <span className="text-data-mono font-bold text-headline-md text-foreground">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Order Details */}
              <div className="flex flex-col gap-6">
                {/* Supplier & Representative Selection */}
                <Card className="border-border bg-card card-elevated">
                  <CardHeader>
                    <CardTitle className="text-headline-md">Supplier Details</CardTitle>
                    <CardDescription>Select who you're ordering from</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier" className="text-label-md text-foreground">
                        Supplier *
                      </Label>
                      <Select
                        value={selectedSupplierId ?? ''}
                        onValueChange={setSelectedSupplierId}
                      >
                        <SelectTrigger id="supplier" className="w-full!">
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedSupplierId && representatives.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="representative" className="text-label-md text-foreground">
                          Representative
                        </Label>
                        <Select value={selectedRepId ?? ''} onValueChange={setSelectedRepId}>
                          <SelectTrigger id="representative" className="w-full!">
                            <SelectValue placeholder="Select a representative (optional)" />
                          </SelectTrigger>
                          <SelectContent className="w-full!">
                            {representatives.map((rep) => (
                              <SelectItem key={rep.id} value={rep.id}>
                                {rep.name}
                                {rep.designation && ` — ${rep.designation}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="expected-delivery" className="text-label-md text-foreground">
                        Expected Delivery Date
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="expected-delivery"
                          type="date"
                          value={expectedDate}
                          onChange={(e) => setExpectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="pl-9 pr-4"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-label-md text-foreground">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Order notes, special requests..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[80px] text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions / Success View */}
                {createdPO ? (
                  <Card className="border-success/30 bg-success/5 card-elevated">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-headline-sm">
                        <CheckCircle className="h-5 w-5 text-success" />
                        Purchase Order Created
                      </CardTitle>
                      <CardDescription>
                        PO #{createdPO.poNumber} · {formatCurrency(createdPO.totalAmount)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {createdPO.supplierRepresentative?.whatsappNumber ? (
                        <p className="text-body-sm text-on-surface-variant mb-4">
                          Send this order to{' '}
                          <strong>{createdPO.supplierRepresentative.name}</strong> via
                          WhatsApp.
                          {!whatsAppConfigured && (
                            <span className="block mt-1 text-xs italic">
                              (WhatsApp Business API not configured — will open
                              web version as fallback)
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-body-sm text-on-surface-variant mb-4">
                          The selected representative does not have a WhatsApp number on
                          file.
                        </p>
                      )}

                      <div className="flex flex-col gap-3">
                        {createdPO.supplierRepresentative?.whatsappNumber && (
                          <div>
                            {whatsAppError && (
                              <div className="mb-3 rounded-lg border border-error/30 bg-error/10 p-3">
                                <p className="text-sm text-error">{whatsAppError}</p>
                              </div>
                            )}
                            {whatsAppResponse?.success && (
                              <div className="mb-3 rounded-lg border border-success/30 bg-success/10 p-3">
                                <p className="text-sm text-success">{whatsAppResponse.message}</p>
                              </div>
                            )}
                            <Button
                              className="w-full"
                              size="lg"
                              disabled={isSendingWhatsApp || whatsAppResponse?.success}
                              onClick={async () => {
                                setIsSendingWhatsApp(true);
                                setWhatsAppError(null);
                                setWhatsAppResponse(null);

                                try {
                                  const response = await api.notifications.sendWhatsAppPO({
                                    purchaseOrderId: createdPO.id,
                                  });
                                  const data = response.data;

                                  if (data?.success) {
                                    setWhatsAppResponse(data);
                                  } else {
                                    // Fallback: open wa.me link in new tab
                                    if (data?.fallbackLink) {
                                      window.open(
                                        data.fallbackLink,
                                        '_blank',
                                        'noopener,noreferrer'
                                      );
                                    }
                                    setWhatsAppResponse(data ?? null);
                                  }
                                } catch (err) {
                                  const msg =
                                    err instanceof Error ? err.message : 'Failed to send WhatsApp message';
                                  setWhatsAppError(msg);

                                  // Fallback: construct wa.me link directly
                                  const rep = createdPO.supplierRepresentative!;
                                  const textMsg = formatPOWhatsAppMessage({
                                    representativeName: rep.name,
                                    poNumber: createdPO.poNumber,
                                    items: createdPO.items ?? [],
                                    totalAmount: createdPO.totalAmount,
                                    expectedDeliveryDate: createdPO.expectedDeliveryDate,
                                    notes: createdPO.notes,
                                  });
                                  const fallback = buildWhatsAppLink(rep.whatsappNumber!, textMsg);
                                  if (fallback) {
                                    window.open(fallback, '_blank', 'noopener,noreferrer');
                                  }
                                } finally {
                                  setIsSendingWhatsApp(false);
                                }
                              }}
                            >
                              {isSendingWhatsApp ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending via WhatsApp API...
                                </>
                              ) : (
                                <>
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Send via WhatsApp
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="default"
                          className="w-full"
                          onClick={() => {
                            setCreatedPO(null);
                            setWhatsAppResponse(null);
                            setWhatsAppError(null);
                            router.push('/purchase-orders');
                          }}
                        >
                          View Purchase Orders
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Error */}
                    {createPOMutation.isError && (
                      <div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-3">
                        <div className="flex items-center gap-2 text-error">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-sm">
                            {createPOMutation.error?.message || 'Failed to create purchase order'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={handleClearCart}
                        className="w-full text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Cart
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={isEmpty || !selectedSupplierId || createPOMutation.isPending}
                        className="w-full"
                        size="lg"
                      >
                        {createPOMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Purchase Order...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Create Purchase Order
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
