'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreatePurchaseOrder } from '@/hooks/usePurchaseOrders';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Save,
  Loader2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { ProcurementCartItem } from '@/context/ProcurementCartContext';
import { useProcurementCart } from '@/context/ProcurementCartContext';
import {
  Table,
  TableBody,
  TableCell,
  TableCellMono,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProcurementCartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Clinical Precision — Procurement Cart Sheet
 *
 * A right-side drawer that slides in from the inventory/suppliers page,
 * showing the current procurement cart with:
 *  - Line items with quantity adjusters (40px touch targets per DESIGN.md)
 *  - Supplier selection dropdown
 *  - Representative selection (filtered by supplier)
 *  - Expected delivery date picker
 *  - Notes textarea
 *  - Submit → creates a PurchaseOrder via the backend API
 */
export function ProcurementCartSheet({ open, onOpenChange }: ProcurementCartSheetProps) {
  const { data: session } = useSession();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  const { items, subtotal, isEmpty, removeItem, updateQuantity, resetCart } = useProcurementCart();

  const { data: suppliersResponse } = useSuppliers({ page: 1, limit: 100 });
  const suppliers = suppliersResponse?.data ?? [];

  // Filter representatives by selected supplier
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const representatives = selectedSupplier?.representatives ?? [];

  const createPOMutation = useCreatePurchaseOrder();

  const handleQuantityChange = (productId: string, newQty: number) => {
    const qty = Math.max(1, newQty);
    updateQuantity(productId, qty);
  };

  const handleSubmit = async () => {
    if (!selectedSupplierId || items.length === 0) return;

    try {
      await createPOMutation.mutateAsync({
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

      // Reset cart and form on success
      resetCart();
      setSelectedSupplierId(null);
      setSelectedRepId(null);
      setExpectedDate('');
      setNotes('');
      onOpenChange(false);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleClearCart = () => {
    resetCart();
    setSelectedSupplierId(null);
    setSelectedRepId(null);
    setExpectedDate('');
    setNotes('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-lg sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Procurement Cart
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Cart Items */}
          {items.length === 0 ? (
            <Card className="border-dashed border-border card-elevated">
              <CardContent className="flex min-h-[120px] flex-col items-center justify-center text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-body-md text-on-surface-variant">
                  The procurement cart is empty
                </p>
                <p className="text-xs text-on-surface-variant/70">
                  Search inventory and click "Add to Cart" to start ordering
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-border card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle className="text-headline-sm">
                    Items ({items.reduce((sum, i) => sum + i.quantity, 0)})
                  </CardTitle>
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
                      {items.map((item: ProcurementCartItem) => (
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
                      <span className="text-on-surface-variant">Subtotal</span>
                      <span className="text-data-mono font-medium text-foreground">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier & Representative Selection */}
              <Card className="border-border card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle className="text-headline-sm">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 w-full">
                    <Label htmlFor="supplier" className="text-label-md text-foreground">
                      Supplier *
                    </Label>
                    <Select value={selectedSupplierId ?? ''} onValueChange={setSelectedSupplierId}>
                      <SelectTrigger id="supplier" className="w-full!">
                        <SelectValue
                          placeholder="Select a supplier"
                          className="text-muted-foreground w-full!"
                        />
                      </SelectTrigger>
                      <SelectContent className="w-full!">
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
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Error */}
              {createPOMutation.isError && (
                <Card className="border-error/30 bg-error/10 card-elevated">
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-error shrink-0" />
                    <p className="text-body-md text-error">
                      {createPOMutation.error?.message || 'Failed to create purchase order'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <SheetFooter className="flex gap-2 pt-4 border-t border-border">
          {!isEmpty && items.length > 0 && (
            <Button
              variant="outline"
              size="default"
              onClick={handleClearCart}
              disabled={createPOMutation.isPending}
            >
              <Trash2 className="mr-2 h-3 w-3" />
              Clear Cart
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isEmpty || !selectedSupplierId || createPOMutation.isPending}
            className="flex-1"
          >
            {createPOMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating PO...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Purchase Order
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
