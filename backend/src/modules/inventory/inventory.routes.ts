/**
 * Inventory routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { stockInSchema, stockOutSchema, stockAdjustSchema } from './inventory.dto';
import { list, listTransactions, stockIn, stockOut, adjust, batches, expiring, expired, exportInventory, exportExpiring } from './inventory.controller';

const router = Router();

router.get('/', list);
router.get('/expiring', expiring);
router.get('/expired', expired);
router.get('/transactions', listTransactions);
router.get('/export', exportInventory);
router.get('/expiring/export', exportExpiring);
router.post('/stock-in', validate(stockInSchema), stockIn);
router.post('/stock-out', validate(stockOutSchema), stockOut);
router.get('/:productId/batches', batches);
router.patch('/:productId/adjust', validate(stockAdjustSchema), adjust);

export const inventoryRouter = router;
