import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseListParams,
  PaginatedResponse,
  ApiResponse,
} from '@pharmacy-point/types';

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params?: ExpenseListParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: () => [...expenseKeys.all, 'stats'] as const,
};

/**
 * Fetch a paginated list of expenses.
 * Supports search by vendor/description/category, category and paymentMethod filters,
 * and date range filtering on expenseDate.
 */
export function useExpenses(params?: ExpenseListParams) {
  return useQuery<PaginatedResponse<Expense>>({
    queryKey: expenseKeys.list(params),
    queryFn: () => api.expenses.list(params),
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single expense by ID.
 */
export function useExpense(id: string) {
  return useQuery<ApiResponse<Expense>>({
    queryKey: expenseKeys.detail(id),
    queryFn: () => api.expenses.get(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch aggregated expense statistics.
 */
export function useExpenseStats() {
  return useQuery<ApiResponse<{
    totalExpenses: number;
    totalThisMonth: number;
    totalThisYear: number;
    byCategory: Record<string, number>;
    byPaymentMethod: Record<string, number>;
  }>>({
    queryKey: expenseKeys.stats(),
    queryFn: () => api.expenses.stats(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Create a new expense.
 * Invalidates expense lists, detail queries, stats, and the global dashboard stats.
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => api.expenses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

/**
 * Update an existing expense.
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      api.expenses.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

/**
 * Delete an expense.
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.expenses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
