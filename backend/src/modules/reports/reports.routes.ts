/**
 * Reports routes — thin URL-to-controller mapping.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { salesReportSchema, salesSummarySchema, inventoryReportSchema } from './reports.dto';
import { getSalesReport, getSalesSummary, getSalesByPaymentMethod, getInventoryReport } from './reports.controller';

const router = Router();

router.get('/sales', validate(salesReportSchema, 'query'), getSalesReport);
router.get('/sales/summary', validate(salesSummarySchema, 'query'), getSalesSummary);
router.get('/sales/payment-methods', getSalesByPaymentMethod);
router.get('/inventory', validate(inventoryReportSchema, 'query'), getInventoryReport);

export const reportsRouter = router;
