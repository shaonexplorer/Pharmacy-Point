/**
 * Category routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { categoryCreateSchema } from './category.dto';
import { list, create } from './category.controller';

const router = Router();

router.get('/', list);
router.post('/', validate(categoryCreateSchema), create);

export const categoryRouter = router;
