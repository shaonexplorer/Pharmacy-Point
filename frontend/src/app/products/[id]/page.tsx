'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  Package,
  Calendar,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: product, isLoading, error } = useProduct(id);
  const deleteProductMutation = useDeleteProduct();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.push('/login');
    }
  }, [session, authPending, router]);

  const handleDelete = async () => {
    if (!product || !window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync(product.id);
      router.push('/products');
    } catch {
      // Error handled by mutation
    }
  };

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
        <div className="mx-auto max-w-4xl">
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{errorMessage}</p>
              </div>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/products">← Back to Products</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Product not found.</p>
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
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
              onClick={handleDelete}
              disabled={deleteProductMutation.isPending}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Image / Media */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Pricing &amp; Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Quantity</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-semibold text-foreground">
                        {product.quantity} units
                      </p>
                      {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
                      {isLowStock && !isOutOfStock && <Badge variant="secondary">Low Stock</Badge>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Threshold</p>
                    <p className="text-foreground">{product.lowStock} units</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">SKU</p>
                      <p className="font-mono text-foreground">{product.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <p className="text-foreground">{product.category}</p>
                      </div>
                    </div>
                  </div>
                  {product.company && (
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="text-foreground font-medium">{product.company.name}</p>
                    </div>
                  )}
                  {product.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-foreground whitespace-pre-wrap">{product.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
