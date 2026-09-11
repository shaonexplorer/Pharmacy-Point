import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { productKeys } from '@/hooks/useProducts';
import { inventoryKeys } from '@/hooks/useInventory';
import { customerKeys } from '@/hooks/useCustomers';
import type {
  OrderWithItems,
  OrderItemWithProduct,
  CreateOrderInput,
  RefundInput,
  RefundResult,
  ReturnInput,
  ReturnResult,
  PaginatedResponse,
  ApiResponse,
} from '@pharmacy-point/types';

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  staffId?: string;
}

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

/**
 * Fetch a paginated list of orders.
 */
export function useOrders(params?: OrderListParams) {
  return useQuery<PaginatedResponse<OrderWithItems>>({
    queryKey: orderKeys.list(params),
    queryFn: () => api.orders.list(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch a single order by ID with items and product details.
 */
export function useOrder(id: string) {
  return useQuery<ApiResponse<OrderWithItems>>({
    queryKey: orderKeys.detail(id),
    queryFn: () => api.orders.get(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Create a new order.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => api.orders.create(data),
    onSuccess: (_data, variables) => {
      // A sale decrements stock and creates STOCK_OUT transactions,
      // so refresh inventory, transactions, product lists, and stats.
      // Also refresh customer data — credit sales increment dueAmount.
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.dueAccounts() });
      // Invalidate individual customer detail if a customer was linked to the order
      if (variables.customerId) {
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) });
        queryClient.invalidateQueries({ queryKey: customerKeys.dashboard(variables.customerId) });
      }
    },
  });
}

/**
 * Refund an order (full or partial).
 * Invalidates order detail, order lists, customer due accounts, and stats
 * so the UI reflects the refunded amount and updated customer balances.
 */
export function useRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { orderId: string; data: RefundInput }) =>
      api.orders.refund(params.orderId, params.data),
    onSuccess: (_data, variables) => {
      // Invalidate the affected order detail and list queries
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Credit-sale refunds decrement customer dueAmount
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.dueAccounts() });
    },
  });
}

/**
 * Process a return for an order (restocks inventory).
 * Invalidates order detail, order lists, and inventory queries
 * so stock levels reflect the returned items.
 */
export function useReturnOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { orderId: string; data: ReturnInput }) =>
      api.orders.returnOrder(params.orderId, params.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
    },
  });
}

/**
 * Fetch return history for an order.
 */
export function useReturns(orderId: string) {
  return useQuery<ApiResponse<{ orderId: string; returnedItems: OrderItemWithProduct[] }>>({
    queryKey: [...orderKeys.detail(orderId), 'returns'],
    queryFn: () => api.orders.getReturns(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });
}

export type { RefundInput, RefundResult, ReturnInput, ReturnResult };
