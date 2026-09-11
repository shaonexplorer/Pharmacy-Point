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
import { Loader2, Undo2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useRefund } from '@/hooks/useOrders';
import type { RefundInput } from '@pharmacy-point/types';

const refundSchema = z.object({
  amount: z.number().positive('Refund amount must be positive'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500),
  refundMethod: z.enum(['original', 'store_credit']).default('original'),
});

interface RefundModalProps {
  orderId: string;
  open: boolean;
  maxAmount: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RefundModal({ orderId, open, maxAmount, onClose, onSuccess }: RefundModalProps) {
  const [amount, setAmount] = useState(maxAmount);
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState<'original' | 'store_credit'>('original');
  const [error, setError] = useState<string | null>(null);

  const refundMutation = useRefund();

  const handleSubmit = async () => {
    const result = refundSchema.safeParse({ amount, reason, refundMethod });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    if (amount > maxAmount) {
      setError(`Refund amount cannot exceed ${formatCurrency(maxAmount)}`);
      return;
    }
    setError(null);
    try {
      const payload: RefundInput = {
        amount,
        reason,
        refundMethod,
      };
      await refundMutation.mutateAsync({ orderId, data: payload });
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to process refund';
      setError(msg);
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
          <DialogTitle className="text-headline-md">Process Refund</DialogTitle>
          <DialogDescription className="text-body-md text-on-surface-variant">
            Order #{orderId.slice(0, 8)} — Maximum refundable: {formatCurrency(maxAmount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="refund-amount" className="text-label-md text-foreground">
              Amount
            </Label>
            <Input
              id="refund-amount"
              type="number"
              min="0"
              max={maxAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={refundMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-foreground">Refund Method</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="original"
                  className="accent-primary"
                  checked={refundMethod === 'original'}
                  onChange={() => setRefundMethod('original')}
                  disabled={refundMutation.isPending}
                />
                <span className="text-sm text-foreground">Original Payment</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="store_credit"
                  className="accent-primary"
                  checked={refundMethod === 'store_credit'}
                  onChange={() => setRefundMethod('store_credit')}
                  disabled={refundMutation.isPending}
                />
                <span className="text-sm text-foreground">Store Credit</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-reason" className="text-label-md text-foreground">
              Reason
            </Label>
            <Textarea
              id="refund-reason"
              rows={3}
              placeholder="Why is this order being refunded?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={refundMutation.isPending}
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
            disabled={refundMutation.isPending}
            onClick={() => onClose()}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={refundMutation.isPending || !amount || !reason}
            onClick={handleSubmit}
          >
            {refundMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Undo2 className="mr-2 h-4 w-4" />
                Process Refund — {formatCurrency(amount)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
