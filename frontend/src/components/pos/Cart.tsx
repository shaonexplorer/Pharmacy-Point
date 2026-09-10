'use client';

import { CartItem as CartItemType } from '@/context/PosContext';
import { CartItem as PosCartItem } from '@/components/pos/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { ExpiryChip, getExpiryStatus } from '@/components/inventory/StockChip';
import { ShoppingCart, Receipt as ReceiptIcon, Trash2, AlertTriangle } from 'lucide-react';

interface CartProps {
  items: CartItemType[];
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClearCart: () => void;
}

export function Cart({
  items,
  subtotal,
  taxAmount,
  total,
  taxRate,
  onUpdateQuantity,
  onRemove,
  onClearCart,
}: CartProps) {
  const isEmpty = items.length === 0;

  // Expiry identification — flag expired and expiring-soon items in the cart
  const expiredItems = items.filter(
    (item) => item.product.expiryDate && getExpiryStatus(item.product.expiryDate) === 'expired'
  );
  const expiringItems = items.filter(
    (item) => item.product.expiryDate && getExpiryStatus(item.product.expiryDate) === 'critical'
  );
  const hasExpiryWarnings = expiredItems.length > 0 || expiringItems.length > 0;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Shopping Cart
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
              <ReceiptIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-body-md text-on-surface-variant">The cart is empty</p>
            <p className="mt-1 text-xs text-on-surface-variant/70">
              Search products and add them to start a sale
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {items.map((item) => (
              <PosCartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </CardContent>

      {!isEmpty && (
        <CardFooter className="flex-col items-stretch gap-4 border-t border-border pt-6">
          {/* Summary — data-mono for numerical clarity per DESIGN.md */}
          <div className="flex flex-col gap-2 text-body-md">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="text-data-mono font-medium text-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Tax ({Math.round(taxRate * 100)}%)</span>
              <span className="text-data-mono font-medium text-foreground">
                {formatCurrency(taxAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-data-mono text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Expiry warnings — surfaced at the cart level so staff can review
              before checkout. Expired items are a hard stop; expiring-soon
              items are a caution. Per pharmacy safety protocol, expired
              medication must never be dispensed. */}
          {hasExpiryWarnings && (
            <div className="rounded-md border border-error/30 bg-error/5 p-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                <div className="space-y-1">
                  {expiredItems.length > 0 && (
                    <p className="text-sm font-medium text-error">
                      Expired product{expiredItems.length > 1 ? 's' : ''} in cart — must be removed before sale.
                    </p>
                  )}
                  {expiringItems.length > 0 && (
                    <p className="text-sm text-warning">
                      {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring within
                      7 days — verify with pharmacist.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {expiredItems.map((item) => (
                      <ExpiryChip key={item.productId} status="expired" />
                    ))}
                    {expiringItems.map((item) => (
                      <ExpiryChip key={item.productId} status="critical" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Destructive outline — outlined until activated per spec to avoid accidents */}
          <Button variant="outline" size="sm" onClick={onClearCart} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
