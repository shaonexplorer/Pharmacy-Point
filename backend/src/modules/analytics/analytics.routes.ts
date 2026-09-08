/**
 * Analytics routes — thin URL-to-controller mapping.
 */
import { Router } from 'express';
import {
  getAnalyticsDashboard,
  getRevenueTrends,
  getSalesByCategory,
  getInventoryStatus,
  getTopProducts,
} from './analytics.controller';
import { validate } from '../../middleware/validate';
import { analyticsDashboardSchema } from './analytics.dto';

const router = Router();

router.get('/analytics/dashboard', validate(analyticsDashboardSchema, 'query'), getAnalyticsDashboard);
router.get('/analytics/revenue-trends', validate(analyticsDashboardSchema, 'query'), getRevenueTrends);
router.get('/analytics/sales-by-category', getSalesByCategory);
router.get('/analytics/inventory-status', getInventoryStatus);
router.get('/analytics/top-products', getTopProducts);

export const analyticsRouter = router;
