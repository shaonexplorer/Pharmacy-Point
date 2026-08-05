'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { InventoryTransaction, Order } from '@pharmacy-point/types';
import { Loader2, Package, Warehouse, ShoppingCart, ClipboardList } from 'lucide-react';

/**
 * Unified activity timeline item — merges inventory transactions and orders
 * into a single chronological feed.
 */
interface ActivityItem {
  id: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  badgeLabel: string;
  badgeVariant: 'success' | 'warning' | 'secondary' | 'destructive' | 'default' | 'pending';
}

/**
 * Merge inventory transactions and recent orders into a sorted activity feed.
 * Returns at most 4 items, sorted newest first.
 */
export function buildActivityItems(
  transactions: InventoryTransaction[] | undefined,
  orders: Order[] | undefined
): ActivityItem[] {
  const txItems: ActivityItem[] = (transactions ?? []).map((tx) => {
    const isStockIn = tx.type === 'STOCK_IN';
    const isStockOut = tx.type === 'STOCK_OUT';
    return {
      id: `tx-${tx.id}`,
      timestamp: tx.createdAt,
      icon: isStockIn ? Package : isStockOut ? ShoppingCart : Warehouse,
      iconColor: isStockIn ? 'text-tertiary' : isStockOut ? 'text-secondary' : 'text-warning',
      iconBg: isStockIn ? 'bg-tertiary/10' : isStockOut ? 'bg-secondary/10' : 'bg-warning/10',
      title: isStockIn ? 'Stock received' : isStockOut ? 'Sale dispensed' : 'Stock adjusted',
      description: tx.product?.name ?? tx.product?.sku ?? 'Unknown product',
      badgeLabel: isStockIn ? 'Received' : isStockOut ? 'Dispensed' : 'Adjusted',
      badgeVariant: isStockIn ? 'success' : isStockOut ? 'destructive' : 'secondary',
    };
  });

  const orderItems: ActivityItem[] = (orders ?? []).map((order) => ({
    id: `order-${order.id}`,
    timestamp: order.createdAt,
    icon: ShoppingCart,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Order completed',
    description: `Order #${order.id.slice(-6)} · ${order.total}`,
    badgeLabel: 'Completed',
    badgeVariant: 'success',
  }));

  return [...txItems, ...orderItems]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);
}

interface ActivityTimelineProps {
  transactions: InventoryTransaction[] | undefined;
  orders: Order[] | undefined;
  isLoading: boolean;
}

/**
 * Recent Activity timeline — merges inventory transactions and orders
 * into a single chronological feed with icon + badge + timestamp.
 *
 * DESIGN.md → Dashboard: "Recent Activity: Timeline of recent inventory
 * transactions, orders, and customer activity."
 */
export function ActivityTimeline({ transactions, orders, isLoading }: ActivityTimelineProps) {
  const activityItems = buildActivityItems(transactions, orders);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-headline-md">Recent Activity</CardTitle>
        <CardDescription className="text-body-md text-on-surface-variant">
          Latest inventory transactions and orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex min-h-[140px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : activityItems.length === 0 ? (
          <div className="flex min-h-[140px] items-center justify-center text-center">
            <div className="space-y-2">
              <ClipboardList className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-body-md text-on-surface-variant">
                No recent activity recorded yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      item.iconBg
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', item.iconColor)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <Badge variant={item.badgeVariant} size="sm">
                        {item.badgeLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant truncate">{item.description}</p>
                  </div>
                  <time className="text-xs text-on-surface-variant whitespace-nowrap ml-auto">
                    {formatTime(item.timestamp)}
                  </time>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
