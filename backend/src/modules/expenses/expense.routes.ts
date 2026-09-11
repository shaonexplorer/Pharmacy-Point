/**
 * Expense routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { expenseCreateSchema, expenseUpdateSchema } from './expense.dto';
import { list, getOne, create, update, remove, stats } from './expense.controller';

const router = Router();

// /stats must come before /:id to prevent route shadowing
router.get('/', list);
router.get('/stats', stats);
router.get('/:id', getOne);
router.post('/', validate(expenseCreateSchema), create);
router.put('/:id', validate(expenseUpdateSchema), update);
router.delete('/:id', remove);

export const expenseRouter = router;
