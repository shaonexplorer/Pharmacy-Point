/**
 * Customer routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { customerCreateSchema, customerUpdateSchema } from './customer.dto';
import { list, getOne, create, update, remove } from './customer.controller';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', validate(customerCreateSchema), create);
router.put('/:id', validate(customerUpdateSchema), update);
router.delete('/:id', remove);

export const customerRouter = router;
