'use client';

import { CartItem as CartItemType } from '@/context/PosContext';
import { CartItem as PosCartItem } from '@/components/pos/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { ShoppingCart, Trash2, Receipt as ReceiptIcon } from 'lucide-react';

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

  return (
    <Card className="border-border bg-card card-elevated flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-card-foreground flex items-center gap-2">
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
        <>
          {/* Summary — data-mono for numerical clarity per DESIGN.md */}
          <div className="border-t border-border px-6 py-4 space-y-2">
            <div className="flex justify-between text-body-md">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="text-data-mono text-foreground font-medium">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-body-md">
              <span className="text-on-surface-variant">Tax ({Math.round(taxRate * 100)}%)</span>
              <span className="text-data-mono text-foreground font-medium">
                {formatCurrency(taxAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary text-data-mono">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Actions — secondary action uses Medi-Blue per DESIGN.md */}
          <div className="border-t border-border px-6 py-3">
            <Button variant="secondary" size="sm" onClick={onClearCart} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
