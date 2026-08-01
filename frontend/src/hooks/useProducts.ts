import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, PaginatedResponse, UpdateProductInput } from '@pharmacy-point/types';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  companyId?: string;
}

/**
 * Fetch a paginated list of products.
 */
export function useProducts(params?: ProductListParams) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: productKeys.list(params),
    queryFn: () => api.products.list(params),

    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch a single product by ID.
 */
export function useProduct(id: string) {
  return useQuery<Product | null>({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await api.products.get(id);
      return response.data ?? null;
    },
    enabled: !!id,
  });
}

/**
 * Create a new product.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.products.create>[0]) => api.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Update an existing product.
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      api.products.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Delete (soft delete) a product.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
