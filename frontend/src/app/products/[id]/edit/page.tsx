'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProduct } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Edit, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();

  const { data: product, isLoading, error } = useProduct(params.id);

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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/products/${product.id}`}>← Product Details</Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Edit className="h-4 w-4" />
            <span>Update the product details below</span>
          </div>
          <ProductForm product={product} mode="edit" />
        </div>
      </div>
    </div>
  );
}
