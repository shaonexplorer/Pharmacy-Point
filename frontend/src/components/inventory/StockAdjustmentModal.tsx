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
import type { Product } from '@pharmacy-point/types';

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

  const stockInMutation = useStockIn();
  const stockOutMutation = useStockOut();
  const adjustMutation = useStockAdjust();

  const isPending =
    stockInMutation.isPending || stockOutMutation.isPending || adjustMutation.isPending;

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
