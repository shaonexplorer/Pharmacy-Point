/**
 * Reports routes — thin URL-to-controller mapping.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { salesReportSchema, salesSummarySchema } from './reports.dto';
import { getSalesReport, getSalesSummary, getSalesByPaymentMethod } from './reports.controller';

const router = Router();

router.get('/sales', validate(salesReportSchema, 'query'), getSalesReport);
router.get('/sales/summary', validate(salesSummarySchema, 'query'), getSalesSummary);
router.get('/sales/payment-methods', getSalesByPaymentMethod);

export const reportsRouter = router;
