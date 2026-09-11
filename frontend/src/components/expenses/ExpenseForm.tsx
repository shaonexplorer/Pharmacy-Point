'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { z } from 'zod';
import { Expense } from '@pharmacy-point/types';
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/components/expenses/ExpenseCategoryBadge';

/* ──────────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Expense Form
 *
 * Design spec (DESIGN.md):
 *  - grid grid-cols-1 gap-6 md:grid-cols-2 — two-column on desktop
 *  - data-mono for numerical inputs (amount)
 *  - error states use error/30 border and error/10 background
 *  - Form actions: Cancel link + Submit button with loading state
 * ──────────────────────────────────────────────────────────────────────────── */

// Zod schema — mirrors backend expenseCreateSchema
const expenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be a positive number'),
  category: z.enum(
    EXPENSE_CATEGORIES as unknown as readonly [string, ...string[]],
    {
      errorMap: () => ({ message: 'Please select a valid category' }),
    }
  ),
  description: z.string().optional(),
  expenseDate: z.string().optional(),
  vendor: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer']).optional().default('cash'),
  receiptImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof expenseSchema>;

// Human-readable labels for the category dropdown
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

interface ExpenseFormProps {
  expense?: Expense | null;
  mode: 'create' | 'edit';
}

export function ExpenseForm({ expense, mode }: ExpenseFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Default to today's date
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<FormData>({
    amount: 0,
    category: 'OTHER',
    description: '',
    expenseDate: today,
    vendor: '',
    paymentMethod: 'cash',
    receiptImage: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const apiError =
    createMutation.error?.message ||
    updateMutation.error?.message ||
    null;

  useEffect(() => {
    if (expense) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        amount: expense.amount,
        category: expense.category as FormData['category'],
        description: expense.description ?? '',
        expenseDate: expense.expenseDate
          ? (new Date(expense.expenseDate).toISOString().split('T')[0] ?? today)
          : today,
        vendor: expense.vendor ?? '',
        paymentMethod: (expense.paymentMethod as FormData['paymentMethod']) ?? 'cash',
        receiptImage: expense.receiptImage ?? '',
      });
    }
  }, [expense, today]);

  // Clear errors when starting a new mutation
  useEffect(() => {
    if (createMutation.isPending || updateMutation.isPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrors({});
    }
  }, [createMutation.isPending, updateMutation.isPending]);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    try {
      expenseSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      // Attach the current user as the recorder if authenticated
      const userId = session?.user?.id;
      const payload = userId ? { ...formData, userId } : formData;

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        router.push('/expenses');
        router.refresh();
      } else if (mode === 'edit' && expense) {
        await updateMutation.mutateAsync({ id: expense.id, data: payload });
        router.push(`/expenses/${expense.id}`);
        router.refresh();
      }
    } catch {
      // Error is surfaced via mutation error state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(apiError || Object.keys(errors).length > 0) && (
        <div className="rounded-lg border border-error bg-error/5 p-4 card-elevated">
          <div className="flex items-center gap-2 text-error">
            <X className="h-4 w-4" />
            <div className="space-y-1">
              {apiError && <p className="text-body-md">{apiError}</p>}
              {Object.entries(errors).map(([field, message]) => (
                <p key={field} className="text-body-sm">
                  {field}: {message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-body-md text-foreground">
            Amount <span className="text-destructive">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            className={cn(
              'font-mono text-lg',
              'transition-all duration-200',
              errors.amount && 'border-error focus:ring-error/50'
            )}
          />
          {errors.amount && <p className="text-sm text-error">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-body-md text-foreground">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(val) => handleChange('category', val)}
          >
            <SelectTrigger
              id="category"
              className={cn(
                'transition-all duration-200 w-full',
                errors.category && 'border-error focus:ring-error/50'
              )}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-error">{errors.category}</p>}
        </div>

        {/* Expense Date */}
        <div className="space-y-2">
          <Label htmlFor="expenseDate" className="text-body-md text-foreground">
            Expense Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="expenseDate"
            type="date"
            value={formData.expenseDate ?? today}
            onChange={(e) => handleChange('expenseDate', e.target.value)}
            className={cn(
              'transition-all duration-200',
              errors.expenseDate && 'border-error focus:ring-error/50'
            )}
          />
          {errors.expenseDate && <p className="text-sm text-error">{errors.expenseDate}</p>}
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod" className="text-body-md text-foreground">
            Payment Method <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.paymentMethod ?? 'cash'}
            onValueChange={(val) => handleChange('paymentMethod', val)}
          >
            <SelectTrigger
              id="paymentMethod"
              className={cn(
                'transition-all duration-200 w-full',
                errors.paymentMethod && 'border-error focus:ring-error/50'
              )}
            >
              <SelectValue placeholder="Select a payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
          {errors.paymentMethod && <p className="text-sm text-error">{errors.paymentMethod}</p>}
        </div>

        {/* Vendor */}
        <div className="space-y-2">
          <Label htmlFor="vendor" className="text-body-md text-foreground">
            Vendor
          </Label>
          <Input
            id="vendor"
            type="text"
            placeholder="e.g., MedSupply Co."
            value={formData.vendor ?? ''}
            onChange={(e) => handleChange('vendor', e.target.value)}
            className={cn(
              'transition-all duration-200',
              errors.vendor && 'border-error focus:ring-error/50'
            )}
          />
          {errors.vendor && <p className="text-sm text-error">{errors.vendor}</p>}
        </div>

        {/* Receipt Image URL */}
        <div className="space-y-2">
          <Label htmlFor="receiptImage" className="text-body-md text-foreground">
            Receipt Image URL
          </Label>
          <Input
            id="receiptImage"
            type="url"
            placeholder="https://example.com/receipt.png"
            value={formData.receiptImage ?? ''}
            onChange={(e) => handleChange('receiptImage', e.target.value)}
            className={cn(
              'transition-all duration-200',
              errors.receiptImage && 'border-error focus:ring-error/50'
            )}
          />
          {errors.receiptImage && <p className="text-sm text-error">{errors.receiptImage}</p>}
        </div>

        {/* Description (full width) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description" className="text-body-md text-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Enter expense description..."
            value={formData.description ?? ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className={cn(
              'transition-all duration-200',
              errors.description && 'border-error focus:ring-error/50'
            )}
            rows={3}
          />
          {errors.description && <p className="text-sm text-error">{errors.description}</p>}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href={mode === 'edit' && expense ? `/expenses/${expense.id}` : '/expenses'}>
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>
        <Button type="submit" disabled={isSubmitting} variant="default">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1 h-4 w-4" />
              {mode === 'create' ? 'Record Expense' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
