import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  PurchaseOrder,
  PurchaseOrderWithItems,
  CreatePurchaseOrderInput,
} from '@pharmacy-point/types';

// Query keys
export const purchaseOrderKeys = {
  all: ['purchaseOrders'] as const,
  lists: () => [...purchaseOrderKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; status?: string; supplierId?: string }) =>
    [...purchaseOrderKeys.lists(), params] as const,
  details: () => [...purchaseOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
};

/**
 * Fetch a paginated list of purchase orders.
 */
export function usePurchaseOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  supplierId?: string;
}) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: () => api.purchaseOrders.list(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single purchase order by ID.
 */
export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => api.purchaseOrders.get(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Create a purchase order (from the procurement cart).
 * On success, invalidates PO lists and clears the cart.
 */
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderInput) => api.purchaseOrders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * Approve a purchase order.
 */
export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy?: string }) =>
      api.purchaseOrders.approve(id, approvedBy),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * Receive a purchase order (increments stock).
 */
export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.purchaseOrders.receive(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * Cancel a purchase order.
 */
export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.purchaseOrders.cancel(id, notes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}
