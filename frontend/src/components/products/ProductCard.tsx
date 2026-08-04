'use client';

import { Product } from '@pharmacy-point/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onDelete?: (product: Product) => void;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const isLowStock = product.quantity <= product.lowStock;
  const isOutOfStock = product.quantity === 0;

  return (
    <Card className="bg-card border-border card-elevated transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <ExternalLink className="h-8 w-8" />
            </div>
          )}
        </div>
        <CardTitle className="text-headline-md text-card-foreground mt-2 line-clamp-1">
          {product.name}
        </CardTitle>
        {product.company && (
          <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-1">{product.company.name}</p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          <p className="text-2xl font-bold text-data-mono text-primary">{formatCurrency(product.price)}</p>
          <p className="text-xs text-on-surface-variant font-mono tracking-wider">
            SKU: {product.sku}
          </p>
          <p className="text-xs text-label-md text-on-surface-variant">
            Category: <span className="text-on-surface font-medium">{product.category}</span>
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant data-mono">Stock: {product.quantity}</span>
              {isOutOfStock && (
                <Badge variant="destructive" size="sm">
                  Out of Stock
                </Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge variant="warning" size="sm">
                  Low Stock
                </Badge>
              )}
            </div>
          </div>
          {product.description && (
            <p className="text-body-sm text-on-surface-variant line-clamp-2">{product.description}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-3 border-t border-border">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href={`/products/${product.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href={`/products/${product.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
