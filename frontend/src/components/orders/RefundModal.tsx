import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function RefundModal({ orderId, onClose, onSuccess }: { orderId: string; onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), reason }),
      });
      if (!res.ok) throw new Error('Refund failed');
      onSuccess();
      onClose();
    } finally { setLoading(false); }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader><CardTitle>Process Refund</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Amount</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <Label>Reason</Label>
          <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>{loading ? 'Processing...' : 'Refund'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
