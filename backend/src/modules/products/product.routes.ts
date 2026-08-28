/**
 * Product routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { productCreateSchema, productUpdateSchema } from './product.dto';
import { list, getOne, create, update, remove } from './product.controller';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', validate(productCreateSchema), create);
router.put('/:id', validate(productUpdateSchema), update);
router.delete('/:id', remove);

export const productRouter = router;
