'use client';

import Image from 'next/image';
import { Product } from '@pharmacy-point/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
 * Miniature medication-vial stock indicator — the signature pharmacy element.
 *
 * Grounded in the subject: a real dispensing vial is a literal artifact of
 * pharmacy work. This condensed "bottle" reads stock urgency at a glance
 * while anchoring the POS in the pharmacy's own visual language (rather than
 * a generic coloured bar).
 *
 * DESIGN.md → Status Chips:
 *  - In Stock / Success: tertiary (#006b2c)
 *  - Low Stock / Warning: warning (amber)
 *  - Out of Stock / Error: error (#ba1a1c)
 */
function StockVial({ quantity, lowStock }: { quantity: number; lowStock: number }) {
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
      {/* Cap — wider than the body, centered like a real vial */}
      <div className="absolute top-0 left-1/2 h-2 w-6 -translate-x-1/2 rounded-b-md bg-foreground" />
      {/* Bottle body */}
      <div className="absolute inset-0 top-2 rounded-sm border border-border bg-card/50" />
      {/* Liquid fill — grows from the bottom to read stock urgency at a glance */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-b-sm transition-all duration-300"
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
 * Stock status chip — DESIGN.md full-pill (9999px) status chip.
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="card-elevated p-4">
            <Skeleton className="aspect-[4/3] w-full rounded-md" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
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
          Try adjusting your search query or clearing the category filter.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
      {products.map((product) => {
        const isOutOfStock = product.quantity <= 0;

        return (
          <Card
            key={product.id}
            className={cn('relative card-elevated p-3', isOutOfStock && 'opacity-60')}
          >
            <div className="flex gap-3">
              {/* Product Image or Placeholder */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/30">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={54}
                    height={54}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-col items-start justify-between gap-1">
                  <h4 className="text-sm font-medium leading-tight text-foreground truncate">
                    {product.name}
                  </h4>
                  <StockStatusBadge quantity={product.quantity} lowStock={product.lowStock} />
                  {/* Stock status + vial indicator — pharmacy signature element */}
                  {/* <div className="flex items-center gap-1.5 shrink-0">
                    <StockStatusBadge quantity={product.quantity} lowStock={product.lowStock} />
                    <StockVial quantity={product.quantity} lowStock={product.lowStock} />
                  </div> */}
                </div>

                {/* Price — data-mono for numerical clarity per DESIGN.md */}
                <p className="text-data-mono text-foreground font-medium">
                  {formatCurrency(product.price)}
                </p>

                {/* SKU — data-mono prevents 0/O confusion per DESIGN.md */}
                <p className="text-data-mono text-on-surface-variant">SKU: {product.sku}</p>
              </div>
            </div>

            {/* Quick Add — DESIGN.md: 48px minimum touch target on tablet/POS */}
            <div className="sm:mt-3">
              <Button
                size="tablet"
                variant={isOutOfStock ? 'ghost' : 'secondary'}
                onClick={() => onAddItem(product, 1)}
                disabled={!canAddToCart(product, 1) || isOutOfStock}
                className="h-12 w-full text-xs"
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
