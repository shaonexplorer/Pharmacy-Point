'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Fetch analytics dashboard data.
 */
export function useAnalytics(params?: { period?: string; days?: number }) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: () => api.analytics.dashboard(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch revenue trends data.
 */
export function useRevenueTrends(params?: { period?: string; days?: number }) {
  return useQuery({
    queryKey: ['analytics', 'revenue-trends', params],
    queryFn: () => api.analytics.revenueTrends(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch sales by category data.
 */
export function useSalesByCategory(params?: { days?: number }) {
  return useQuery({
    queryKey: ['analytics', 'sales-by-category', params],
    queryFn: () => api.analytics.salesByCategory(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch inventory status data.
 */
export function useInventoryAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'inventory-status'],
    queryFn: () => api.analytics.inventoryStatus(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch top products data.
 */
export function useTopProducts(params?: { days?: number; limit?: number }) {
  return useQuery({
    queryKey: ['analytics', 'top-products', params],
    queryFn: () => api.analytics.topProducts(params),
    staleTime: 5 * 60 * 1000,
  });
}
