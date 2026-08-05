'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Edit,
  ArrowLeft,
  Package,
  Calendar,
  Tag,
  AlertCircle,
  Warehouse,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { StockVial } from '@/components/dashboard';
import { ConfirmDialog } from '@/components/common';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: product, isLoading, error } = useProduct(id);
  const deleteProductMutation = useDeleteProduct();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.push('/login');
    }
  }, [session, authPending, router]);

  const errorMessage = error instanceof Error ? error.message : 'Failed to load product';

  if (authPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container-max mx-auto">
          <Card className="border-error bg-error/5 card-elevated">
            <CardContent className="flex items-center gap-3 px-6 py-8">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">{errorMessage}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container-max mx-auto">
          <Card className="border-border bg-card card-elevated">
            <CardContent className="flex min-h-[120px] flex-col items-center justify-center text-center px-8 py-8">
              <p className="text-body-md text-on-surface-variant">Product not found.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/products">← Back to Products</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isLowStock = product.quantity <= product.lowStock;
  const isOutOfStock = product.quantity === 0;
  const stockStatus = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock';
  const badgeVariant = isOutOfStock ? 'destructive' : isLowStock ? 'warning' : 'success';

  const handleConfirmDelete = async () => {
    await deleteProductMutation.mutateAsync(product.id);
    router.push('/products');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="sm:container-max mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <h1 className="sm:text-headline-lg text-foreground">{product.name}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/products/${product.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
              {/* Trash2 icon would go here but removed to reduce imports - using text instead */}
              Delete
            </Button>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Image / Media */}
          <Card className="bg-card border-border card-elevated">
            <CardContent className="p-4">
              <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price & Stock */}
            <Card className="bg-card border-border card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-headline-md">Pricing &amp; Availability</CardTitle>
                <CardDescription className="text-body-md text-on-surface-variant">
                  Current price and stock levels for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-label-md text-on-surface-variant">Price</p>
                    <p className="text-3xl font-bold text-data-mono text-primary mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-label-md text-on-surface-variant">Stock Quantity</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-2xl font-bold text-data-mono text-foreground">
                        {product.quantity} units
                      </p>
                      <Badge variant={badgeVariant} size="sm">
                        {stockStatus}
                      </Badge>
                    </div>

                    {/* Signature: Medication vial visualization */}
                    <div className="mt-3 flex items-center gap-4">
                      <StockVial
                        quantity={product.quantity}
                        lowStock={product.lowStock}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-label-md text-on-surface-variant">Low Stock Threshold</p>
                        <p className="text-body-md text-foreground">{product.lowStock} units</p>
                      </div>
                    </div>
                  </div>

                  {/* Dosage indicator bar — fills proportionally to stock level */}
                  <div>
                    <div className="flex justify-between text-label-md text-on-surface-variant mb-1">
                      <span>Stock Level</span>
                      <span className="text-data-mono">
                        {product.quantity}/{product.lowStock * 2} units (healthy max)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500 ease-out',
                          isOutOfStock ? 'bg-error' : isLowStock ? 'bg-warning' : 'bg-tertiary'
                        )}
                        style={{
                          width: `${Math.min(100, Math.max(0, (product.quantity / (product.lowStock * 2)) * 100))}%`,
                          minWidth: '2px',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="bg-card border-border card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-headline-md">Product Information</CardTitle>
                <CardDescription className="text-body-md text-on-surface-variant">
                  Product identification and classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-label-md text-on-surface-variant">SKU</p>
                      <p className="text-data-mono text-foreground mt-1">{product.sku}</p>
                    </div>
                    <div>
                      <p className="text-label-md text-on-surface-variant">Category</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Tag className="h-4 w-4 text-on-surface-variant" />
                        <p className="text-body-md text-foreground capitalize">
                          {product.category}
                        </p>
                      </div>
                    </div>
                  </div>
                  {product.company && (
                    <div>
                      <p className="text-label-md text-on-surface-variant">Company</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Warehouse className="h-4 w-4 text-on-surface-variant" />
                        <p className="text-body-md text-foreground font-medium">
                          {product.company.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {product.description && (
                    <div>
                      <p className="text-label-md text-on-surface-variant">Description</p>
                      <p className="text-body-md text-foreground whitespace-pre-wrap mt-1">
                        {product.description}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                      <Calendar className="h-4 w-4" />
                      <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Product"
          description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={deleteProductMutation.isPending}
        />
      </div>
    </div>
  );
}
