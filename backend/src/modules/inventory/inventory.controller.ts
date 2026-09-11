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
 * GET /api/inventory/:productId/batches
 * List all batches for a specific product, ordered by expiry date.
 */
export const batches = asyncHandler(async (req: Request, res: Response) => {
  const batches = await inventoryService.getProductBatches(req.params.productId);
  res.json({
    data: batches.map((b: Record<string, unknown>) => ({
      id: b.id,
      productId: b.productId,
      batchNo: b.batchNo ?? null,
      lotNumber: b.lotNumber ?? null,
      expiryDate: b.expiryDate ?? null,
      manufactureDate: b.manufactureDate ?? null,
      quantity: b.quantity,
      initialQuantity: b.initialQuantity,
      costPrice: b.costPrice != null ? Number(b.costPrice) : null,
      referenceId: b.referenceId ?? null,
      userId: b.userId ?? null,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    })),
    message: 'Batches retrieved successfully',
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
 * Body: { productId, quantity, batchNo?, expiryDate?, notes?, referenceId? }
 * Creates a ProductBatch and links the transaction to it.
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
        batchId: (result.transaction as { batchId?: string }).batchId,
        notes: result.transaction.notes,
        referenceId: result.transaction.referenceId,
        userId: (result.transaction as { userId?: string }).userId,
        previousQuantity: (result.transaction as { previousQuantity?: number }).previousQuantity,
        newQuantity: (result.transaction as { newQuantity?: number }).newQuantity,
        createdAt: result.transaction.createdAt,
      },
      batches: result.batches?.map((b: Record<string, unknown>) => ({
        id: b.id,
        batchNo: b.batchNo,
        quantity: b.quantity,
        expiryDate: b.expiryDate,
      })),
      previousQuantity: result.previousQuantity,
      newQuantity: result.newQuantity,
    },
    message: 'Stock in recorded successfully',
  });
});

/**
 * POST /api/inventory/stock-out
 * Record stock out (sale).
 * Body: { productId, quantity, batchId?, notes?, referenceId? }
 * If batchId is omitted, FIFO allocation from batches is used.
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
        batchId: (result.transaction as { batchId?: string }).batchId,
        notes: result.transaction.notes,
        referenceId: result.transaction.referenceId,
        userId: (result.transaction as { userId?: string }).userId,
        previousQuantity: (result.transaction as { previousQuantity?: number }).previousQuantity,
        newQuantity: (result.transaction as { newQuantity?: number }).newQuantity,
        createdAt: result.transaction.createdAt,
      },
      // batchTransactions present when FIFO allocated across multiple batches
      batchTransactions: result.batchTransactions?.map((t: Record<string, unknown>) => ({
        id: t.id,
        batchId: t.batchId,
        batchNo: t.batchNo,
        quantity: t.quantity,
        previousQuantity: t.previousQuantity,
        newQuantity: t.newQuantity,
        createdAt: t.createdAt,
      })),
      batches: result.batches?.map((b: Record<string, unknown>) => ({
        id: b.id,
        batchNo: b.batchNo,
        quantity: b.quantity,
        expiryDate: b.expiryDate,
      })),
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

export const exportInventory = asyncHandler(async (req: Request, res: Response) => {
  const csv = await inventoryService.exportInventoryCsv();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
  res.send(csv);
});

export const exportExpiring = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
  const csv = await inventoryService.exportExpiringCsv(days);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="expiring.csv"');
  res.send(csv);
});
