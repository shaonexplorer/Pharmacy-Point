/**
 * Order routes — thin URL-to-controller mapping.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { orderCreateSchema, orderStatusUpdateSchema, refundSchema, returnSchema } from './order.dto';
import { receiptEmailSchema } from './receipt.dto';
import { list, getOne, create, updateStatus, refund, returnOrder, getReturnsCtrl, sendReceiptEmail, getReceiptHTML } from './order.controller';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', validate(orderCreateSchema), create);
router.patch('/:id/status', validate(orderStatusUpdateSchema), updateStatus);
router.post('/:id/refund', validate(refundSchema), refund);
router.post('/:id/return', validate(returnSchema), returnOrder);
router.get('/:id/returns', getReturnsCtrl);
router.post('/:id/receipt/email', validate(receiptEmailSchema), sendReceiptEmail);
router.get('/:id/receipt', getReceiptHTML);

export const orderRouter = router;
