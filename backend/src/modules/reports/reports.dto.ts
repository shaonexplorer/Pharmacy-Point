/**
 * Reports DTO — Zod validation schemas for sales report endpoints.
 */
import { z } from 'zod';

/**
 * Schema for sales report query parameters.
 * Supports date range, product/category filters, and grouping options.
 */
export const salesReportSchema = z.object({
  // Date range
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // Filters
  productId: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'RETURNED']).optional(),
  // Grouping
  groupBy: z.enum(['day', 'week', 'month', 'category', 'paymentMethod']).optional().default('day'),
  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type SalesReportInput = z.infer<typeof salesReportSchema>;

/**
 * Schema for sales summary (aggregate metrics).
 */
export const salesSummarySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter']).optional().default('month'),
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

export type SalesSummaryInput = z.infer<typeof salesSummarySchema>;

/**
 * Schema for inventory report query parameters.
 */
export const inventoryReportSchema = z.object({
  // Date window for slow-moving detection (days)
  slowMovingDays: z.coerce.number().int().min(1).max(365).optional().default(30),
  // Days threshold for expiry warning
  expiryDays: z.coerce.number().int().min(1).max(365).optional().default(30),
  // Limit for slow-moving and expiring item lists
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
});

export type InventoryReportInput = z.infer<typeof inventoryReportSchema>;

/**
 * Schema for customer report query parameters.
 */
export const customerReportSchema = z.object({
  // Segment by spending tier
  tier: z.enum(['Bronze', 'Silver', 'Gold', 'Platinum']).optional(),
  // Filter by active status (has orders in last N days)
  activeDays: z.coerce.number().int().min(1).max(365).optional(),
  // Filter by due account status
  hasDueAccounts: z.boolean().optional(),
  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type CustomerReportInput = z.infer<typeof customerReportSchema>;

/**
 * Schema for financial report query parameters.
 */
export const financialReportSchema = z.object({
  // Date range
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // Filters
  paymentMethod: z.enum(['cash', 'card']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'RETURNED']).optional(),
  // Grouping
  groupBy: z.enum(['day', 'week', 'month']).optional().default('month'),
  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type FinancialReportInput = z.infer<typeof financialReportSchema>;

/* ─── Collection Report ────────────────────────────────── */

export const collectionReportSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  // Filter by overdue days (optional; returns all with due amounts if omitted)
  overdueDays: z.coerce.number().int().min(1).max(365).optional(),
});

export type CollectionReportInput = z.infer<typeof collectionReportSchema>;
