/**
 * Inventory controller — HTTP request handlers.
 * Delegates business logic to inventoryService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { serializeInventoryItem } from '../../utils/serializers';
import * as inventoryService from './inventory.service';

/**
 * GET /api/inventory/expiring
 * List products expiring within N days (default 30).
 */
export const expiring = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.listExpiring({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    days: req.query.days ? parseInt(req.query.days as string, 10) : 30,
  });
  res.json({
    data: result.data.map((p: Record<string, unknown>) => serializeInventoryItem(p)),
    pagination: result.pagination,
  });
});

/**
 * GET /api/inventory/expired
 * List expired products still in stock.
 */
export const expired = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.listExpired();
  res.json({
    data: result.data.map((p: Record<string, unknown>) => serializeInventoryItem(p)),
    pagination: result.pagination,
  });
});

/**
 * GET /api/inventory
 * List inventory with low stock filter.
 * Query params: page, limit, search, lowStock, companyId
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.listInventory({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    search: (req.query.search as string) || '',
    lowStock: req.query.lowStock === 'true',
    companyId: (req.query.companyId as string) || undefined,
    barcode: (req.query.barcode as string) || undefined,
    batchNo: (req.query.batchNo as string) || undefined,
    expiryDate: (req.query.expiryDate as string) || undefined,
  });

  res.json({
    data: result.data.map((p: Record<string, unknown>) => serializeInventoryItem(p)),
    pagination: result.pagination,
  });
});

/**
 * GET /api/inventory/transactions
 * List inventory transaction history.
 * Query params: page, limit, productId, type
 */
export const listTransactions = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.listTransactions({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    productId: (req.query.productId as string) || undefined,
    type: (req.query.type as string) || undefined,
  });

  res.json({
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * POST /api/inventory/stock-in
 * Record stock in (purchase receipt).
 * Body: { productId, quantity, notes?, referenceId? }
 */
export const stockIn = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.recordStockIn(req.body);
  res.status(201).json({
    data: {
      product: {
        id: result.product.id,
        quantity: result.product.quantity,
        lowStock: result.product.lowStock,
      },
      transaction: {
        id: result.transaction.id,
        productId: result.transaction.productId,
        type: result.transaction.type,
        quantity: result.transaction.quantity,
        batchNo: (result.transaction as { batchNo?: string }).batchNo,
        notes: result.transaction.notes,
        referenceId: result.transaction.referenceId,
        userId: (result.transaction as { userId?: string }).userId,
        previousQuantity: (result.transaction as { previousQuantity?: number }).previousQuantity,
        newQuantity: (result.transaction as { newQuantity?: number }).newQuantity,
        createdAt: result.transaction.createdAt,
      },
      previousQuantity: result.previousQuantity,
      newQuantity: result.newQuantity,
    },
    message: 'Stock in recorded successfully',
  });
});

/**
 * POST /api/inventory/stock-out
 * Record stock out (sale).
 * Body: { productId, quantity, notes?, referenceId? }
 */
export const stockOut = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.recordStockOut(req.body);
  res.status(201).json({
    data: {
      product: {
        id: result.product.id,
        quantity: result.product.quantity,
        lowStock: result.product.lowStock,
      },
      transaction: {
        id: result.transaction.id,
        productId: result.transaction.productId,
        type: result.transaction.type,
        quantity: result.transaction.quantity,
        batchNo: (result.transaction as { batchNo?: string }).batchNo,
        notes: result.transaction.notes,
        referenceId: result.transaction.referenceId,
        userId: (result.transaction as { userId?: string }).userId,
        previousQuantity: (result.transaction as { previousQuantity?: number }).previousQuantity,
        newQuantity: (result.transaction as { newQuantity?: number }).newQuantity,
        createdAt: result.transaction.createdAt,
      },
      previousQuantity: result.previousQuantity,
      newQuantity: result.newQuantity,
    },
    message: 'Stock out recorded successfully',
  });
});

/**
 * PATCH /api/inventory/:productId/adjust
 * Manual stock adjustment to an absolute value.
 * Body: { quantity, notes }
 */
export const adjust = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.adjustStock(req.params.productId, req.body);
  res.json({
    data: {
      product: {
        id: result.product.id,
        quantity: result.product.quantity,
        lowStock: result.product.lowStock,
        previousQuantity: result.previousQuantity,
        newQuantity: result.newQuantity,
        difference: result.difference,
      },
      transaction: {
        id: result.transaction.id,
        productId: result.transaction.productId,
        type: result.transaction.type,
        quantity: result.transaction.quantity,
        batchNo: (result.transaction as { batchNo?: string }).batchNo,
        notes: result.transaction.notes,
        userId: (result.transaction as { userId?: string }).userId,
        previousQuantity: (result.transaction as { previousQuantity?: number }).previousQuantity,
        newQuantity: (result.transaction as { newQuantity?: number }).newQuantity,
        referenceId: result.transaction.referenceId,
        createdAt: result.transaction.createdAt,
      },
    },
    message: 'Stock adjusted successfully',
  });
});
