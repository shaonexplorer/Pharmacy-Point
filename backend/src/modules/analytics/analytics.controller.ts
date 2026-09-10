/**
 * Analytics controller — HTTP request handlers.
 * Delegates business logic to analyticsService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { analyticsDashboardSchema } from './analytics.dto';
import * as analyticsService from './analytics.service';

/**
 * GET /api/analytics/dashboard
 * Get comprehensive analytics dashboard data with optional period filter.
 */
export const getAnalyticsDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const period = (req.query.period as string) ?? 'month';
    const days = parseInt(req.query.days as string) ?? 30;

    const data = await analyticsService.getAnalyticsDashboard(period, days);
    res.json(data);
  }
);

/**
 * GET /api/analytics/revenue-trends
 * Get revenue trend data for charting.
 */
export const getRevenueTrends = asyncHandler(async (_req: Request, res: Response) => {
  const period = (_req.query.period as string) ?? 'month';
  const days = parseInt(_req.query.days as string) ?? 30;

  const trends = await analyticsService.getRevenueTrends(period, days);
  res.json(trends);
});

/**
 * GET /api/analytics/sales-by-category
 * Get sales breakdown by category.
 */
export const getSalesByCategory = asyncHandler(async (_req: Request, res: Response) => {
  const days = parseInt(_req.query.days as string) ?? 30;

  const data = await analyticsService.getSalesByCategory(days);
  res.json(data);
});

/**
 * GET /api/analytics/inventory-status
 * Get inventory status summary for dashboard charts.
 */
export const getInventoryStatus = asyncHandler(async (_req: Request, res: Response) => {
  const status = await analyticsService.getInventoryStatus();
  res.json(status);
});

/**
 * GET /api/analytics/top-products
 * Get top products by revenue.
 */
export const getTopProducts = asyncHandler(async (_req: Request, res: Response) => {
  const days = parseInt(_req.query.days as string) ?? 30;
  const limit = parseInt(_req.query.limit as string) ?? 5;

  const products = await analyticsService.getTopProducts(days, limit);
  res.json(products);
});
