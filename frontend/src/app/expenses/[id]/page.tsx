'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { ExpenseCategoryBadge } from '@/components/expenses/ExpenseCategoryBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  PiggyBank,
  User,
  Banknote,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ConfirmDialog } from '@/components/common';
import type { Expense } from '@pharmacy-point/types';

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Expense Detail Page
 *
 * Layout follows the same pattern as CompanyDetailPage:
 *  - flex-1 inside SidebarInset (not container-max)
 *  - prescription-border-l signature element on the header
 *  - Clinical Precision error colors (error/30, error/10)
 *  - data-mono for numerical data (amount)
 * ──────────────────────────────────────────────────────────────────────────── */

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: authPending } = useSession();

  const { data: response, isLoading, error } = useExpense(id);
  const deleteExpenseMutation = useDeleteExpense();

  const expense = response?.data;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    if (!expense) return;

    try {
      await deleteExpenseMutation.mutateAsync(expense.id);
      router.replace('/expenses');
    } catch {
      // Error handled by mutation
    }
  };

  const errorMessage = error instanceof Error ? error.message : 'Failed to load expense';

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
              <FileText className="h-5 w-5 text-error shrink-0" />
              <p className="text-body-md text-error">{errorMessage}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full space-y-6">
          <Card className="border-border bg-card card-elevated">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <PiggyBank className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-body-md text-on-surface-variant">Expense not found.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/expenses">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Expenses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const paymentVariant =
    expense.paymentMethod === 'card'
      ? 'secondary'
      : expense.paymentMethod === 'bank_transfer'
        ? 'outline'
        : 'default';

  return (
    <div className="flex-1 p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="w-full space-y-6">
        {/* ── Header (signature: prescription-border-l accent) ── */}
        <div className="flex items-start justify-between">
          <div className="prescription-border-l pl-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/expenses">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-headline-lg text-foreground">Expense Details</h1>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Expense #{expense.id.slice(0, 8)} — {formatDate(expense.expenseDate)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Button asChild variant="outline" size="sm">
              <Link href={`/expenses/${expense.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructiveOutline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleteExpenseMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteExpenseMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* ── Expense Details ── */}
        <Card className="border-border bg-card card-elevated">
          <CardHeader>
            <CardTitle className="text-headline-md flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-warning" />
              Expense Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Amount + Category vitals */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md border border-border bg-surface-container-low/40 p-4">
                  <p className="text-label-md text-on-surface-variant mb-1">Amount</p>
                  <p className="text-headline-lg text-data-mono text-destructive">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
                <div className="rounded-md border border-border bg-surface-container-low/40 p-4">
                  <p className="text-label-md text-on-surface-variant mb-1">Category</p>
                  <div className="mt-1">
                    <ExpenseCategoryBadge category={expense.category} />
                  </div>
                </div>
                <div className="rounded-md border border-border bg-surface-container-low/40 p-4">
                  <p className="text-label-md text-on-surface-variant mb-1">Payment Method</p>
                  <div className="mt-1">
                    <Badge variant={paymentVariant} className="text-xs uppercase">
                      {expense.paymentMethod ?? 'cash'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Vendor + Expense Date */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border bg-surface-container-low/40 p-4">
                  <p className="text-label-md text-on-surface-variant mb-1">Vendor</p>
                  <p className="text-body-md text-foreground">{expense.vendor || '—'}</p>
                </div>
                <div className="rounded-md border border-border bg-surface-container-low/40 p-4">
                  <p className="text-label-md text-on-surface-variant mb-1">Expense Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-data-mono">
                      {formatDate(expense.expenseDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {expense.description && (
                <div className="rounded-md border border-border bg-surface-container-low/40 p-4">
                  <p className="text-label-md text-on-surface-variant mb-1">Description</p>
                  <p className="text-body-md text-foreground whitespace-pre-wrap">
                    {expense.description}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-border pt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  <User className="h-4 w-4" />
                  <span>
                    Recorded by: {expense.user?.name || expense.user?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(expense.createdAt)}</span>
                </div>
              </div>

              {/* Receipt Image */}
              {expense.receiptImage && (
                <div className="rounded-md border border-border bg-surface-container-low/40 p-4">
                  <p className="text-label-md text-on-surface-variant mb-2">Receipt Image</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={expense.receiptImage}
                    alt={`Receipt for expense #${expense.id.slice(0, 8)}`}
                    className="max-h-48 w-full max-w-sm rounded-lg border border-border object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Delete Confirmation Dialog ── */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Expense"
          description={`Are you sure you want to delete this expense of ${formatCurrency(expense.amount)}?`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={deleteExpenseMutation.isPending}
        />
      </div>
    </div>
  );
}
