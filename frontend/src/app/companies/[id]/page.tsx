'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Edit, Trash2, ArrowLeft, Package, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/common';

/* ─────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Company Detail Page
 *
 * Layout follows the same pattern as the Products detail page:
 *  - flex-1 inside SidebarInset (not container-max)
 *  - prescription-border-l signature element on the header
 *  - SidebarTrigger for desktop sidebar toggle
 *  - Clinical Precision error colors (error/30, error/10)
 *  - data-mono for numerical data (prices, quantities)
 * ────────────────────────────────────────────────────────────────────────── */

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: response, isLoading, error } = useCompany(id);
  const deleteCompanyMutation = useDeleteCompany();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.replace('/login');
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
      router.replace('/companies');
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
      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full space-y-6">
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">{errorMessage}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full space-y-6">
          <Card className="border-border bg-card card-elevated">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-body-md text-on-surface-variant">Company not found.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/companies">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Companies
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="w-full space-y-6">
        {/* ── Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/companies">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-headline-lg text-foreground">{company.name}</h1>
                {company.description && (
                  <p className="mt-1 text-body-md text-on-surface-variant line-clamp-2 max-w-2xl">
                    {company.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild variant="outline" size="sm">
              <Link href={`/companies/${company.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructiveOutline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleteCompanyMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteCompanyMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* ── Company Details ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Logo/Image */}
              {company.image && (
                <div className="mb-4">
                  <div className="relative h-48 w-full max-w-md overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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

        {/* ── Products Section ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md flex items-center gap-2">
              <Package className="h-5 w-5 text-secondary" />
              Products
              <Badge variant="outline" size="sm">
                {company.products?.length ?? 0}
              </Badge>
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
                        <span className="text-label-md">SKU:</span>{' '}
                        <span className="text-data-mono">{product.sku}</span>
                        {'  •  '}
                        <span className="text-label-md">Price:</span>{' '}
                        <span className="text-data-mono">{formatCurrency(product.price)}</span>
                        {'  •  '}
                        <span className="text-label-md">Stock:</span>{' '}
                        <span className="text-data-mono">{product.quantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-on-surface-variant">
                <Package className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-body-md">No products found for this company.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Delete Confirmation Dialog ── */}
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
