'use client';

import { CartItem as CartItemType } from '@/context/PosContext';
import { CartItem as PosCartItem } from '@/components/pos/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { ShoppingCart, Receipt as ReceiptIcon, Trash2 } from 'lucide-react';

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
