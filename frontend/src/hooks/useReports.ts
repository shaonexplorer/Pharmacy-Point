'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  SalesReportItem,
  SalesSummaryData,
  SalesByPaymentMethod,
  InventoryReportResponse,
} from '@pharmacy-point/types';

/**
 * Fetch sales report data with grouping and filtering.
 */
export function useSalesReport(params?: {
  startDate?: string;
  endDate?: string;
  productId?: string;
  category?: string;
  paymentMethod?: string;
  status?: string;
  groupBy?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => api.reports.sales(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch sales summary metrics.
 */
export function useSalesSummary(params?: { period?: string; days?: number }) {
  return useQuery({
    queryKey: ['reports', 'sales-summary', params],
    queryFn: () => api.reports.salesSummary(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch sales breakdown by payment method.
 */
export function useSalesByPaymentMethod(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['reports', 'sales-payment-methods', params],
    queryFn: () => api.reports.salesByPaymentMethod(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch comprehensive inventory report.
 */
export function useInventoryReport(params?: {
  slowMovingDays?: number;
  expiryDays?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reports', 'inventory', params],
    queryFn: () => api.reports.inventory(params),
    staleTime: 5 * 60 * 1000,
  });
}
