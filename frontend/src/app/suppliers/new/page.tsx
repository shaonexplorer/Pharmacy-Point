'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/* ───────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Create Supplier Page
 * ───────────────────────────────────────────────────────────────────────── */

export default function CreateSupplierPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

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
    return null;
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
                <h1 className="text-headline-lg text-foreground">Add New Supplier</h1>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Register a new supplier and their representatives.
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
            <span>Fill in the supplier details below</span>
          </div>
          <SupplierForm mode="create" />
        </div>
      </div>
    </div>
  );
}
