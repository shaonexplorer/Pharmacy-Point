'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCustomer } from '@/hooks/useCustomers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, AlertCircle, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Edit Customer Page
 *
 * Layout follows the same pattern as the Inventory page:
 *  - flex-1 inside SidebarInset (not container-max)
 *  - prescription-border-l signature element on the header
 *  - SidebarTrigger for desktop sidebar toggle
 *  - Clinical Precision error colors (error/30, error/10)
 * ────────────────────────────────────────────────────────────────────────── */

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: response, isLoading, error } = useCustomer(id);
  const customer = response?.data;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.replace('/login');
    }
  }, [session, authPending, router]);

  const errorMessage = error instanceof Error ? error.message : 'Failed to load customer';

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

  if (!customer) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full space-y-6">
          <Card className="border-border bg-card card-elevated">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-body-md text-on-surface-variant">Customer not found.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/customers">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Customers
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
                <Link href={`/customers/${customer.id}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-headline-lg text-foreground">Edit Customer</h1>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Update information for {customer.name}.
                </p>
              </div>
            </div>
          </div>
          <SidebarTrigger className="hidden md:flex" />
        </div>

        {/* ── Form ── */}
        <div className="rounded-xl border border-border bg-card card-elevated p-6">
          <div className="mb-4 flex items-center gap-2 text-label-md text-on-surface-variant">
            <User className="h-4 w-4" />
            <span>Update customer information</span>
          </div>
          <CustomerForm mode="edit" customer={customer} />
        </div>
      </div>
    </div>
  );
}
