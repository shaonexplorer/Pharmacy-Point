import { z } from 'zod';

/**
 * DTOs for Expense endpoints.
 * Expense categories are validated as a fixed enum to ensure consistency
 * while keeping the Prisma model field as a string for flexibility.
 */

/**
 * Standard pharmacy expense categories.
 * Used in the DTO enum and frontend form dropdown.
 */
export const expenseCategories = [
  'INVENTORY_PURCHASE',
  'UTILITIES',
  'RENT',
  'SALARIES',
  'MARKETING',
  'SUPPLIES',
  'INSURANCE',
  'MAINTENANCE',
  'TAXES',
  'OTHER',
] as const;

export const expenseCreateSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be a positive number'),
  category: z.enum(expenseCategories, {
    errorMap: () => ({ message: 'Please select a valid expense category' }),
  }),
  description: z.string().optional(),
  expenseDate: z
    .string()
    .optional()
    .default(() => new Date().toISOString()),
  vendor: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer']).optional().default('cash'),
  receiptImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  userId: z.string().optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export type CreateExpenseInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;

export const expenseListSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ExpenseListParams = z.infer<typeof expenseListSchema>;
