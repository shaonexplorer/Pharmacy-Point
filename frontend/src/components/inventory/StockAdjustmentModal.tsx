'use client';

import { useState } from 'react';
import { useStockAdjust, useStockIn, useStockOut } from '@/hooks/useInventory';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Input,
  Label,
  Textarea,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import type { Product } from '@pharmacy-point/types';

interface StockAdjustmentModalProps {
  trigger?: React.ReactNode;
  product: Product;
}

export function StockAdjustmentModal({ trigger, product }: StockAdjustmentModalProps) {
  const [open, setOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'>('ADJUSTMENT');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const stockInMutation = useStockIn();
  const stockOutMutation = useStockOut();
  const adjustMutation = useStockAdjust();

  const isPending = stockInMutation.isPending || stockOutMutation.isPending || adjustMutation.isPending;

  const resetForm = () => {
    setQuantity('');
    setNotes('');
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
          notes: notes || undefined,
        });
      } else if (adjustmentType === 'STOCK_OUT') {
        await stockOutMutation.mutateAsync({
          productId: product.id,
          quantity: qty,
          notes: notes || undefined,
        });
      } else {
        await adjustMutation.mutateAsync({
          productId: product.id,
          data: {
            quantity: qty,
            notes: notes || undefined,
          },
        });
      }

      resetForm();
    } catch (error) {
      console.error('Stock adjustment error:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? <button>Adjust</button>}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Adjust Stock - {product.name}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-stock">Current Stock</Label>
            <Input id="current-stock" type="number" value={product.quantity} readOnly className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-type">Type</Label>
            <select
              id="adjustment-type"
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as typeof adjustmentType)}
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ADJUSTMENT">Manual Adjustment (Set absolute value)</option>
              <option value="STOCK_IN">Stock In (Purchase Receipt)</option>
              <option value="STOCK_OUT">Stock Out (Sale)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
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
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
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
