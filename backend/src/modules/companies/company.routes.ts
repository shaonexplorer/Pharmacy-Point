/**
 * Company routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { companyCreateSchema, companyUpdateSchema } from './company.dto';
import { list, getOne, create, update, remove } from './company.controller';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', validate(companyCreateSchema), create);
router.put('/:id', validate(companyUpdateSchema), update);
router.delete('/:id', remove);

export const companyRouter = router;
