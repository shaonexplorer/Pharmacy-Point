import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { productKeys } from '@/hooks/useProducts';
import { inventoryKeys } from '@/hooks/useInventory';
import type {
  Order,
  OrderWithItems,
  CreateOrderInput,
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
  return useQuery<PaginatedResponse<Order>>({
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
    onSuccess: () => {
      // A sale decrements stock and creates STOCK_OUT transactions,
      // so refresh inventory, transactions, product lists, and stats
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
