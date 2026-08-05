'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { ProductForm } from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container-max mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/products">← Products</Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10">
                <Plus className="h-4 w-4 text-secondary" />
              </div>
              <h1 className="text-headline-lg text-foreground">Add New Product</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card card-elevated p-6">
          <div className="mb-4 flex items-center gap-2 text-label-md text-on-surface-variant">
            <Plus className="h-4 w-4" />
            <span>Fill in the product details below</span>
          </div>
          <ProductForm mode="create" />
        </div>
      </div>
    </div>
  );
}
