'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle } from 'lucide-react';

interface ReceiptEmailFormProps {
  orderId: string;
  defaultEmail?: string;
  onSent?: () => void;
}

export function ReceiptEmailForm({ orderId, defaultEmail = '', onSent }: ReceiptEmailFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/receipt/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSent(true);
        onSent?.();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to send receipt.');
      }
    } catch {
      alert('Network error. Try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-tertiary text-sm font-medium">
        <CheckCircle className="h-4 w-4" />
        Receipt sent to {email}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-2">
        <Label htmlFor="receipt-email" className="text-xs text-label-md">Email address</Label>
        <Input
          id="receipt-email"
          type="email"
          placeholder="customer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10"
        />
      </div>
      <Button type="submit" disabled={sending || !email.trim()} size="sm" className="w-full">
        <Send className="mr-2 h-4 w-4" />
        {sending ? 'Sending...' : 'Send Receipt'}
      </Button>
    </form>
  );
}
