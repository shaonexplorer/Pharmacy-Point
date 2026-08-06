import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StockInInput, StockOutInput, StockAdjustInput } from '@pharmacy-point/types';

export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  lowStock?: boolean;
  companyId?: string;
}

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: InventoryListParams) => [...inventoryKeys.lists(), params] as const,
  transactions: () => [...inventoryKeys.all, 'transactions'] as const,
  transactionList: (params?: {
    page?: number;
    limit?: number;
    productId?: string;
    type?: string;
  }) => [...inventoryKeys.transactions(), params] as const,
};

/**
 * Fetch a paginated list of inventory items.
 */
export function useInventory(params?: InventoryListParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => api.inventory.list(params),
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: keepPreviousData, // keep previous page data visible during transitions
  });
}

/**
 * Fetch inventory transaction history.
 */
export function useInventoryTransactions(params?: {
  page?: number;
  limit?: number;
  productId?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: inventoryKeys.transactionList(params),
    queryFn: () => api.inventory.transactions(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Record stock in (purchase receipt).
 */
export function useStockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockInInput) => api.inventory.stockIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
    },
  });
}

/**
 * Record stock out (sale).
 */
export function useStockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockOutInput) => api.inventory.stockOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
    },
  });
}

/**
 * Manual stock adjustment.
 */
export function useStockAdjust() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: StockAdjustInput }) =>
      api.inventory.adjust(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
    },
  });
}
