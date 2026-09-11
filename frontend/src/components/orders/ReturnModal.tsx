'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, RotateCcw } from 'lucide-react';
import { useReturnOrder } from '@/hooks/useOrders';
import type { ReturnInput, OrderItemWithProduct } from '@pharmacy-point/types';

const returnSchema = z.object({
  items: z
    .array(
      z.object({
        orderItemId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'At least one item must be returned'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500),
});

interface ReturnModalProps {
  orderId: string;
  items: Pick<OrderItemWithProduct, 'id' | 'product' | 'quantity' | 'returnedQuantity'>[];
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReturnModal({ orderId, items, open, onClose, onSuccess }: ReturnModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const returnMutation = useReturnOrder();

  const handleSubmit = async () => {
    const returnItems: { orderItemId: string; quantity: number }[] = [];
    for (const item of items) {
      const qty = quantities[item.id] || 0;
      const available = (item.quantity || 0) - (item.returnedQuantity || 0);
      if (qty > 0) {
        if (qty > available) {
          setError(`Quantity ${qty} exceeds available return quantity (${available}) for ${item.product?.name ?? 'item'}`);
          return;
        }
        returnItems.push({ orderItemId: item.id, quantity: qty });
      }
    }

    if (returnItems.length === 0) {
      setError('Please specify at least one item to return');
      return;
    }

    const result = returnSchema.safeParse({ items: returnItems, reason });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError(null);
    try {
      const payload: ReturnInput = {
        items: returnItems,
        reason,
      };
      await returnMutation.mutateAsync({ orderId, data: payload });
      setQuantities({});
      setReason('');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to process return';
      setError(msg);
    }
  };

  const handleQtyChange = (itemId: string, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      setQuantities((prev) => ({ ...prev, [itemId]: 0 }));
    } else {
      setQuantities((prev) => ({ ...prev, [itemId]: num }));
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-headline-md">Process Return</DialogTitle>
          <DialogDescription className="text-body-md text-on-surface-variant">
            Select items to return from order #{orderId.slice(0, 8)}. Returned items will be restocked to inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-label-md text-foreground">Items</Label>
            {items.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No returnable items in this order.</p>
            ) : (
              items.map((item) => {
                const available = (item.quantity || 0) - (item.returnedQuantity || 0);
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-md border border-border p-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.product?.name ?? 'Unknown Product'}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Available: {available} | Already returned: {item.returnedQuantity || 0}
                      </p>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="0"
                        max={available}
                        value={quantities[item.id] || ''}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        disabled={returnMutation.isPending || available === 0}
                        className="text-center"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="return-reason" className="text-label-md text-foreground">
              Reason
            </Label>
            <Textarea
              id="return-reason"
              rows={3}
              placeholder="Why are these items being returned?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={returnMutation.isPending}
            />
          </div>

          {error && (
            <div className="rounded-md border border-error/30 bg-error/5 p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={returnMutation.isPending}
            onClick={() => {
              setQuantities({});
              setReason('');
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={returnMutation.isPending || items.length === 0}
            onClick={handleSubmit}
          >
            {returnMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Process Return
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
