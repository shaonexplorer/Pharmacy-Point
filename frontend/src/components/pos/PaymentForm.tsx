'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentForm({ onSubmit, total }: { onSubmit: (method: 'cash' | 'card') => void; total: number }) {
  const [method, setMethod] = useState<'cash' | 'card'>('cash');
  return (
    <Card className="surface-container-high">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">Payment Method</h3>
        <div className="flex gap-2">
          <Button variant={method === 'cash' ? 'default' : 'outline'} onClick={() => setMethod('cash')} type="button">Cash</Button>
          <Button variant={method === 'card' ? 'default' : 'outline'} onClick={() => setMethod('card')} type="button">Card</Button>
        </div>
        <Button onClick={() => onSubmit(method)} type="button" className="w-full">Confirm {method === 'card' ? 'Card Payment' : 'Cash Payment'} — ${total.toFixed(2)}</Button>
      </CardContent>
    </Card>
  );
}
