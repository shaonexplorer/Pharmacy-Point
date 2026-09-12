/**
 * Supplier routes — thin URL-to-controller mapping.
 *
 * Order matters: sub-resource routes (`/representatives`) are registered
 * before `/:id` so that the param route does not shadow them.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { supplierSchema, supplierRepresentativeSchema } from './supplier.dto';
import { list, getOne, create, update, remove, listReps, createRep, updateRep, removeRep } from './supplier.controller';

const router = Router();

/* ─── Top-level supplier CRUD ── */
router.get('/', list);
router.post('/', validate(supplierSchema), create);

/* ─── Representative sub-routes (before /:id) ── */
router.get('/:supplierId/representatives', listReps);
router.post('/:supplierId/representatives', validate(supplierRepresentativeSchema), createRep);
router.put(
  '/:supplierId/representatives/:repId',
  validate(supplierRepresentativeSchema),
  updateRep
);
router.delete('/:supplierId/representatives/:repId', removeRep);

/* ─── Supplier detail routes (after sub-resources) ── */
router.get('/:id', getOne);
router.put('/:id', validate(supplierSchema), update);
router.delete('/:id', remove);

export default router;
