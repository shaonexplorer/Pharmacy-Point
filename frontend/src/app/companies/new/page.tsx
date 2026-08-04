'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CreateCompanyPage() {
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
      <div className="container-max">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/companies">← Companies</Link>
            </Button>
            <h1 className="text-headline-lg text-foreground">Add New Company</h1>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card card-elevated p-6">
          <div className="mb-4 flex items-center gap-2 text-label-md text-on-surface-variant">
            <Plus className="h-4 w-4" />
            <span>Fill in the company details below</span>
          </div>
          <CompanyForm mode="create" />
        </div>
      </div>
    </div>
  );
}
