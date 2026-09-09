'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  SalesReportItem,
  SalesSummaryData,
  SalesByPaymentMethod,
  InventoryReportResponse,
  CustomerReportResponse,
  FinancialReportResponse,
} from '@pharmacy-point/types';

/**
 * Fetch sales report data with grouping and filtering.
 * Includes staleTime of 5 minutes for React Query cache.
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
    // keepPreviousData: true, // Uncomment to show previous page data during pagination
  });
}

/**
 * Fetch sales summary metrics.
 * Includes staleTime of 5 minutes for React Query cache.
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
 * Includes staleTime of 5 minutes for React Query cache.
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

/**
 * Fetch comprehensive customer report.
 */
export function useCustomerReport(params?: {
  tier?: string;
  activeDays?: number;
  hasDueAccounts?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reports', 'customers', params],
    queryFn: () => api.reports.customers(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch financial report with profit/loss metrics.
 */
export function useFinancialReport(params?: {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  status?: string;
  groupBy?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reports', 'financial', params],
    queryFn: () => api.reports.financial(params),
    staleTime: 5 * 60 * 1000,
  });
}
