/**
 * Analytics DTO — Zod validation schemas for analytics endpoints.
 */
import { z } from 'zod';

export const analyticsDashboardSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter']).optional().default('month'),
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

export type AnalyticsDashboardInput = z.infer<typeof analyticsDashboardSchema>;
