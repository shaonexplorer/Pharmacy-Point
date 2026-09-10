/**
 * Reports controller — HTTP request handlers.
 * Delegates business logic to reportsService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { salesReportSchema, salesSummarySchema, inventoryReportSchema, customerReportSchema, financialReportSchema } from './reports.dto';
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

/**
 * GET /api/reports/inventory
 * Get comprehensive inventory report with stock levels, low stock,
 * slow-moving items, and expiry warnings.
 * Query params: slowMovingDays, expiryDays, limit
 */
export const getInventoryReport = asyncHandler(async (req: Request, res: Response) => {
  const slowMovingDays = parseInt(req.query.slowMovingDays as string) ?? 30;
  const expiryDays = parseInt(req.query.expiryDays as string) ?? 30;
  const limit = parseInt(req.query.limit as string) ?? 100;

  const result = await reportsService.getInventoryReport({ slowMovingDays, expiryDays, limit });
  res.json(result);
});

/**
 * GET /api/reports/customers
 * Get comprehensive customer report with segmentation,
 * loyalty analytics, and due account metrics.
 * Query params: tier, activeDays, hasDueAccounts, page, limit
 */
export const getCustomerReport = asyncHandler(async (req: Request, res: Response) => {
  const tier = req.query.tier as 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | undefined;
  const activeDays = parseInt(req.query.activeDays as string) || undefined;
  const hasDueAccounts = req.query.hasDueAccounts === 'true' ? true : req.query.hasDueAccounts === 'false' ? false : undefined;
  const page = parseInt(req.query.page as string) ?? 1;
  const limit = parseInt(req.query.limit as string) ?? 50;

  const result = await reportsService.getCustomerReport({ tier, activeDays, hasDueAccounts, page, limit });
  res.json(result);
});

/**
 * GET /api/reports/financial
 * Get financial report with profit/loss metrics.
 * Query params: startDate, endDate, paymentMethod, status, groupBy, page, limit
 */
export const getFinancialReport = asyncHandler(async (req: Request, res: Response) => {
  const input = req.query as Record<string, string | undefined>;

  const result = await reportsService.getFinancialReport({
    groupBy: input.groupBy as any ?? 'month',
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
 * GET /api/reports/collection
 * Get comprehensive collection status report with aging buckets.
 * Query params: page, limit, overdueDays
 */
export const getCollectionReport = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) ?? 1;
  const limit = parseInt(req.query.limit as string) ?? 50;
  const overdueDays = req.query.overdueDays ? parseInt(req.query.overdueDays as string) : undefined;

  const result = await reportsService.getCollectionReport({ page, limit, overdueDays });
  res.json(result);
});
