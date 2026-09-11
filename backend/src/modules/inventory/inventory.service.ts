/**
 * Inventory service — business logic for stock management.
 * Extracted from inline route handlers in inventory.ts.
 *
 * Batch/Lot Tracking:
 * The same Product can have multiple ProductBatch rows, each with its own
 * batchNo, expiryDate, and quantity. Product.quantity is a denormalised
 * aggregate that is kept in sync inside every transaction.
 */
import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { StockInInput, StockOutInput, StockAdjustInput } from './inventory.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface ExpiringListParams {
  page?: string | undefined;
  limit?: string | undefined;
  days?: number;
}

export interface InventoryListParams {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string;
  lowStock?: boolean;
  companyId?: string;
  barcode?: string;
  batchNo?: string;
  expiryDate?: string;
}

export interface InventoryTransactionListParams {
  page?: string | undefined;
  limit?: string | undefined;
  productId?: string;
  type?: string;
}

export interface PaginatedInventory {
  data: PrismaResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}

export interface StockOperationResult {
  product: PrismaResult;
  transaction: PrismaResult;
  previousQuantity?: number;
  newQuantity?: number;
  difference?: number;
  batches?: PrismaResult[];
  batchTransactions?: PrismaResult[];
}

/**
 * Recompute the Product's "primary batch" fields (batchNo, expiryDate, lotNumber,
 * manufactureDate) from the batch with the earliest non-null expiryDate, falling
 * back to the most recently created batch. This keeps the Product row's legacy
 * fields meaningful so existing queries that read product.batchNo / product.expiryDate
 * still return representative data.
 */
async function updateProductPrimaryBatch(
  tx: Prisma.TransactionClient,
  productId: string
): Promise<void> {
  const primaryBatch = await tx.productBatch.findFirst({
    where: { productId, quantity: { gt: 0 } },
    orderBy: [
      { expiryDate: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  if (primaryBatch) {
    await tx.product.update({
      where: { id: productId },
      data: {
        batchNo: primaryBatch.batchNo,
        expiryDate: primaryBatch.expiryDate,
        lotNumber: primaryBatch.lotNumber,
        manufactureDate: primaryBatch.manufactureDate,
      },
    });
  } else {
    // No batches with stock — clear primary batch fields
    await tx.product.update({
      where: { id: productId },
      data: {
        batchNo: null,
        expiryDate: null,
        lotNumber: null,
        manufactureDate: null,
      },
    });
  }
}

/**
 * List products expiring within N days (default 30).
 * Checks both Product-level expiry (legacy) and ProductBatch-level expiry.
 */
export async function listExpiring(params: ExpiringListParams): Promise<PaginatedInventory> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const days = params.days ?? 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  const now = new Date();

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { expiryDate: { lte: cutoff, gte: now } },
          {
            batches: {
              some: {
                expiryDate: { lte: cutoff, gte: now },
                quantity: { gt: 0 },
              },
            },
          },
        ],
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { company: true, batches: true },
    }),
    prisma.product.count({
      where: {
        deletedAt: null,
        OR: [
          { expiryDate: { lte: cutoff, gte: now } },
          {
            batches: {
              some: {
                expiryDate: { lte: cutoff, gte: now },
                quantity: { gt: 0 },
              },
            },
          },
        ],
      },
    }),
  ]);

  return {
    data: items,
    pagination: {
      ...buildPagination(total, page, limit),
      total,
    },
  };
}

/**
 * List expired products still in stock (quantity > 0).
 * Checks both Product-level and ProductBatch-level expiry.
 */
export async function listExpired(): Promise<PaginatedInventory> {
  const now = new Date();

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { expiryDate: { lt: now } },
          {
            batches: {
              some: {
                expiryDate: { lt: now },
                quantity: { gt: 0 },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { company: true, batches: true },
    }),
    prisma.product.count({
      where: {
        deletedAt: null,
        OR: [
          { expiryDate: { lt: now } },
          {
            batches: {
              some: {
                expiryDate: { lt: now },
                quantity: { gt: 0 },
              },
            },
          },
        ],
      },
    }),
  ]);

  return {
    data: items,
    pagination: {
      ...buildPagination(total, 1, 50),
      total,
    },
  };
}

/**
 * List inventory with low stock filtering.
 * Prisma cannot compare two columns (quantity <= lowStock) in a where clause,
 * so products are fetched and filtered in JavaScript.
 */
export async function listInventory(params: InventoryListParams): Promise<PaginatedInventory> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const search = params.search ?? '';
  const lowStockOnly = params.lowStock === true;
  const companyId = params.companyId;
  const barcode = params.barcode;
  const batchNo = params.batchNo;
  const expiryDate = params.expiryDate;

  const where: Record<string, unknown> = { deletedAt: null };
  const orConditions: Record<string, unknown>[] = [];

  if (search) {
    orConditions.push({ name: { contains: search, mode: 'insensitive' } });
    orConditions.push({ sku: { contains: search, mode: 'insensitive' } });
    orConditions.push({ batches: { some: { batchNo: { contains: search, mode: 'insensitive' } } } });
  }

  if (companyId) {
    where.companyId = companyId;
  }

  if (barcode) {
    where.barcode = { contains: barcode, mode: 'insensitive' };
  }

  if (batchNo) {
    where.batches = { some: { batchNo: { contains: batchNo, mode: 'insensitive' } } };
  }

  if (expiryDate) {
    const target = new Date(expiryDate);
    const end = new Date(target);
    end.setDate(end.getDate() + 1);
    orConditions.push({ expiryDate: { gte: target, lt: end } });
    orConditions.push({ batches: { some: { expiryDate: { gte: target, lt: end } } } });
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  // Fetch all matching products with batches, then filter + paginate in JS
  const allProducts = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { company: true, batches: { orderBy: { expiryDate: 'asc' } } },
  });

  let filteredProducts = allProducts;
  if (lowStockOnly) {
    filteredProducts = allProducts.filter((p) => p.quantity <= p.lowStock);
  }

  const paginatedProducts = filteredProducts.slice(skip, skip + limit);

  return {
    data: paginatedProducts,
    pagination: {
      ...buildPagination(filteredProducts.length, page, limit),
      total: filteredProducts.length,
    },
  };
}

/**
 * List inventory transaction history with optional filters.
 */
export async function listTransactions(
  params: InventoryTransactionListParams
): Promise<PaginatedInventory> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const productId = params.productId;
  const type = params.type;

  const where: Record<string, unknown> = {};

  if (productId) {
    where.productId = productId;
  }

  if (type) {
    where.type = type;
  }

  const [transactions, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { product: true, batch: true, user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  return {
    data: transactions,
    pagination: {
      ...buildPagination(total, page, limit),
      total,
    },
  };
}

/**
 * Record a stock-in (purchase receipt).
 *
 * Creates a ProductBatch row for this receipt, increments the Product's
 * aggregate quantity, and records an STOCK_IN InventoryTransaction linked
 * to the batch. All within a Prisma transaction for atomicity.
 */
export async function recordStockIn(data: StockInInput): Promise<StockOperationResult> {
  let productId = data.productId;
  if (!productId && data.barcode) {
    const productByBarcode = await prisma.product.findUnique({
      where: { barcode: data.barcode, deletedAt: null },
    });
    if (!productByBarcode) throw new AppError(404, 'Product not found by barcode');
    productId = productByBarcode.id;
  }
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  if (data.expiryDate) {
    const expiry = new Date(data.expiryDate);
    if (expiry < new Date()) {
      throw new AppError(400, 'Expiry date cannot be in the past');
    }
  }

  const previousQuantity = product.quantity;

  return await prisma.$transaction(async (tx) => {
    // Create a new batch for this receipt
    const batch = await tx.productBatch.create({
      data: {
        productId: productId!,
        batchNo: data.batchNo ?? undefined,
        lotNumber: data.lotNumber ?? undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : undefined,
        quantity: data.quantity,
        initialQuantity: data.quantity,
        costPrice: data.costPrice ? new Prisma.Decimal(data.costPrice) : undefined,
        referenceId: data.referenceId,
        userId: data.userId,
      },
    });

    // Increment the product's aggregate quantity
    const updatedProduct = await tx.product.update({
      where: { id: productId! },
      data: { quantity: { increment: data.quantity } },
    });

    // Update product's primary batch fields
    await updateProductPrimaryBatch(tx, productId!);

    // Record the inventory transaction, linked to the batch
    const transaction = await tx.inventoryTransaction.create({
      data: {
        productId: productId!,
        batchId: batch.id,
        batchNo: data.batchNo,
        type: 'STOCK_IN',
        quantity: data.quantity,
        notes: data.notes,
        referenceId: data.referenceId,
        userId: data.userId,
        previousQuantity,
        newQuantity: updatedProduct.quantity,
      },
    });

    return {
      product: updatedProduct,
      transaction,
      previousQuantity,
      newQuantity: updatedProduct.quantity,
      batches: [batch],
    };
  });
}

/**
 * Record a stock-out (sale).
 *
 * If batchId is provided, deducts from that specific batch.
 * Otherwise, uses FIFO allocation (oldest expiring batch first) to
 * deduct across one or more batches. Records STOCK_OUT transaction(s)
 * linked to the affected batch(es). Uses a Prisma transaction for atomicity.
 */
export async function recordStockOut(data: StockOutInput): Promise<StockOperationResult> {
  let productId = data.productId;
  if (!productId && data.barcode) {
    const productByBarcode = await prisma.product.findUnique({
      where: { barcode: data.barcode, deletedAt: null },
    });
    if (!productByBarcode) throw new AppError(404, 'Product not found by barcode');
    productId = productByBarcode.id;
  }
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    include: { batches: { orderBy: { expiryDate: 'asc' } } },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  if (product.quantity < data.quantity) {
    throw new AppError(
      400,
      `Available quantity is ${product.quantity}, requested ${data.quantity}`
    );
  }

  const previousQuantity = product.quantity;
  const userId = data.userId;

  return await prisma.$transaction(async (tx) => {
    // Determine which batches to deduct from
    let batchesToDeduct: PrismaResult[];
    if (data.batchId) {
      // Deduct from a specific batch
      const batch = product.batches.find((b: PrismaResult) => b.id === data.batchId);
      if (!batch || batch.quantity <= 0) {
        throw new AppError(400, 'Specified batch has insufficient stock');
      }
      if (batch.quantity < data.quantity) {
        throw new AppError(
          400,
          `Batch ${batch.batchNo ?? batch.id} has ${batch.quantity} units, requested ${data.quantity}`
        );
      }
      batchesToDeduct = [{ ...batch, allocate: data.quantity }];
    } else {
      // FIFO: allocate from oldest expiring batches first
      let available = product.batches.filter((b: PrismaResult) => b.quantity > 0);

      // Backfill: if product has quantity but no batches, create a default batch
      if (available.length === 0 && product.quantity > 0) {
        const defaultBatch = await tx.productBatch.create({
          data: {
            productId: productId!,
            batchNo: product.batchNo ?? undefined,
            lotNumber: product.lotNumber ?? undefined,
            expiryDate: product.expiryDate ?? undefined,
            manufactureDate: product.manufactureDate ?? undefined,
            quantity: product.quantity,
            initialQuantity: product.quantity,
          },
        });
        available = [defaultBatch];
      }

      let remaining = data.quantity;
      batchesToDeduct = [];
      for (const batch of available) {
        if (remaining <= 0) break;
        const allocate = Math.min(batch.quantity, remaining);
        batchesToDeduct.push({ ...batch, allocate });
        remaining -= allocate;
      }
      if (remaining > 0) {
        throw new AppError(400, 'Insufficient batch stock for FIFO allocation');
      }
    }

    // Deduct from each batch and create a transaction for each
    const batchTransactions: PrismaResult[] = [];
    for (const btd of batchesToDeduct) {
      const updatedBatch = await tx.productBatch.update({
        where: { id: btd.id },
        data: { quantity: { decrement: btd.allocate } },
      });

      const batchPrevQty = btd.quantity;
      const t = await tx.inventoryTransaction.create({
        data: {
          productId: productId!,
          batchId: btd.id,
          batchNo: btd.batchNo,
          type: 'STOCK_OUT',
          quantity: btd.allocate,
          notes: data.notes,
          referenceId: data.referenceId,
          userId: userId,
          previousQuantity: batchPrevQty,
          newQuantity: updatedBatch.quantity,
        },
      });
      batchTransactions.push(t);
    }

    // Decrement the product's aggregate quantity
    const updatedProduct = await tx.product.update({
      where: { id: productId! },
      data: { quantity: { decrement: data.quantity } },
    });

    // Refresh product primary batch fields
    await updateProductPrimaryBatch(tx, productId!);

    // Return the first (primary) transaction as the representative transaction
    const primaryTransaction = await tx.inventoryTransaction.findUnique({
      where: { id: batchTransactions[0].id },
      include: { product: true, batch: true },
    });

    return {
      product: updatedProduct,
      transaction: primaryTransaction,
      previousQuantity,
      newQuantity: updatedProduct.quantity,
      batchTransactions,
      batches: batchesToDeduct.map((b: PrismaResult) => ({
        id: b.id,
        batchNo: b.batchNo,
        quantity: b.allocate,
      })),
    };
  });
}

/**
 * Adjust stock to an absolute quantity value.
 *
 * When batchNo is provided: finds the matching batch (or creates one),
 * sets that batch's quantity to the specified value, then recalculates the
 * product's aggregate quantity from all batches.
 *
 * When no batchNo: sets the product's total quantity directly (legacy behaviour).
 *
 * Calculates the difference from the current quantity for the transaction record.
 * Uses a Prisma transaction for atomicity.
 */
export async function adjustStock(
  productId: string,
  data: StockAdjustInput
): Promise<StockOperationResult> {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    include: { batches: true },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  return await prisma.$transaction(async (tx) => {
    const previousQuantity = product.quantity;
    let batch = null;
    let batchQuantityDifference = 0;

    if (data.batchNo) {
      // Find or create the specified batch
      const existing = await tx.productBatch.findFirst({
        where: { productId, batchNo: data.batchNo },
      });

      if (existing) {
        batchQuantityDifference = data.quantity - (existing.quantity ?? 0);
        batch = await tx.productBatch.update({
          where: { id: existing.id },
          data: { quantity: data.quantity },
        });
      } else {
        batch = await tx.productBatch.create({
          data: {
            productId,
            batchNo: data.batchNo,
            quantity: data.quantity,
            initialQuantity: data.quantity,
          },
        });
        batchQuantityDifference = data.quantity;
      }

      // Recalculate product aggregate quantity from all batches
      const batchSum = await tx.productBatch.aggregate({
        where: { productId },
        _sum: { quantity: true },
      });
      const newQty = Number(batchSum._sum.quantity ?? 0);

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { quantity: newQty },
      });

      // Refresh product primary batch fields
      await updateProductPrimaryBatch(tx, productId);

      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          batchId: batch?.id,
          batchNo: data.batchNo,
          type: 'ADJUSTMENT',
          quantity: batchQuantityDifference,
          notes: data.notes,
          userId: (data as { userId?: string }).userId ?? undefined,
          previousQuantity,
          newQuantity: updatedProduct.quantity,
        },
      });

      return {
        product: updatedProduct,
        transaction,
        previousQuantity,
        newQuantity: updatedProduct.quantity,
        difference: batchQuantityDifference,
        batches: [batch],
      };
    }

    // No batchNo — product-level adjustment (legacy behaviour)
    const quantityDifference = data.quantity - product.quantity;
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { quantity: data.quantity },
    });

    await updateProductPrimaryBatch(tx, productId);

    const transaction = await tx.inventoryTransaction.create({
      data: {
        productId,
        type: 'ADJUSTMENT',
        quantity: quantityDifference,
        notes: data.notes,
        userId: (data as { userId?: string }).userId ?? undefined,
        previousQuantity,
        newQuantity: updatedProduct.quantity,
      },
    });

    return {
      product: updatedProduct,
      transaction,
      previousQuantity,
      newQuantity: updatedProduct.quantity,
      difference: quantityDifference,
    };
  });
}

/**
 * Get all batches for a specific product.
 */
export async function getProductBatches(productId: string): Promise<PrismaResult[]> {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const batches = await prisma.productBatch.findMany({
    where: { productId },
    orderBy: [
      { expiryDate: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  return batches;
}

/**
 * Get a single batch by its batchNo.
 */
export async function getBatchByBatchNo(batchNo: string): Promise<PrismaResult> {
  const batch = await prisma.productBatch.findUnique({
    where: { batchNo },
    include: { product: true },
  });

  if (!batch) {
    throw new AppError(404, 'Batch not found');
  }

  return batch;
}

/**
 * Create a new batch for a product (without changing stock quantity).
 * Used for manually registering a batch that was added via stock-in.
 */
export async function createProductBatch(
  productId: string,
  data: {
    batchNo?: string;
    lotNumber?: string;
    expiryDate?: Date;
    manufactureDate?: Date;
    costPrice?: number;
    referenceId?: string;
    userId?: string;
  }
): Promise<PrismaResult> {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const batch = await prisma.productBatch.create({
    data: {
      productId,
      batchNo: data.batchNo,
      lotNumber: data.lotNumber,
      expiryDate: data.expiryDate,
      manufactureDate: data.manufactureDate,
      costPrice: data.costPrice ? new Prisma.Decimal(data.costPrice) : undefined,
      referenceId: data.referenceId,
      userId: data.userId,
    },
  });

  return batch;
}

export async function exportInventoryCsv(): Promise<string> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
    include: { company: true, batches: true },
  });
  const headers = ['Name', 'SKU', 'Barcode', 'Batch', 'Lot', 'Category', 'Qty', 'Price', 'Expiry', 'Company'];
  const rows = products.map((p: PrismaResult) => {
    const primaryBatch = p.batches?.find((b: PrismaResult) => b.quantity > 0) ?? null;
    return [
      p.name,
      p.sku,
      p.barcode ?? '',
      primaryBatch?.batchNo ?? '',
      primaryBatch?.lotNumber ?? '',
      p.category ?? '',
      String(p.quantity ?? 0),
      String(p.price ?? 0),
      primaryBatch?.expiryDate ? new Date(primaryBatch.expiryDate).toISOString().split('T')[0] : '',
      p.company?.name ?? '',
    ];
  });
  const escape = (v: string) => '"' + String(v).replace(/"/g, '""') + '"';
  const lines = [headers.map(escape).join(','), ...rows.map((r: string[]) => r.map(escape).join(','))];
  return lines.join('\r\n');
}

export async function exportExpiringCsv(days = 30): Promise<string> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  const now = new Date();

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      OR: [
        { expiryDate: { lte: cutoff, gte: now } },
        {
          batches: {
            some: {
              expiryDate: { lte: cutoff, gte: now },
              quantity: { gt: 0 },
            },
          },
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { company: true, batches: true },
  });

  const headers = ['Name', 'SKU', 'Barcode', 'Batch', 'Lot', 'Category', 'Qty', 'Price', 'Expiry', 'Waste', 'Company'];
  const rows = products.map((p: PrismaResult) => {
    const primaryBatch = p.batches?.find((b: PrismaResult) => b.quantity > 0) ?? null;
    const waste = (p.quantity ?? 0) * (p.price ?? 0);
    return [
      p.name,
      p.sku,
      p.barcode ?? '',
      primaryBatch?.batchNo ?? '',
      primaryBatch?.lotNumber ?? '',
      p.category ?? '',
      String(p.quantity ?? 0),
      String(p.price ?? 0),
      primaryBatch?.expiryDate ? new Date(primaryBatch.expiryDate).toISOString().split('T')[0] : '',
      String(waste.toFixed(2)),
      p.company?.name ?? '',
    ];
  });
  const escape = (v: string) => '"' + String(v).replace(/"/g, '""') + '"';
  const lines = [headers.map(escape).join(','), ...rows.map((r: string[]) => r.map(escape).join(','))];
  return lines.join('\r\n');
}
