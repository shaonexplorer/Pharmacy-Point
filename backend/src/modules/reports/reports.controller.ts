/**
 * Reports controller — HTTP request handlers.
 * Delegates business logic to reportsService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { salesReportSchema, salesSummarySchema } from './reports.dto';
import * as reportsService from './reports.service';

/**
 * GET /api/reports/sales
 * Get sales report data with flexible grouping and filtering.
 * Query params: startDate, endDate, productId, category, paymentMethod, status, groupBy, page, limit
 */
export const getSalesReport = asyncHandler(async (req: Request, res: Response) => {
  const input = req.query as Record<string, string | undefined>;

  const result = await reportsService.getSalesReport({
    groupBy: input.groupBy as any ?? 'day',
    productId: input.productId,
    category: input.category,
    paymentMethod: input.paymentMethod as any,
    status: input.status as any,
    startDate: input.startDate,
    endDate: input.endDate,
    page: parseInt(input.page ?? '1'),
    limit: parseInt(input.limit ?? '50'),
  });

  res.json(result);
});

/**
 * GET /api/reports/sales/summary
 * Get sales summary metrics for a time period.
 * Query params: period, days
 */
export const getSalesSummary = asyncHandler(async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? 'month';
  const days = parseInt(req.query.days as string) ?? 30;

  const summary = await reportsService.getSalesSummary(period, days);
  res.json(summary);
});

/**
 * GET /api/reports/sales/payment-methods
 * Get sales breakdown by payment method for a date range.
 * Query params: startDate, endDate
 */
export const getSalesByPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const startDate = (req.query.startDate as string) ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = (req.query.endDate as string) ?? new Date().toISOString();

  const data = await reportsService.getSalesByPaymentMethod(startDate, endDate);
  res.json(data);
});
