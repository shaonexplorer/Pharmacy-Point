import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Customer,
  CustomerWithOrders,
  ApiResponse,
  DuePaymentWithCustomer,
  CreateDuePaymentInput,
  CustomerDashboard,
  PaginatedResponse,
} from '@pharmacy-point/types';

// Query keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  payments: (customerId: string) => [...customerKeys.detail(customerId), 'payments'] as const,
  dueAccounts: () => [...customerKeys.all, 'due-accounts'] as const,
  dashboard: (customerId: string) => [...customerKeys.detail(customerId), 'dashboard'] as const,
  loyaltyTiers: () => [...customerKeys.all, 'loyalty-tiers'] as const,
};

/**
 * Fetch all customers (with pagination).
 */
export function useCustomers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: [...customerKeys.lists(), params],
    queryFn: () => api.customers.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData, // keep previous page data visible during transitions
  });
}

/**
 * Fetch a single customer by ID.
 */
export function useCustomer(id: string) {
  return useQuery<ApiResponse<CustomerWithOrders>>({
    queryKey: customerKeys.detail(id),
    queryFn: () => api.customers.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new customer.
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
    }) => api.customers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

/**
 * Update an existing customer.
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => api.customers.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

/**
 * Delete a customer.
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

/**
 * Fetch due payment history for a customer.
 */
export function useDuePayments(customerId: string) {
  return useQuery<PaginatedResponse<DuePaymentWithCustomer>>({
    queryKey: customerKeys.payments(customerId),
    queryFn: () => api.customers.duePayments.list(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Record a due payment for a customer.
 */
export function useRecordDuePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: CreateDuePaymentInput }) =>
      api.customers.duePayments.create(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.payments(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.dueAccounts() });
      queryClient.invalidateQueries({ queryKey: customerKeys.dashboard(variables.customerId) });
    },
  });
}

/**
 * Fetch all customers with outstanding due balances.
 */
export function useDueAccounts(params?: { page?: number; limit?: number; overdueDays?: number }) {
  return useQuery<PaginatedResponse<Customer>>({
    queryKey: [...customerKeys.dueAccounts(), params],
    queryFn: () => api.customers.dueAccounts(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a customer dashboard (aggregated orders, payments, loyalty data).
 */
export function useCustomerDashboard(customerId: string) {
  return useQuery<ApiResponse<CustomerDashboard>>({
    queryKey: customerKeys.dashboard(customerId),
    queryFn: () => api.customers.dashboard(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch loyalty tier definitions.
 */
export function useLoyaltyTiers() {
  return useQuery<
    ApiResponse<{ tier: string; minSpend: number; maxSpend: number | null; benefits: string }[]>
  >({
    queryKey: customerKeys.loyaltyTiers(),
    queryFn: () => api.customers.loyalty.tiers(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Adjust a customer's loyalty points (admin).
 */
export function useAdjustLoyaltyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      amount,
      notes,
    }: {
      customerId: string;
      amount: number;
      notes?: string;
    }) => api.customers.loyalty.adjustPoints(customerId, { amount, notes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.dashboard(variables.customerId) });
    },
  });
}
