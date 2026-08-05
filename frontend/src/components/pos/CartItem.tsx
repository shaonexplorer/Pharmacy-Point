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
    <div className="flex items-center gap-2 py-3 first:pt-0 last:pb-0 last:border-b-0 border-b border-border">
      {/* Product Image or Placeholder */}
      <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/30">
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
      <div className="w-[110px] sm:flex-1 sm:min-w-[60px]">
        <h4 className="text-sm font-medium text-foreground truncate">{product.name}</h4>
        <p className="text-xs text-on-surface-variant">
          SKU: {product.sku} • <span className="text-data-mono">{formatCurrency(price)}</span> each
        </p>
      </div>

      {/* Quantity Controls — DESIGN.md: 48px minimum touch target on tablet/POS */}
      <div className="flex items-center gap-2 ">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className="h-10 w-10 p-0"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          min={1}
          max={product.quantity}
          value={quantity}
          onChange={handleQuantityChange}
          className={cn(
            'w-12 text-center text-data-mono focus-visible:ring-[3px] focus-visible:ring-ring/50'
          )}
          aria-label="Quantity"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={quantity >= product.quantity}
          className="h-10 w-10 p-0"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Line Total — data-mono for numerical clarity per DESIGN.md */}
      <div className="sm:w-20 text-right text-data-mono font-medium text-foreground">
        {formatCurrency(lineTotal)}
      </div>

      {/* Remove Button — secondary action, keep quiet until needed */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(product.id)}
        className={cn(
          'h-9 w-9 p-0 text-muted-foreground hover:text-destructive',
          'hover:bg-destructive/10'
        )}
        aria-label="Remove from cart"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
