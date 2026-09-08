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
