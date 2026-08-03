'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, AlertCircle, Search, User } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/common';
import type { Customer } from '@pharmacy-point/types';

export default function CustomersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: response,
    isLoading,
    error,
  } = useCustomers({ page: currentPage, search: searchQuery || undefined });

  const deleteCustomerMutation = useDeleteCustomer();

  const customers = response?.data ?? [];
  const totalItems = response?.pagination.total ?? 0;
  const totalPages = response?.pagination.totalPages ?? 1;

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteCustomerMutation.mutateAsync(customerToDelete.id);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Customers
            </h1>
            <p className="text-muted-foreground">Manage your customer records and profiles</p>
          </div>
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/5 p-4 mb-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error instanceof Error ? error.message : 'Failed to load customers'}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex min-h-75 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && customers.length === 0 && (
          <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
            <User className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No customers found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Get started by adding your first customer.'}
            </p>
            {!searchQuery && (
              <Button asChild className="mt-4">
                <Link href="/customers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Customer Table */}
        {!isLoading && !error && customers.length > 0 && (
          <CustomerTable
            customers={customers}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Customer"
          description={
            customerToDelete
              ? `Are you sure you want to delete "${customerToDelete.name}"? This action cannot be undone.`
              : ''
          }
          confirmText="Delete"
          onConfirm={handleConfirmDelete}
          loading={deleteCustomerMutation.isPending}
        />
      </div>
    </div>
  );
}
