'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit, Trash2, Calendar, AlertCircle, Package } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/common';
import { formatCurrency } from '@/lib/formatters';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: response, isLoading, error } = useCompany(id);
  const deleteCompanyMutation = useDeleteCompany();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.push('/login');
    }
  }, [session, authPending, router]);

  const company = response?.data;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!company) return;

    try {
      await deleteCompanyMutation.mutateAsync(company.id);
      router.push('/companies');
    } catch {
      // Error handled by mutation
    }
  };

  const errorMessage = error instanceof Error ? error.message : 'Failed to load company';

  if (authPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="container-max">
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{errorMessage}</p>
              </div>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/companies">← Back to Companies</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="container-max">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Company not found.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/companies">← Back to Companies</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container-max">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/companies">← Back</Link>
            </Button>
            <h1 className="text-headline-lg text-foreground">{company.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/companies/${company.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              disabled={deleteCompanyMutation.isPending}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteCompanyMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Company Details */}
        <Card className="bg-card border-border card-elevated mb-6">
          <CardHeader>
            <CardTitle className="text-headline-md">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Logo/Image */}
              {company.image && (
                <div className="mb-4">
                  <div className="relative h-48 w-full max-w-md overflow-hidden rounded-lg bg-muted">
                    <img
                      src={company.image}
                      alt={company.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-headline-lg text-foreground">{company.name}</h2>
                  {company.description && (
                    <p className="mt-1 text-body-md text-on-surface-variant whitespace-pre-wrap">
                      {company.description}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="border-t border-border pt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(company.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <Calendar className="h-4 w-4" />
                    <span>Updated: {new Date(company.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card className="bg-card border-border card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({company.products?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.products && company.products.length > 0 ? (
              <div className="space-y-4">
                {company.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 card-elevated"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{product.name}</h3>
                      <p className="text-body-sm text-on-surface-variant">
                        SKU: {product.sku} • Price: <span className="text-data-mono">{formatCurrency(product.price)}</span> • Stock: <span className="text-data-mono">{product.quantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-body-md">No products found for this company.</p>
                <Button asChild className="mt-4">
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Company"
          description={`Are you sure you want to delete "${company.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={deleteCompanyMutation.isPending}
        />
      </div>
    </div>
  );
}
