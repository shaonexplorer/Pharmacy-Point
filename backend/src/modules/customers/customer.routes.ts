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
  getLoyaltyTiers,
  adjustLoyaltyPoints,
} from './customer.controller';
import { adjustPointsSchema } from './loyalty.dto';
import { duePaymentSchema } from './due-payment.dto';

const router = Router();

router.get('/', list);
router.get('/due-accounts', listDueAccounts);
router.get('/loyalty-tiers', getLoyaltyTiers);
router.get('/:id/dashboard', getDashboard);
router.get('/:id', getOne);
router.post('/', validate(customerCreateSchema), create);
router.put('/:id', validate(customerUpdateSchema), update);
router.delete('/:id', remove);

router.post('/:id/due-payments', validate(duePaymentSchema), recordPayment);
router.get('/:id/due-payments', listPayments);

router.post('/:id/loyalty/points', validate(adjustPointsSchema), adjustLoyaltyPoints);

export const customerRouter = router;
