/**
 * Inventory routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { stockInSchema, stockOutSchema, stockAdjustSchema } from './inventory.dto';
import { list, listTransactions, stockIn, stockOut, adjust } from './inventory.controller';

const router = Router();

router.get('/', list);
router.get('/transactions', listTransactions);
router.post('/stock-in', validate(stockInSchema), stockIn);
router.post('/stock-out', validate(stockOutSchema), stockOut);
router.patch('/:productId/adjust', validate(stockAdjustSchema), adjust);

export const inventoryRouter = router;
