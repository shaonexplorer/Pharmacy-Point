'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCompanies, useDeleteCompany } from '@/hooks/useCompanies';
import { CompanyTable } from '@/components/companies/CompanyTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Plus, Store, AlertCircle, Search, X } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/common';

/* ───────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Companies Management Page
 *
 * Design spec (DESIGN.md → Brand & Style):
 *  - The visual style follows a Corporate / Modern approach with Minimalism.
 *    Expansive whitespace in light mode and deep structured layers in dark mode.
 *  - Functional color and purposeful geometry guide the pharmacist's workflow.
 *
 * Signature element: prescription-border-l (4px Pharma Teal left accent)
 * on the page header reinforces the clinical identity — like the colored
 * bar on a prescription label.
 * ────────────────────────────────────────────────────────────────────────── */

export default function CompaniesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: response,
    isLoading,
    error,
  } = useCompanies({ page: currentPage, search: searchQuery || undefined });

  const deleteCompanyMutation = useDeleteCompany();

  const companies = response?.data ?? [];
  const totalItems = response?.pagination.total ?? 0;
  const totalPages = response?.pagination.totalPages ?? 1;

  const handleDeleteClick = (company: { id: string; name: string }) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
        {/* ── Page Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <h1 className="text-headline-lg text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              Companies
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Manage your pharmacy company profiles and supplier relationships.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop sidebar toggle */}
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild>
              <Link href="/companies/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-4"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* ── Delete Mutation Error ── */}
        {deleteCompanyMutation.isError && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">
                {deleteCompanyMutation.error?.message || 'Failed to delete company'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Error State ── */}
        {!isLoading && error && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">
                {error instanceof Error ? error.message : 'Failed to load companies'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Loading State ── */}
        {isLoading && (
          <div className="flex min-h-75 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !error && companies.length === 0 && (
          <Card className="border-border bg-card card-elevated border-dashed">
            <CardContent className="flex min-h-75 flex-col items-center justify-center text-center px-8">
              <Store className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-headline-md text-foreground">No companies found</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">
                {searchQuery
                  ? 'No companies match your search. Try adjusting your query.'
                  : 'Get started by adding your first company.'}
              </p>
              {!searchQuery && (
                <Button asChild className="mt-4">
                  <Link href="/companies/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Company
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Company Table ── */}
        {!isLoading && !error && companies.length > 0 && (
          <CompanyTable
            companies={companies}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onDelete={handleDeleteClick}
          />
        )}

        {/* ── Delete Confirmation Dialog ── */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Company"
          description={
            companyToDelete
              ? `Are you sure you want to delete "${companyToDelete.name}"? This action cannot be undone.`
              : ''
          }
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={deleteCompanyMutation.isPending}
        />
      </div>
    </div>
  );
}
