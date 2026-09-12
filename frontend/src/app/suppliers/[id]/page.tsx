'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useSupplier, useDeleteSupplier } from '@/hooks/useSuppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  Store,
  Calendar,
  AlertCircle,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/common';
import { formatDate } from '@/lib/formatters';

/* ───────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Supplier Detail Page
 *
 * Shows supplier info, representative directory, and purchase-order summary.
 * ───────────────────────────────────────────────────────────────────────── */

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: response, isLoading, error } = useSupplier(id);
  const deleteSupplierMutation = useDeleteSupplier();

  const supplier = response?.data;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.replace('/login');
    }
  }, [session, authPending, router]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplier) return;

    try {
      await deleteSupplierMutation.mutateAsync(supplier.id);
      router.replace('/suppliers');
    } catch {
      // Error handled by mutation
    }
  };

  const errorMessage = error instanceof Error ? error.message : 'Failed to load supplier';

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

  if (!supplier) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full space-y-6">
          <Card className="border-border bg-card card-elevated">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <Store className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-body-md text-on-surface-variant">Supplier not found.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/suppliers">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Suppliers
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
                <Link href="/suppliers">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-headline-lg text-foreground flex items-center gap-2">
                  <Store className="h-6 w-6 text-primary" />
                  {supplier.name}
                </h1>
                {supplier.contactName && (
                  <p className="mt-1 text-body-md text-on-surface-variant">
                    Contact: {supplier.contactName}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild variant="outline" size="sm">
              <Link href={`/suppliers/${supplier.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructiveOutline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleteSupplierMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteSupplierMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* ── Supplier Information Card ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Main contact fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Store className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Supplier Name</span>
                    <p className="text-body-md text-foreground">{supplier.name}</p>
                  </div>
                </div>

                {supplier.contactName && (
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-secondary mt-0.5" />
                    <div>
                      <span className="text-label-sm text-on-surface-variant">Contact Person</span>
                      <p className="text-body-md text-foreground">{supplier.contactName}</p>
                    </div>
                  </div>
                )}

                {supplier.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-secondary mt-0.5" />
                    <div>
                      <span className="text-label-sm text-on-surface-variant">Email</span>
                      <p className="text-body-md text-foreground">{supplier.email}</p>
                    </div>
                  </div>
                )}

                {supplier.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-secondary mt-0.5" />
                    <div>
                      <span className="text-label-sm text-on-surface-variant">Phone</span>
                      <p className="text-body-md text-foreground">{supplier.phone}</p>
                    </div>
                  </div>
                )}

                {supplier.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                    <div>
                      <span className="text-label-sm text-on-surface-variant">Address</span>
                      <p className="text-body-md text-foreground whitespace-pre-wrap">
                        {supplier.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Business fields */}
              <div className="border-t border-border pt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Lead Time</span>
                    <p className="text-body-md text-foreground">{supplier.leadTimeDays} days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Payment Terms</span>
                    <p className="text-body-md text-foreground">{supplier.paymentTerms || '—'}</p>
                  </div>
                </div>

                {supplier.performanceRating != null && (
                  <div className="flex items-start gap-3">
                    <Star className="h-4 w-4 text-warning mt-0.5" />
                    <div>
                      <span className="text-label-sm text-on-surface-variant">
                        Performance Rating
                      </span>
                      <div className="flex items-center gap-1">
                        <p className="text-body-md text-foreground">
                          {supplier.performanceRating.toFixed(1)} / 5
                        </p>
                        <Badge variant="outline" size="sm">
                          {supplier.performanceRating >= 4
                            ? 'Excellent'
                            : supplier.performanceRating >= 3
                              ? 'Good'
                              : 'Needs Attention'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Representatives ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              Representatives
              <Badge variant="outline" size="sm">
                {supplier.representatives?.length ?? 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.representatives && supplier.representatives.length > 0 ? (
              <div className="space-y-4">
                {supplier.representatives.map((rep) => (
                  <div
                    key={rep.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-headline-sm text-foreground">{rep.name}</h3>
                      {rep.designation && (
                        <Badge variant="secondary" size="sm">
                          {rep.designation}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {rep.email && (
                        <div className="flex items-center gap-2 text-body-sm">
                          <Mail className="h-3 w-3 text-on-surface-variant" />
                          <a
                            href={`mailto:${rep.email}`}
                            className="text-secondary hover:underline"
                          >
                            {rep.email}
                          </a>
                        </div>
                      )}
                      {rep.phone && (
                        <div className="flex items-center gap-2 text-body-sm">
                          <Phone className="h-3 w-3 text-on-surface-variant" />
                          <a
                            href={`tel:${rep.phone}`}
                            className="text-secondary hover:underline"
                          >
                            {rep.phone}
                          </a>
                        </div>
                      )}
                      {rep.whatsappNumber && (
                        <div className="flex items-center gap-2 text-body-sm">
                          <svg
                            className="h-3 w-3 text-on-surface-variant"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M12.04 16.94l-3.91-3.91 1.42-1.41 3.15 3.15 7.85-7.85 1.41 1.41z" />
                          </svg>
                          <a
                            href={`https://wa.me/${rep.whatsappNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:underline"
                          >
                            {rep.whatsappNumber}
                          </a>
                        </div>
                      )}
                      {rep.address && (
                        <div className="flex items-start gap-2 text-body-sm">
                          <MapPin className="h-3 w-3 text-on-surface-variant mt-0.5" />
                          <span className="text-on-surface-variant">{rep.address}</span>
                        </div>
                      )}
                    </div>

                    {rep.notes && (
                      <div className="text-body-sm text-on-surface-variant">
                        <span className="text-label-sm">Notes:</span> {rep.notes}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                      <Calendar className="h-3 w-3" />
                      Added {formatDate(rep.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-on-surface-variant">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-body-md">No representatives added yet.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/suppliers/${supplier.id}/edit`}>
                    Add Representatives
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Recent Purchase Orders ── */}
        {supplier.purchaseOrders && supplier.purchaseOrders.length > 0 && (
          <Card className="border-border bg-card card-elevated">
            <CardHeader>
              <CardTitle className="text-headline-md">Recent Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supplier.purchaseOrders.map((po) => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{po.poNumber}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        Status: {po.status} · Total: ${Number(po.totalAmount).toFixed(2)}
                      </p>
                    </div>
                    <Calendar className="h-4 w-4 text-on-surface-variant" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Delete Confirmation Dialog ── */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Supplier"
          description={
            supplier
              ? `Are you sure you want to delete "${supplier.name}"? This action cannot be undone.`
              : ''
          }
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={deleteSupplierMutation.isPending}
        />
      </div>
    </div>
  );
}
