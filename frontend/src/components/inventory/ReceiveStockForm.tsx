'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { inventoryKeys } from '@/hooks/useInventory';
import { productKeys } from '@/hooks/useProducts';
import type { Product, StockInInput } from '@pharmacy-point/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PackagePlus } from 'lucide-react';

interface ReceiveStockFormProps {
  trigger?: React.ReactNode;
  product: Product;
}

/**
 * Minimal stock-in form for receiving a new batch of an existing product.
 * The product context (name, SKU, current stock) is prefilled and read-only;
 * the user only enters Quantity, Batch No, and Expiry Date.
 */
export function ReceiveStockForm({ trigger, product }: ReceiveStockFormProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  const mutation = useMutation({
    mutationFn: (data: StockInInput) => api.inventory.stockIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(product.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      resetForm();
    },
  });

  const resetForm = () => {
    setQuantity('');
    setBatchNo('');
    setExpiryDate('');
  };

  const handleSubmit = async () => {
    const qty = Number(quantity);

    if (!quantity || isNaN(qty) || qty <= 0) {
      return;
    }

    try {
      await mutation.mutateAsync({
        productId: product.id,
        quantity: qty,
        batchNo: batchNo || undefined,
        expiryDate: expiryDate || undefined,
        userId: session?.user?.id ?? undefined,
      });
      setOpen(false);
    } catch (error) {
      console.error('Stock receive error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <PackagePlus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[90%] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock — {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Prefilled product context (read-only) */}
          <div className="space-y-3 rounded-lg bg-surface-container/30 p-3">
            <div>
              <p className="text-label-md text-on-surface-variant">Product</p>
              <p className="text-body-md text-foreground font-medium">{product.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-label-md text-on-surface-variant">SKU</p>
                <p className="text-data-mono text-body-sm text-foreground">{product.sku}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant">Current Stock</p>
                <p className="text-data-mono text-body-sm text-foreground">{product.quantity} units</p>
              </div>
            </div>
          </div>

          {/* Quantity — dynamic */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-body-md text-foreground">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={mutation.isPending}
              placeholder="e.g., 100"
            />
          </div>

          {/* Batch No — dynamic */}
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
              disabled={mutation.isPending}
            />
          </div>

          {/* Expiry Date — dynamic */}
          <div className="space-y-2">
            <Label htmlFor="expiry-date" className="text-body-md text-foreground">
              Expiry Date
            </Label>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={mutation.isPending}
              min={today}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={mutation.isPending || !quantity}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Stock'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
