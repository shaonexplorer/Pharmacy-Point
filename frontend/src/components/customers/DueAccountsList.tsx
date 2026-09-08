'use client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function DueAccountsList() {
  const { data } = useQuery({
    queryKey: ['due-accounts'],
    queryFn: () => fetch('/api/customers/due-accounts').then(r => r.json()),
    placeholderData: (prev: any) => prev,
  });
  const accounts = data?.customers || [];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Due Accounts</h2>
      <div className="divide-y">
        {accounts.map((c: any) => (
          <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.email || '—'}</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={Number(c.dueAmount) > 0 ? 'destructive' : 'secondary'}>${Number(c.dueAmount).toFixed(2)}</Badge>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
        {accounts.length === 0 && <div className="py-6 text-muted-foreground text-sm">No outstanding balances.</div>}
      </div>
    </Card>
  );
}
