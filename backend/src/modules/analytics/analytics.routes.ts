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

router.get('/dashboard', validate(analyticsDashboardSchema, 'query'), getAnalyticsDashboard);
router.get('/revenue-trends', validate(analyticsDashboardSchema, 'query'), getRevenueTrends);
router.get('/sales-by-category', getSalesByCategory);
router.get('/inventory-status', getInventoryStatus);
router.get('/top-products', getTopProducts);

export const analyticsRouter = router;
