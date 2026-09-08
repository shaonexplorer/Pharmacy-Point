/**
 * Reports routes — thin URL-to-controller mapping.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { salesReportSchema, salesSummarySchema, inventoryReportSchema, customerReportSchema } from './reports.dto';
import { getSalesReport, getSalesSummary, getSalesByPaymentMethod, getInventoryReport, getCustomerReport } from './reports.controller';

const router = Router();

router.get('/sales', validate(salesReportSchema, 'query'), getSalesReport);
router.get('/sales/summary', validate(salesSummarySchema, 'query'), getSalesSummary);
router.get('/sales/payment-methods', getSalesByPaymentMethod);
router.get('/inventory', validate(inventoryReportSchema, 'query'), getInventoryReport);
router.get('/customers', validate(customerReportSchema, 'query'), getCustomerReport);

export const reportsRouter = router;
