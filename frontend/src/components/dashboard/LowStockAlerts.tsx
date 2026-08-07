'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Warehouse, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { StockVial } from './StockVial';
import type { InventoryItem } from '@pharmacy-point/types';

interface LowStockAlertsProps {
  items: InventoryItem[];
  isLoading: boolean;
}

/**
 * Low Stock Alerts — renders a grid of cards for products below their
 * low-stock threshold, each featuring a medication-vial visualization
 * that communicates urgency through fill level and colour.
 *
 * DESIGN.md → Dashboard Overview: "Low Stock Alerts" section.
 *
 * Each alert card includes:
 * - A StockVial SVG showing fill level relative to the threshold
 * - Product name with a severity badge (Critical / Low)
 * - SKU displayed in data-mono (JetBrains Mono) for unambiguous identification
 * - Action buttons: "Restock" (outline) and "Details" (ghost)
 */
export function LowStockAlerts({ items, isLoading }: LowStockAlertsProps) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex min-h-[80px] flex-col items-center justify-center text-center px-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary mb-2" />
          <p className="text-body-md text-on-surface-variant">Loading low-stock alerts…</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex min-h-[80px] flex-col items-center justify-center text-center px-6">
          <AlertTriangle className="h-8 w-8 text-tertiary mb-2" />
          <p className="text-body-md text-on-surface-variant">
            All stock levels are healthy. No low-stock items to display.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((product) => {
        const isCritical = product.quantity <= (product.lowStock || 10) / 2;
        const statusVariant = isCritical ? 'destructive' : 'warning';

        return (
          <Card
            key={product.id}
            className="border-border bg-card transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
          >
            <CardContent className="px-4 ">
              <div className="flex items-center gap-3">
                {/* Medication bottle visualisation */}
                {/* <StockVial quantity={product.quantity} lowStock={product.lowStock || 10} /> */}

                <div className=" min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <Badge variant={statusVariant} size="sm">
                      {isCritical ? 'Critical' : 'Low'}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-on-surface-variant">SKU: {product.sku}</p>
                  <p className="text-body-md text-on-surface-variant">
                    {product.quantity} units remaining
                    {' · '}threshold: {product.lowStock}
                  </p>
                  {product.price > 0 && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      Value: {formatCurrency(product.price * product.quantity)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/inventory">
                    <Warehouse className="mr-1 h-3 w-3" />
                    Restock
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="flex-1">
                  <Link href={`/products/${product.id}`}>
                    <FileText className="mr-1 h-3 w-3" />
                    Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
