'use client';

import { Product } from '@pharmacy-point/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onDelete?: (product: Product) => void;
}

/**
 * Compute stock status from a Product (not InventoryItem).
 * Returns 'out' | 'low' | 'ok' based on quantity and lowStock threshold.
 */
function getProductStockStatus(product: Product): 'out' | 'low' | 'ok' {
  if (product.quantity === 0) return 'out';
  if (product.quantity <= product.lowStock) return 'low';
  return 'ok';
}

/**
 * Dosage indicator bar — a horizontal bar that fills proportionally to the
 * stock level relative to 2× the low-stock threshold, using the medication-
 * vial fill-level colour scheme (Safety Green → Warning Amber → Error Red).
 *
 * This is a signature aesthetic element specific to the pharmacy domain:
 * the bar's fill level evokes the liquid level in a medication vial,
 * creating a visual language that could not be mistaken for any other industry.
 */
function DosageIndicator({ product }: { product: Product }) {
  const status = getProductStockStatus(product);
  const threshold = Math.max(product.lowStock || 10, 1);
  const fillPct = Math.min(100, Math.max(0, (product.quantity / (threshold * 2)) * 100));

  const barColor = status === 'out' ? 'bg-error' : status === 'low' ? 'bg-warning' : 'bg-tertiary';

  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          barColor,
          status === 'out' && 'animate-pulse-subtle'
        )}
        style={{ width: `${fillPct}%`, minWidth: '2px' }}
      />
    </div>
  );
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const stockStatus = getProductStockStatus(product);
  const isLowStock = stockStatus === 'low';
  const isOutOfStock = stockStatus === 'out';

  const badgeVariant = isOutOfStock ? 'destructive' : isLowStock ? 'warning' : 'success';

  const badgeLabel = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock';

  return (
    <Card
      className={cn(
        'bg-card border-border card-elevated group',
        'flex flex-col transition-all duration-200'
      )}
    >
      <CardHeader className="pb-3">
        <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardTitle className="text-headline-md text-card-foreground mt-2 line-clamp-1">
          {product.name}
        </CardTitle>
        {product.company && (
          <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-1">
            {product.company.name}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          <p className="text-2xl font-bold text-data-mono text-primary">
            {formatCurrency(product.price)}
          </p>
          <div>
            <p className="text-xs font-mono tracking-wider text-on-surface-variant">
              SKU: {product.sku}
            </p>
            <p className="text-xs text-label-md text-on-surface-variant">
              Category: <span className="text-on-surface font-medium">{product.category}</span>
            </p>
          </div>

          <div>
            <p className="text-label-md text-on-surface-variant">Stock Level</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-data-mono font-medium text-foreground">
                {product.quantity} units
              </span>
              <Badge variant={badgeVariant} size="sm">
                {badgeLabel}
              </Badge>
            </div>
            {/* Dosage indicator bar — signature aesthetic element */}
            <DosageIndicator product={product} />
          </div>

          {product.description && (
            <p className="text-body-sm text-on-surface-variant line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-3 border-t border-border mt-auto">
        <Button asChild variant="ghostIcon" size="sm" title="View">
          <Link href={`/products/${product.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button asChild variant="ghostIcon" size="sm" title="Edit">
            <Link href={`/products/${product.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghostIcon"
              size="sm"
              onClick={() => onDelete(product)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
