'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCustomer } from '@/hooks/useCustomers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, User } from 'lucide-react';
import Link from 'next/link';

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: response, isLoading, error } = useCustomer(id);
  const customer = response?.data;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.push('/login');
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
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="border-destructive bg-destructive/5">
            <CardContent>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{errorMessage}</p>
              </div>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/customers">← Back to Customers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent>
              <p className="text-muted-foreground">Customer not found.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/customers">← Back to Customers</Link>
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
              <Link href={`/customers/${customer.id}`}>← Back</Link>
            </Button>
            <h1 className="text-headline-lg text-foreground">Edit Customer</h1>
          </div>
        </div>

        {/* Form */}
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
