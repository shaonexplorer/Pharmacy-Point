/**
 * Supplier controller — HTTP request handlers.
 * Delegates business logic to supplierService; handles request/response.
 *
 * Response shape convention (matching the rest of the codebase):
 *   - List:      { data: [], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }
 *   - Single:    { data: <entity>, message?: string }
 *   - Delete:    { message: string }  (204 also accepted)
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as supplierService from './supplier.service';

/* ─── Supplier CRUD ──────────────────────────────────────────────── */

/** GET /api/suppliers — list with pagination and optional search */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await supplierService.listSuppliers({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    search: (req.query.search as string) || '',
  });

  res.json({
    data: result.data,
    pagination: result.pagination,
  });
});

/** GET /api/suppliers/:id — get a single supplier with representatives */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.getSupplier(req.params.id);
  res.json({ data: supplier });
});

/** POST /api/suppliers — create a new supplier */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(201).json({ data: supplier, message: 'Supplier created successfully' });
});

/** PUT /api/suppliers/:id — update a supplier */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body);
  res.json({ data: supplier, message: 'Supplier updated successfully' });
});

/** DELETE /api/suppliers/:id — delete a supplier */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await supplierService.deleteSupplier(req.params.id);
  res.json({ message: 'Supplier deleted successfully' });
});

/* ─── Representative Management ──────────────────────────────────── */

/** GET /api/suppliers/:supplierId/representatives — list representatives */
export const listReps = asyncHandler(async (req: Request, res: Response) => {
  const reps = await supplierService.listRepresentatives(req.params.supplierId);
  res.json({ data: reps });
});

/** POST /api/suppliers/:supplierId/representatives — create a representative */
export const createRep = asyncHandler(async (req: Request, res: Response) => {
  const rep = await supplierService.createRepresentative(req.params.supplierId, req.body);
  res.status(201).json({ data: rep, message: 'Representative created successfully' });
});

/** PUT /api/suppliers/:supplierId/representatives/:repId — update a representative */
export const updateRep = asyncHandler(async (req: Request, res: Response) => {
  const rep = await supplierService.updateRepresentative(req.params.repId, req.body);
  res.json({ data: rep, message: 'Representative updated successfully' });
});

/** DELETE /api/suppliers/:supplierId/representatives/:repId — delete a representative */
export const removeRep = asyncHandler(async (req: Request, res: Response) => {
  await supplierService.deleteRepresentative(req.params.repId);
  res.json({ message: 'Representative deleted successfully' });
});
