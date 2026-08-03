'use client';

import { CartItem as CartItemType } from '@/context/PosContext';
import { CartItem as PosCartItem } from '@/components/pos/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { ShoppingCart, Trash2 } from 'lucide-react';

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
    <Card className="border-border bg-card flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Shopping Cart
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">The cart is empty</p>
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
          {/* Summary */}
          <div className="border-t border-border px-6 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({Math.round(taxRate * 100)}%)</span>
              <span className="text-foreground font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border px-6 py-3">
            <Button variant="outline" size="sm" onClick={onClearCart} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
