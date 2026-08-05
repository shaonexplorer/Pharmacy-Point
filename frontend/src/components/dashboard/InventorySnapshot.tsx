'use client';

import { Loader2, Warehouse, Package, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Stats } from '@pharmacy-point/types';

interface InventorySnapshotProps {
  stats: Stats;
  isLoading: boolean;
}

interface BarSpec {
  label: string;
  value: number;
  /** HSL color token, e.g. 'hsl(var(--primary-hsl))' */
  color: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/**
 * Inline SVG bar chart — visualises key pharmacy metrics at a glance
 * without an external charting dependency.
 *
 * DESIGN.md → Dashboard Overview: "Inventory Snapshot" with key metrics
 * displayed as horizontal bars. Uses Clinical Precision color tokens:
 * - Primary (Pharma Teal) for products
 * - Secondary (Medi-Blue) for suppliers
 * - Warning (Amber) for low stock
 * - Tertiary (Safety Green) for sales (MTD)
 * - Secondary for received stock
 *
 * Bars animate on mount with staggered delays for visual polish.
 */
export function InventorySnapshot({ stats, isLoading }: InventorySnapshotProps) {
  const bars: BarSpec[] = [
    {
      label: 'Products',
      value: stats.totalProducts,
      color: 'hsl(var(--primary-hsl))',
      icon: Package,
    },
    {
      label: 'Suppliers',
      value: stats.totalCompanies,
      color: 'hsl(var(--secondary-hsl))',
      icon: Warehouse,
    },
    {
      label: 'Low Stock',
      value: stats.lowStockItems,
      color: 'hsl(var(--warning-hsl))',
      icon: ShoppingCart,
    },
    {
      label: 'Sales (MTD)',
      value: stats.stockOutThisMonth ?? 0,
      color: 'hsl(var(--tertiary-hsl))',
      icon: ShoppingCart,
    },
    {
      label: 'Received',
      value: stats.stockInThisMonth ?? 0,
      color: 'hsl(var(--secondary-hsl))',
      icon: Package,
    },
  ];

  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-headline-md">Inventory Snapshot</CardTitle>
        <CardDescription className="text-body-md text-on-surface-variant">
          Key metrics at a glance
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex min-h-[140px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {bars.map((bar, i) => {
              const widthPct = (bar.value / maxValue) * 100;
              const Icon = bar.icon;
              return (
                <div key={bar.label} className="flex items-center gap-3">
                  <div className="w-16 text-label-md text-on-surface-variant flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" style={{ color: bar.color }} />
                    {bar.label}
                  </div>
                  <div className="relative flex-1">
                    <div className="h-6 w-full overflow-hidden rounded-md bg-muted/30">
                      <div
                        className="h-full rounded-md transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.max(2, widthPct)}%`,
                          backgroundColor: bar.color,
                          animationDelay: `${i * 75}ms`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-mono font-medium text-foreground">
                    {bar.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
