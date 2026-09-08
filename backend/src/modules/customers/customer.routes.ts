/**
 * Customer routes — thin URL-to-controller mapping.
 * Validation is handled via Zod DTO middleware; business logic in services.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { customerCreateSchema, customerUpdateSchema } from './customer.dto';
import {
  list,
  getOne,
  create,
  update,
  remove,
  getDashboard,
  recordPayment,
  listPayments,
  listDueAccounts,
} from './customer.controller';
import { duePaymentSchema } from './due-payment.dto';

const router = Router();

router.get('/', list);
router.get('/due-accounts', listDueAccounts);
router.get('/:id/dashboard', getDashboard);
router.get('/:id', getOne);
router.post('/', validate(customerCreateSchema), create);
router.put('/:id', validate(customerUpdateSchema), update);
router.delete('/:id', remove);

router.post('/:id/due-payments', validate(duePaymentSchema), recordPayment);
router.get('/:id/due-payments', listPayments);

export const customerRouter = router;
