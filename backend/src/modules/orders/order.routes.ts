/**
 * Order routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { orderCreateSchema, orderStatusUpdateSchema } from './order.dto';
import { list, getOne, create, updateStatus } from './order.controller';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', validate(orderCreateSchema), create);
router.patch('/:id/status', validate(orderStatusUpdateSchema), updateStatus);

export const orderRouter = router;
