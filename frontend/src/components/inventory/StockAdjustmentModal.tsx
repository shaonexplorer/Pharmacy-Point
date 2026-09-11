'use client';

import { useState, useEffect } from 'react';
import { useStockAdjust, useStockIn, useStockOut, useProductBatches, inventoryKeys } from '@/hooks/useInventory';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
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
import { Loader2 } from 'lucide-react';
import type { Product, ProductBatch } from '@pharmacy-point/types';
import { useQueryClient } from '@tanstack/react-query';

interface StockAdjustmentModalProps {
  trigger?: React.ReactNode;
  product: Product;
}

export function StockAdjustmentModal({ trigger, product }: StockAdjustmentModalProps) {
  const [open, setOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'>(
    'ADJUSTMENT'
  );
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');

  const queryClient = useQueryClient();

  const stockInMutation = useStockIn();
  const stockOutMutation = useStockOut();
  const adjustMutation = useStockAdjust();

  // Fetch batches for this product (for STOCK_OUT batch selection)
  const { data: batchesData } = useProductBatches(product.id);
  const batches: ProductBatch[] = batchesData?.data ?? [];

  const isPending =
    stockInMutation.isPending || stockOutMutation.isPending || adjustMutation.isPending;

  const resetForm = () => {
    setQuantity('');
    setNotes('');
    setBatchNo('');
    setLotNumber('');
    setExpiryDate('');
    setManufactureDate('');
    setCostPrice('');
    setSelectedBatchId('');
    setAdjustmentType('ADJUSTMENT');
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0 || isPending) {
      return;
    }

    const qty = Number(quantity);

    try {
      if (adjustmentType === 'STOCK_IN') {
        await stockInMutation.mutateAsync({
          productId: product.id,
          quantity: qty,
          batchNo: batchNo || undefined,
          lotNumber: lotNumber || undefined,
          expiryDate: expiryDate || undefined,
          manufactureDate: manufactureDate || undefined,
          costPrice: costPrice ? Number(costPrice) : undefined,
          notes: notes || undefined,
        });
      } else if (adjustmentType === 'STOCK_OUT') {
        await stockOutMutation.mutateAsync({
          productId: product.id,
          batchId: selectedBatchId || undefined,
          quantity: qty,
          notes: notes || undefined,
        });
      } else {
        await adjustMutation.mutateAsync({
          productId: product.id,
          data: {
            quantity: qty,
            batchNo: batchNo || undefined,
            notes: notes || undefined,
          },
        });
      }

      resetForm();
    } catch (error) {
      console.error('Stock adjustment error:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Refresh batches when modal closes
      queryClient.invalidateQueries({ queryKey: inventoryKeys.batches(product.id) });
    }
    setOpen(open);
  };

  // Available batches for STOCK_OUT (only those with quantity > 0)
  const availableBatches = batches.filter((b) => b.quantity > 0);

  useEffect(() => {
    if (open) {
      // Reset selected batch when type changes to STOCK_OUT
      setSelectedBatchId('');
    }
  }, [adjustmentType, open]);

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger ?? <button>Adjust</button>}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90%] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Adjust Stock - {product.name}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-stock" className="text-body-md text-foreground">
              Current Stock
            </Label>
            <Input
              id="current-stock"
              type="number"
              value={product.quantity}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-type" className="text-body-md text-foreground">
              Type
            </Label>
            <Select
              value={adjustmentType}
              onValueChange={(val) => setAdjustmentType(val as typeof adjustmentType)}
              disabled={isPending}
            >
              <SelectTrigger id="adjustment-type" className="w-full">
                <SelectValue placeholder="Manual Adjustment (Set absolute value)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADJUSTMENT">Manual Adjustment (Set absolute value)</SelectItem>
                <SelectItem value="STOCK_IN">Stock In (Purchase Receipt)</SelectItem>
                <SelectItem value="STOCK_OUT">Stock Out (Sale)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-body-md text-foreground">
              {adjustmentType === 'STOCK_IN'
                ? 'Quantity to Add'
                : adjustmentType === 'STOCK_OUT'
                  ? 'Quantity to Remove'
                  : 'New Stock Level'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isPending}
              placeholder={
                adjustmentType === 'ADJUSTMENT' ? 'Enter new stock level...' : 'Enter quantity...'
              }
            />
          </div>

          {/* Batch selection for STOCK_OUT */}
          {adjustmentType === 'STOCK_OUT' && (
            <div className="space-y-2">
              <Label htmlFor="batch-select" className="text-body-md text-foreground">
                Batch (leave blank for FIFO)
              </Label>
              <Select
                value={selectedBatchId}
                onValueChange={setSelectedBatchId}
                disabled={isPending || availableBatches.length === 0}
              >
                <SelectTrigger id="batch-select" className="w-full">
                  <SelectValue placeholder={availableBatches.length === 0 ? 'No batches available' : 'Auto (FIFO)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto (FIFO — oldest expiry first)</SelectItem>
                  {availableBatches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.batchNo ?? `Batch #${b.id.slice(0, 6)}`} — {b.quantity} units
                      {b.expiryDate && ` (expires ${new Date(b.expiryDate).toLocaleDateString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Batch fields for STOCK_IN */}
          {adjustmentType === 'STOCK_IN' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="batch-no" className="text-body-md text-foreground">
                  Batch No
                </Label>
                <Input
                  id="batch-no"
                  type="text"
                  placeholder="e.g., B001"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lot-number" className="text-body-md text-foreground">
                  Lot Number
                </Label>
                <Input
                  id="lot-number"
                  type="text"
                  placeholder="e.g., LOT-ABC123"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry-date" className="text-body-md text-foreground">
                  Expiry Date (optional)
                </Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={isPending}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-on-surface-variant">Required for medication products. Cannot be in the past.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacture-date" className="text-body-md text-foreground">
                  Manufacture Date (optional)
                </Label>
                <Input
                  id="manufacture-date"
                  type="date"
                  value={manufactureDate}
                  onChange={(e) => setManufactureDate(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost-price" className="text-body-md text-foreground">
                  Cost Price (optional)
                </Label>
                <Input
                  id="cost-price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </>
          )}

          {/* Batch number for ADJUSTMENT */}
          {adjustmentType === 'ADJUSTMENT' && (
            <div className="space-y-2">
              <Label htmlFor="adjust-batch-no" className="text-body-md text-foreground">
                Batch No (optional — for batch-specific adjustment)
              </Label>
              <Input
                id="adjust-batch-no"
                type="text"
                placeholder="Leave blank for product-wide adjustment"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                disabled={isPending}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-body-md text-foreground">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              placeholder="Reason for adjustment..."
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="w-full  py-2 px-4" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="w-full  py-2 px-4"
            onClick={handleSubmit}
            disabled={isPending || !quantity}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Adjustment'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
