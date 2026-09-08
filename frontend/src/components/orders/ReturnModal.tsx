import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ReturnModal({ orderId, items, onClose, onSuccess }: { orderId: string; items: { id: string; productName: string; quantity: number }[]; onClose: () => void; onSuccess: () => void }) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        items: items.map(i => ({ orderItemId: i.id, quantity: Number(quantities[i.id] || 0) })).filter(i => i.quantity > 0),
        reason,
      };
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Return failed');
      onSuccess();
      onClose();
    } finally { setLoading(false); }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader><CardTitle>Process Return</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {items.map(i => (
          <div key={i.id} className="flex items-center gap-3">
            <div className="flex-1"><Label>{i.productName}</Label></div>
            <Input type="number" className="w-24" value={quantities[i.id] || ''} onChange={e => setQuantities(p => ({ ...p, [i.id]: e.target.value }))} max={i.quantity} />
          </div>
        ))}
        <div>
          <Label>Reason</Label>
          <Input value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>{loading ? 'Processing...' : 'Return'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
