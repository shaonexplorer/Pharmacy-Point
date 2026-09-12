/**
 * Purchase order controller — HTTP request handlers.
 * Delegates business logic to purchase-order.service; handles request/response.
 *
 * Response shape convention (matching the rest of the codebase):
 *   - List:    { data: [], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }
 *   - Single:  { data: <entity>, message?: string }
 *   - Delete:  { message: string }
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as poService from './purchase-order.service';

/* ─── Purchase Order CRUD ───────────────────────────────────────── */

/** GET /api/purchase-orders — list with pagination and optional filters */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await poService.listPOs({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    status: (req.query.status as string) || undefined,
    supplierId: (req.query.supplierId as string) || undefined,
  });

  res.json({
    data: result.data,
    pagination: result.pagination,
  });
});

/** GET /api/purchase-orders/:id — get a single PO with items and supplier relations */
export const get = asyncHandler(async (req: Request, res: Response) => {
  const po = await poService.getPO(req.params.id);
  res.json({ data: po });
});

/** POST /api/purchase-orders — create a new purchase order */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const po = await poService.createPO(req.body);
  res.status(201).json({ data: po, message: 'Purchase order created successfully' });
});

/** PATCH /api/purchase-orders/:id/approve — approve a PO */
export const approve = asyncHandler(async (req: Request, res: Response) => {
  const po = await poService.approvePO(req.params.id, req.body.approvedBy);
  res.json({ data: po, message: 'Purchase order approved' });
});

/** POST /api/purchase-orders/:id/receive — mark PO as received (increments stock) */
export const receive = asyncHandler(async (req: Request, res: Response) => {
  const po = await poService.receivePO(req.params.id);
  res.json({ data: po, message: 'Purchase order received — stock updated' });
});

/** PATCH /api/purchase-orders/:id/cancel — cancel a PO */
export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const po = await poService.cancelPO(req.params.id, req.body.notes);
  res.json({ data: po, message: 'Purchase order cancelled' });
});
