'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { ExpenseCategoryBadge, EXPENSE_CATEGORIES } from '@/components/expenses/ExpenseCategoryBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/common';
import { Loader2, Plus, PiggyBank, AlertCircle, Search, X } from 'lucide-react';
import Link from 'next/link';
import type { Expense } from '@pharmacy-point/types';

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Expenses Management Page
 *
 * Design spec (DESIGN.md → Brand & Style):
 *  - Corporate / Modern with Minimalism — expansive whitespace, functional color.
 *  - Signature element: prescription-border-l (4px Pharma Teal left accent)
 *    on the page header.
 *  - KPI cards for expense overview using Clinical Precision colors.
 *  - data-mono for numerical data (amounts).
 * ──────────────────────────────────────────────────────────────────────────── */

// Human-readable labels for the category filter dropdown
const CATEGORY_LABELS: Record<string, string> = {
  INVENTORY_PURCHASE: 'Inventory Purchase',
  UTILITIES: 'Utilities',
  RENT: 'Rent',
  SALARIES: 'Salaries',
  MARKETING: 'Marketing',
  SUPPLIES: 'Office Supplies',
  INSURANCE: 'Insurance',
  MAINTENANCE: 'Maintenance',
  TAXES: 'Taxes',
  OTHER: 'Other',
};

export default function ExpensesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: response,
    isLoading,
    error,
  } = useExpenses({
    page: currentPage,
    search: searchQuery || undefined,
    category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
    paymentMethod: paymentMethodFilter !== 'ALL' ? paymentMethodFilter : undefined,
  });

  const deleteExpenseMutation = useDeleteExpense();

  const expenses = response?.data ?? [];
  const totalItems = response?.pagination.total ?? 0;
  const totalPages = response?.pagination.totalPages ?? 1;

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpenseMutation.mutateAsync(expenseToDelete.id);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
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

  const handleFilterChange = () => {
    setCurrentPage(1);
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
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="w-full space-y-6">
        {/* ── Page Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <h1 className="text-headline-lg text-foreground flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-warning" />
              Expenses
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Track pharmacy operational expenses by category, vendor, and payment method.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop sidebar toggle */}
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild>
              <Link href="/expenses/new">
                <Plus className="mr-2 h-4 w-4" />
                Record Expense
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by vendor or description..."
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

          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={paymentMethodFilter}
            onValueChange={(val) => {
              setPaymentMethodFilter(val);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payment Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Delete Mutation Error ── */}
        {deleteExpenseMutation.isError && (
          <Card className="border-error/30 bg-error/10 card-elevated">
            <CardContent className="flex items-center gap-3 px-4">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">
                {deleteExpenseMutation.error?.message || 'Failed to delete expense'}
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
                {error instanceof Error ? error.message : 'Failed to load expenses'}
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
        {!isLoading && !error && expenses.length === 0 && (
          <Card className="border-border bg-card card-elevated border-dashed">
            <CardContent className="flex min-h-75 flex-col items-center justify-center text-center px-8">
              <PiggyBank className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-headline-md text-foreground">No expenses found</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">
                {searchQuery || categoryFilter !== 'ALL' || paymentMethodFilter !== 'ALL'
                  ? 'No expenses match your filters. Try adjusting your search.'
                  : 'Get started by recording your first expense.'}
              </p>
              {!searchQuery && categoryFilter === 'ALL' && paymentMethodFilter === 'ALL' && (
                <Button asChild className="mt-4">
                  <Link href="/expenses/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Record Expense
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Expense Table ── */}
        {!isLoading && !error && expenses.length > 0 && (
          <ExpenseTable
            expenses={expenses}
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
          title="Delete Expense"
          description={
            expenseToDelete
              ? `Are you sure you want to delete this expense of ${expenseToDelete.amount}?` +
                ' This action cannot be undone.'
              : ''
          }
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={deleteExpenseMutation.isPending}
        />
      </div>
    </div>
  );
}
