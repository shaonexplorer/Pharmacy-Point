/**
 * Purchase order routes — thin URL-to-controller mapping.
 *
 * Order matters: sub-resource routes are registered before `/:id`.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { poSchema, poApproveSchema } from './purchase-order.dto';
import * as c from './purchase-order.controller';

const router = Router();

/* ─── Top-level PO routes ── */
router.get('/', c.list);
router.post('/', validate(poSchema), c.create);

/* ─── Action routes (before /:id to avoid shadowing) ── */
router.patch('/:id/approve', validate(poApproveSchema), c.approve);
router.post('/:id/receive', c.receive);
router.patch('/:id/cancel', c.cancel);

/* ─── Detail route ── */
router.get('/:id', c.get);

export default router;
