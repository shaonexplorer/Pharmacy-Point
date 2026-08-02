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

  return (
    <Card className="bg-card border-border transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ExternalLink className="h-8 w-8" />
            </div>
          )}
        </div>
        <CardTitle className="text-card-foreground text-lg mt-2 line-clamp-1">{product.name}</CardTitle>
        {product.company && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.company.name}</p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
          <p className="text-sm text-muted-foreground font-mono">SKU: {product.sku}</p>
          <p className="text-sm">
            Category:{' '}
            <span className="text-foreground font-medium">{product.category}</span>
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Stock: {product.quantity}
              </span>
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Low Stock
                </Badge>
              )}
            </div>
          </div>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-3 border-t border-border">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/products/${product.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/products/${product.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}