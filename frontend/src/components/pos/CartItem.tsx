'use client';

import Image from 'next/image';
import { CartItem as CartItemType } from '@/context/PosContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Minus, Plus, Trash2, Package } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity, price } = item;
  const lineTotal = price * quantity;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const qty = isNaN(value) ? 1 : Math.max(1, value);
    // Clamp to available stock
    const clampedQty = Math.min(qty, product.quantity);
    onUpdateQuantity(product.id, clampedQty);
  };

  const handleIncrement = () => {
    if (quantity < product.quantity) {
      onUpdateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 last:border-b-0 border-b border-border">
      {/* Product Image or Placeholder */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-muted/30 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={48}
            height={48}
            className="rounded-md object-cover"
          />
        ) : (
          <Package className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground text-sm truncate">{product.name}</h4>
        <p className="text-xs text-muted-foreground">
          SKU: {product.sku} • {formatCurrency(price)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className="h-7 w-7 p-0"
          aria-label="Decrease quantity"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          min={1}
          max={product.quantity}
          value={quantity}
          onChange={handleQuantityChange}
          className={cn('w-12 text-center text-sm', 'focus-visible:ring-primary/50')}
          aria-label="Quantity"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={quantity >= product.quantity}
          className="h-7 w-7 p-0"
          aria-label="Increase quantity"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Line Total */}
      <div className="w-20 text-right font-medium text-foreground">{formatCurrency(lineTotal)}</div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(product.id)}
        className={cn(
          'h-7 w-7 p-0 text-muted-foreground hover:text-destructive',
          'hover:bg-destructive/10'
        )}
        aria-label="Remove from cart"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
