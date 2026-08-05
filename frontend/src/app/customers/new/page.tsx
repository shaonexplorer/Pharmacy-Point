'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Create Customer Page
 *
 * Layout follows the same pattern as the Inventory page:
 *  - flex-1 inside SidebarInset (not container-max)
 *  - prescription-border-l signature element on the header
 *  - SidebarTrigger for desktop sidebar toggle
 * ────────────────────────────────────────────────────────────────────────── */

export default function CreateCustomerPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
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
    <div className="flex-1 p-4 sm:p-6">
      <div className="w-full space-y-6">
        {/* ── Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/customers">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-headline-lg text-foreground">Add New Customer</h1>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Register a new customer for your pharmacy management system.
                </p>
              </div>
            </div>
          </div>
          <SidebarTrigger className="hidden md:flex" />
        </div>

        {/* ── Form ── */}
        <div className="rounded-xl border border-border bg-card card-elevated p-6">
          <div className="mb-4 flex items-center gap-2 text-label-md text-on-surface-variant">
            <Plus className="h-4 w-4" />
            <span>Fill in the customer details below</span>
          </div>
          <CustomerForm mode="create" />
        </div>
      </div>
    </div>
  );
}
