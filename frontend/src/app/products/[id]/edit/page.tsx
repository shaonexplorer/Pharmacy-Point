'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProduct } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Edit, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: product, isLoading, error } = useProduct(id);

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

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container-max mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/products/${product.id}`}>← Product Details</Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10">
                <Edit className="h-4 w-4 text-secondary" />
              </div>
              <h1 className="text-headline-lg text-foreground">Edit Product</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card card-elevated p-6">
          <div className="mb-4 flex items-center gap-2 text-label-md text-on-surface-variant">
            <Edit className="h-4 w-4" />
            <span>Update the product details below</span>
          </div>
          <ProductForm product={product} mode="edit" />
        </div>
      </div>
    </div>
  );
}
