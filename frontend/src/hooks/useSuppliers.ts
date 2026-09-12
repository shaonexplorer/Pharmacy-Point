import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Supplier,
  SupplierRepresentative,
  CreateSupplierInput,
  CreateSupplierRepresentativeInput,
  ApiResponse,
  PaginatedResponse,
} from '@pharmacy-point/types';

// Query keys
export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
  representatives: (supplierId: string) =>
    [...supplierKeys.detail(supplierId), 'representatives'] as const,
};

/**
 * Fetch all suppliers (with pagination and optional search).
 */
export function useSuppliers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...supplierKeys.lists(), params],
    queryFn: () => api.suppliers.list(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single supplier by ID (includes representatives and recent POs).
 */
export function useSupplier(id: string) {
  return useQuery<ApiResponse<Supplier>>({
    queryKey: supplierKeys.detail(id),
    queryFn: () => api.suppliers.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch representatives for a supplier.
 */
export function useSupplierRepresentatives(supplierId: string) {
  return useQuery<ApiResponse<SupplierRepresentative[]>>({
    queryKey: supplierKeys.representatives(supplierId),
    queryFn: () => api.suppliers.representatives.list(supplierId),
    enabled: !!supplierId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create a new supplier (optionally with nested representatives).
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierInput) => api.suppliers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

/**
 * Update an existing supplier.
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateSupplierInput }) =>
      api.suppliers.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

/**
 * Delete a supplier.
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.suppliers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

/* ─── Representative Mutations ───────────────────────────────────── */

/**
 * Create a new representative for a supplier.
 */
export function useCreateRepresentative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      supplierId,
      data,
    }: {
      supplierId: string;
      data: CreateSupplierRepresentativeInput;
    }) => api.suppliers.representatives.create(supplierId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.representatives(variables.supplierId),
      });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.supplierId) });
    },
  });
}

/**
 * Update an existing representative.
 */
export function useUpdateRepresentative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      supplierId,
      repId,
      data,
    }: {
      supplierId: string;
      repId: string;
      data: CreateSupplierRepresentativeInput;
    }) => api.suppliers.representatives.update(supplierId, repId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.representatives(variables.supplierId),
      });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.supplierId) });
    },
  });
}

/**
 * Delete a representative.
 */
export function useDeleteRepresentative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierId, repId }: { supplierId: string; repId: string }) =>
      api.suppliers.representatives.delete(supplierId, repId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.representatives(variables.supplierId),
      });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.supplierId) });
    },
  });
}
