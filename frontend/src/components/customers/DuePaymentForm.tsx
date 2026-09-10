'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import { useRecordDuePayment } from '@/hooks/useCustomers';

interface DuePaymentFormProps {
  customerId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DuePaymentForm({ customerId, onSuccess, trigger }: DuePaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const recordPaymentMutation = useRecordDuePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordPaymentMutation.mutateAsync({
        customerId,
        data: {
          amount: parseFloat(amount),
          notes: notes || undefined,
        },
      });
      setOpen(false);
      setAmount('');
      setNotes('');
      onSuccess?.();
    } catch (error) {
      // Error is captured in mutation state — form stays open for correction
      console.error('Failed to record payment:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-1" /> Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        {recordPaymentMutation.isError && (
          <div className="rounded-md border border-error/30 bg-error/5 p-3 mb-4">
            <div className="flex items-start gap-2.5 text-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-body-sm">
                {recordPaymentMutation.error?.message ||
                  'Failed to record payment. Please try again.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={recordPaymentMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={recordPaymentMutation.isPending}
              placeholder="e.g. Cash payment from customer"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={recordPaymentMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={recordPaymentMutation.isPending}>
              {recordPaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
