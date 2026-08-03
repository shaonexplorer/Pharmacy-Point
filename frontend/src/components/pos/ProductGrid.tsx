'use client';

import Image from 'next/image';
import { Product } from '@pharmacy-point/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddItem: (product: Product, quantity: number) => void;
  canAddToCart: (product: Product, quantity: number) => boolean;
  isLoading?: boolean;
}

export function ProductGrid({
  products,
  onAddItem,
  canAddToCart,
  isLoading = false,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border p-4 animate-pulse">
            <div className="aspect-square w-full rounded-md bg-muted mb-2" />
            <div className="h-4 w-3/4 rounded bg-muted mb-2" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="border-dashed border-border p-8 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No products found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search query.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className={cn(
            'border-border p-3 transition-shadow duration-200 hover:shadow-md',
            product.quantity === 0 && 'opacity-60'
          )}
        >
          <div className="flex gap-2">
            {/* Product Image or Placeholder */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-muted/30 overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm leading-tight truncate">
                {product.name}
              </h4>
              <p className="text-sm font-bold text-primary">{formatCurrency(product.price)}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>SKU: {product.sku}</span>
                {product.quantity <= product.lowStock && (
                  <Badge variant="warning" size="sm">
                    Low
                  </Badge>
                )}
                {product.quantity === 0 && (
                  <Badge variant="destructive" size="sm">
                    Out
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick Add Buttons */}
          {product.quantity > 0 ? (
            <div className="mt-3 flex items-center justify-center gap-1">
              <Button
                size="compact"
                variant="outline"
                onClick={() => onAddItem(product, 1)}
                disabled={!canAddToCart(product, 1)}
                className="h-7 w-full text-xs"
              >
                +1
              </Button>
              <Button
                size="compact"
                variant="outline"
                onClick={() => onAddItem(product, 2)}
                disabled={!canAddToCart(product, 2)}
                className="h-7 w-full text-xs"
              >
                +2
              </Button>
              <Button
                size="compact"
                variant="outline"
                onClick={() => onAddItem(product, 3)}
                disabled={!canAddToCart(product, 3)}
                className="h-7 w-full text-xs"
              >
                +3
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <Button size="compact" variant="ghost" disabled className="h-7 w-full text-xs">
                Out of Stock
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
