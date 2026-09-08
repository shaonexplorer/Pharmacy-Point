'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoyaltyPointsDisplay } from '@/components/customers/LoyaltyPointsDisplay';
import { DuePaymentForm } from '@/components/customers/DuePaymentForm';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function CustomerDashboardPage() {
  const { id } = useParams();
  const { data } = useQuery({
    queryKey: ['customer-dashboard', id],
    queryFn: () => fetch(`/api/customers/${id}/dashboard`).then(r => r.json()),
  });
  const d = data || {};

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{d.name || 'Customer'} Dashboard</h1>
        <Badge variant="outline">{d.loyaltyTier || 'Bronze'}</Badge>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-5"><div className="text-sm text-muted-foreground">Lifetime Value</div><div className="text-2xl font-bold data-mono">${Number(d.lifetimeValue || 0).toFixed(2)}</div></Card>
            <Card className="p-5"><div className="text-sm text-muted-foreground">Points Earned</div><div className="text-2xl font-bold data-mono">{d.loyaltyPoints || 0}</div></Card>
            <Card className="p-5"><div className="text-sm text-muted-foreground">Due Amount</div><div className="text-2xl font-bold data-mono text-error">${Number(d.dueAmount || 0).toFixed(2)}</div></Card>
          </div>
          <LoyaltyPointsDisplay points={d.loyaltyPoints} tier={d.loyaltyTier} lifetimeSpend={d.lifetimeValue} />
          <div className="flex gap-2"><DuePaymentForm customerId={String(id)} onSuccess={() => window.location.reload()} /></div>
        </TabsContent>
        <TabsContent value="orders"><Card className="p-6"><h3 className="font-semibold mb-2">Order History</h3>{(d.orders || []).map((o: any) => <div key={o.id} className="py-2 border-b"><div className="font-medium">Order #{o.id.slice(0, 8)}</div><div className="text-xs text-muted-foreground">{o.status} — ${Number(o.total || 0).toFixed(2)}</div></div>)}</Card></TabsContent>
        <TabsContent value="payments"><Card className="p-6"><h3 className="font-semibold mb-2">Payment History</h3>{(d.payments || []).map((p: any) => <div key={p.id} className="py-2 border-b"><div className="font-medium">${Number(p.amount || 0).toFixed(2)}</div><div className="text-xs text-muted-foreground">{p.notes || '—'} — {new Date(p.createdAt).toLocaleDateString()}</div></div>)}</Card></TabsContent>
        <TabsContent value="loyalty"><LoyaltyPointsDisplay points={d.loyaltyPoints} tier={d.loyaltyTier} lifetimeSpend={d.lifetimeValue} /></TabsContent>
      </Tabs>
    </div>
  );
}
