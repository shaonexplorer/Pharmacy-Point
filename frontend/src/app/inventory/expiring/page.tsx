'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  FileText,
  AlertTriangle,
  Clock,
  PackageOpen,
  Trash2,
  ArrowLeft,
  CalendarDays,
  BarChart3,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface ExpiringItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  batchNo?: string | null;
  category?: string | null;
  quantity: number;
  price: number;
  expiryDate?: string | null;
  image?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function toCsv(rows: ExpiringItem[]): string {
  const headers = ['Name', 'SKU', 'Barcode', 'Batch', 'Category', 'Qty', 'Price', 'Expiry', 'Waste'];
  const lines = [headers.join(','), ...rows.map((r) => {
    const waste = (r.quantity * r.price).toFixed(2);
    const exp = r.expiryDate ? new Date(r.expiryDate).toISOString().split('T')[0] : '';
    return [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.sku}"`,
      `"${r.barcode ?? ''}"`,
      `"${r.batchNo ?? ''}"`,
      `"${r.category ?? ''}"`,
      r.quantity,
      r.price.toFixed(2),
      exp,
      waste,
    ].join(',');
  })];
  return lines.join('\n');
}

function downloadCsv(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function ExpirationReportPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [days, setDays] = useState(90);
  const [tab, setTab] = useState('expiring');

  const [expiring, setExpiring] = useState<ExpiringItem[]>([]);
  const [expired, setExpired] = useState<ExpiringItem[]>([]);
  const [loadingExp, setLoadingExp] = useState(true);
  const [loadingExpd, setLoadingExpd] = useState(true);

  /* ── Fetch expiring ── */
  const fetchExpiring = useCallback(async () => {
    setLoadingExp(true);
    try {
      const res = await fetch(`/api/inventory/expiring?days=${days}&limit=100`);
      const json = await res.json();
      setExpiring((json.data || []) as ExpiringItem[]);
    } catch {
      setExpiring([]);
    } finally {
      setLoadingExp(false);
    }
  }, [days]);

  /* ── Fetch expired ── */
  const fetchExpired = useCallback(async () => {
    setLoadingExpd(true);
    try {
      const res = await fetch('/api/inventory/expired?limit=100');
      const json = await res.json();
      setExpired((json.data || []) as ExpiringItem[]);
    } catch {
      setExpired([]);
    } finally {
      setLoadingExpd(false);
    }
  }, []);

  /* Load expiring when days changes; load both on mount */
  useEffect(() => {
    fetchExpiring();
    fetchExpired();
  }, [fetchExpiring, fetchExpired, days]);

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header strip */}
      <header className="border-b bg-surface-container shadow-sm">
        <div className="mx-auto max-w-[1440px] px-6 py-6 md:px-10">
          <button
            type="button"
            onClick={() => router.push('/inventory')}
            className="mb-3 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-on-surface tracking-tight md:text-3xl">Expiration Report</h1>
              <p className="mt-1 text-sm text-on-surface-variant">Track upcoming expirations, identify waste risk, and export for compliance.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csv = toCsv(tab === 'expiring' ? expiring : expired);
                  downloadCsv(csv, `expiration-${tab}-${days}-days.csv`);
                }}
              >
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 space-y-8">
        {/* KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-surface-container border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Expiring within {days} days</p>
                <p className="text-2xl font-semibold text-on-surface">{expiring.length}</p>
                <p className="text-xs text-on-surface-variant">Products</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <PackageOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Expired in stock</p>
                <p className="text-2xl font-semibold text-on-surface">{expired.length}</p>
                <p className="text-xs text-on-surface-variant">Products</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Estimated waste (expiring)</p>
                <p className="text-2xl font-semibold text-destructive">{formatCurrency(expiring.reduce((sum, i) => sum + i.quantity * i.price, 0))}</p>
                <p className="text-xs text-on-surface-variant">Value at cost</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Expired waste value</p>
                <p className="text-2xl font-semibold text-destructive">{formatCurrency(expired.reduce((sum, i) => sum + i.quantity * i.price, 0))}</p>
                <p className="text-xs text-on-surface-variant">Lost inventory value</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Controls */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-surface-container px-3 py-2 shadow-sm">
              <CalendarDays className="h-4 w-4 text-on-surface-variant" />
              <label htmlFor="days" className="text-sm font-medium text-on-surface">Window:</label>
              <Input
                id="days"
                type="number"
                min={7}
                max={365}
                value={days}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 7) setDays(v);
                }}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs text-on-surface-variant">days</span>
            </div>
            <Button size="sm" onClick={() => { fetchExpiring(); fetchExpired(); }}>
              Refresh
            </Button>
          </div>
          <div className="text-sm text-on-surface-variant">
            Showing <span className="font-medium text-on-surface">{tab === 'expiring' ? expiring.length : expired.length}</span> items
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTab('expiring'); fetchExpiring(); }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-sm ${tab === 'expiring' ? 'bg-surface text-foreground shadow-md ring-1 ring-border' : 'bg-surface-container text-on-surface-variant hover:bg-surface hover:text-on-surface border border-border/60'}`}
            >
              <Clock className="h-4 w-4" /> Expiring Soon
            </button>
            <button
              type="button"
              onClick={() => { setTab('expired'); fetchExpired(); }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-sm ${tab === 'expired' ? 'bg-surface text-foreground shadow-md ring-1 ring-border' : 'bg-surface-container text-on-surface-variant hover:bg-surface hover:text-on-surface border border-border/60'}`}
            >
              <AlertTriangle className="h-4 w-4" /> Expired
            </button>
          </div>

          {tab === 'expiring' && (
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="bg-surface-container/60 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Upcoming Expirations</CardTitle>
                    <CardDescription>Within next {days} days — ordered by shortest expiry first.</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono">{expiring.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      <tr>
                        <th className="text-left px-4 py-3">Product</th>
                        <th className="text-left px-4 py-3">SKU</th>
                        <th className="text-left px-4 py-3">Batch</th>
                        <th className="text-left px-4 py-3">Qty</th>
                        <th className="text-left px-4 py-3">Unit Price</th>
                        <th className="text-left px-4 py-3">Expiry</th>
                        <th className="text-right px-4 py-3">Waste Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {loadingExp ? (
                        <tr><td colSpan={7} className="px-4 py-6 text-center text-on-surface-variant">Loading…</td></tr>
                      ) : expiring.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-6 text-center text-on-surface-variant">No products expiring within {days} days.</td></tr>
                      ) : (
                        expiring.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                            <td className="px-4 py-3 font-medium text-on-surface">{item.name}</td>
                            <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{item.sku}</td>
                            <td className="px-4 py-3 text-xs">{item.batchNo || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs">{item.quantity}</td>
                            <td className="px-4 py-3 font-mono text-xs">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-xs">
                              {item.expiryDate ? (
                                <span className={new Date(item.expiryDate) < new Date() ? 'text-destructive font-medium' : 'text-on-surface'}>
                                  {new Date(item.expiryDate).toLocaleDateString()}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm">{formatCurrency(item.quantity * item.price)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'expired' && (
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="bg-surface-container/60 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Expired Products Still in Stock</CardTitle>
                    <CardDescription>These items have passed expiry but remain on hand — priority for removal.</CardDescription>
                  </div>
                  <Badge variant="destructive" className="font-mono">{expired.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      <tr>
                        <th className="text-left px-4 py-3">Product</th>
                        <th className="text-left px-4 py-3">SKU</th>
                        <th className="text-left px-4 py-3">Batch</th>
                        <th className="text-left px-4 py-3">Qty</th>
                        <th className="text-left px-4 py-3">Unit Price</th>
                        <th className="text-left px-4 py-3">Expired</th>
                        <th className="text-right px-4 py-3">Waste Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {loadingExpd ? (
                        <tr><td colSpan={7} className="px-4 py-6 text-center text-on-surface-variant">Loading…</td></tr>
                      ) : expired.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-6 text-center text-on-surface-variant">No expired products currently in stock.</td></tr>
                      ) : (
                        expired.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                            <td className="px-4 py-3 font-medium text-destructive">{item.name}</td>
                            <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{item.sku}</td>
                            <td className="px-4 py-3 text-xs">{item.batchNo || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs">{item.quantity}</td>
                            <td className="px-4 py-3 font-mono text-xs">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-xs text-destructive font-medium">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-destructive">{formatCurrency(item.quantity * item.price)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer note */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Waste value calculated at current unit price × quantity in stock. Export includes batch and barcode for regulatory filing.</span>
        </div>
      </main>

      {/* Print styles embedded for PDF export */}
      <style jsx global>{`
        @media print {
          header, .no-print, button { display: none !important; }
          main { margin: 0; padding: 0; max-width: 100%; }
          table { font-size: 10pt; }
        }
      `}</style>
    </div>
  );
}
