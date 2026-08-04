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

/**
 * Miniature medication-bottle stock indicator — a condensed version of the
 * dashboard's StockVial component. Grounds the POS in the pharmacy subject
 * matter (medication bottles are literal artifacts of the work) while making
 * stock urgency immediately scannable at a glance.
 *
 * DESIGN.md → Status Chips:
 *  - In Stock / Success: tertiary (#006b2c)
 *  - Low Stock / Warning: warning (amber)
 *  - Out of Stock / Error: error (#ba1a1a)
 */
function StockBottle({ quantity, lowStock }: { quantity: number; lowStock: number }) {
  const threshold = Math.max(lowStock || 10, 1);
  const isCritical = quantity <= threshold / 2;
  const isLow = quantity <= threshold;

  const fillPct = Math.min(100, Math.max(0, (quantity / (threshold * 2)) * 100));

  const fillColor = isCritical
    ? 'hsl(var(--error-hsl))'
    : isLow
      ? 'hsl(var(--warning-hsl))'
      : 'hsl(var(--tertiary-hsl))';

  return (
    <div className="relative mx-auto h-10 w-5">
      {/* Cap */}
      <div className="absolute top-0 left-1/2 -ml-[3px] h-2 w-6 rounded-b-md bg-foreground" />
      {/* Bottle body */}
      <div className="absolute inset-0 top-2 rounded-full border border-border bg-card/50" />
      {/* Liquid fill — grows from bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-300"
        style={{
          height: `${fillPct}%`,
          minHeight: '2px',
          backgroundColor: fillColor,
        }}
      />
    </div>
  );
}

/**
 * Stock status badge — uses DESIGN.md status chip colors with full pill shape.
 */
function StockStatusBadge({ quantity, lowStock }: { quantity: number; lowStock: number }) {
  const threshold = Math.max(lowStock || 10, 1);

  if (quantity <= 0) {
    return (
      <Badge variant="destructive" size="sm">
        Out of Stock
      </Badge>
    );
  }

  if (quantity <= threshold / 2) {
    return (
      <Badge variant="destructive" size="sm">
        Critical
      </Badge>
    );
  }

  if (quantity <= threshold) {
    return (
      <Badge variant="warning" size="sm">
        Low Stock
      </Badge>
    );
  }

  return (
    <Badge variant="success" size="sm">
      In Stock
    </Badge>
  );
}

export function ProductGrid({
  products,
  onAddItem,
  canAddToCart,
  isLoading = false,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
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
      <Card className="border-dashed border-border p-8 text-center card-elevated">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-headline-md font-semibold text-foreground">No products found</h3>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Try adjusting your search query.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
      {products.map((product) => {
        const isOutOfStock = product.quantity <= 0;
        const showSecondary = product.quantity >= 2 && canAddToCart(product, 2);
        const showTertiary = product.quantity >= 3 && canAddToCart(product, 3);

        return (
          <Card
            key={product.id}
            className={cn('border-border card-elevated p-3', isOutOfStock && 'opacity-60')}
          >
            <div className="flex gap-3">
              {/* Mini stock bottle visualization — pharmacy subject matter */}
              <div className="flex h-20 w-16 shrink-0 items-end justify-center">
                <StockBottle quantity={product.quantity} lowStock={product.lowStock} />
              </div>

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
                <p className="text-sm font-bold text-data-mono text-primary">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-on-surface-variant font-mono">SKU: {product.sku}</p>
                <StockStatusBadge quantity={product.quantity} lowStock={product.lowStock} />
              </div>
            </div>

            {/* Quick Add — DESIGN.md: 48px minimum touch target on tablet/POS */}
            {isOutOfStock ? (
              <div className="mt-3">
                <Button variant="ghost" size="tablet" disabled className="h-12 w-full text-xs">
                  Out of Stock
                </Button>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-1.5">
                <Button
                  size="tablet"
                  variant="secondary"
                  onClick={() => onAddItem(product, 1)}
                  disabled={!canAddToCart(product, 1)}
                  className="flex-1 text-xs"
                >
                  +1
                </Button>
                {showSecondary && (
                  <Button
                    size="tablet"
                    variant="outline"
                    onClick={() => onAddItem(product, 2)}
                    disabled={!canAddToCart(product, 2)}
                    className="flex-1 text-xs"
                  >
                    +2
                  </Button>
                )}
                {showTertiary && (
                  <Button
                    size="tablet"
                    variant="outline"
                    onClick={() => onAddItem(product, 3)}
                    disabled={!canAddToCart(product, 3)}
                    className="flex-1 text-xs"
                  >
                    +3
                  </Button>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
