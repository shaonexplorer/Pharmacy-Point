/**
 * Inventory service — business logic for stock management.
 * Extracted from inline route handlers in inventory.ts.
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { StockInInput, StockOutInput, StockAdjustInput } from './inventory.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface InventoryListParams {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string;
  lowStock?: boolean;
  companyId?: string;
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
  difference?: number;
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

  const where: Record<string, unknown> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (companyId) {
    where.companyId = companyId;
  }

  // Fetch all matching products, then filter + paginate in JS
  const allProducts = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { company: true },
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
      include: { product: true },
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
 * Uses a Prisma transaction to atomically increment quantity and create
 * an STOCK_IN transaction record.
 */
export async function recordStockIn(data: StockInInput): Promise<StockOperationResult> {
  const product = await prisma.product.findFirst({
    where: { id: data.productId, deletedAt: null },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  return await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: data.productId },
      data: { quantity: { increment: data.quantity } },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        productId: data.productId,
        type: 'STOCK_IN',
        quantity: data.quantity,
        notes: data.notes,
        referenceId: data.referenceId,
      },
      include: { product: true },
    });

    return { product: updatedProduct, transaction };
  });
}

/**
 * Record a stock-out (sale).
 * Checks sufficient stock before decrementing.
 * Uses a Prisma transaction for atomicity.
 */
export async function recordStockOut(data: StockOutInput): Promise<StockOperationResult> {
  const product = await prisma.product.findFirst({
    where: { id: data.productId, deletedAt: null },
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

  return await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: data.productId },
      data: { quantity: { decrement: data.quantity } },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        productId: data.productId,
        type: 'STOCK_OUT',
        quantity: data.quantity,
        notes: data.notes,
        referenceId: data.referenceId,
      },
      include: { product: true },
    });

    return { product: updatedProduct, transaction };
  });
}

/**
 * Adjust stock to an absolute quantity value.
 * Calculates the difference from the current quantity for the transaction record.
 * Uses a Prisma transaction for atomicity.
 */
export async function adjustStock(
  productId: string,
  data: StockAdjustInput
): Promise<StockOperationResult> {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const quantityDifference = data.quantity - product.quantity;

  return await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { quantity: data.quantity },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        productId,
        type: 'ADJUSTMENT',
        quantity: quantityDifference,
        notes: data.notes,
      },
      include: { product: true },
    });

    return {
      product: updatedProduct,
      transaction,
      previousQuantity: product.quantity,
      difference: quantityDifference,
    };
  });
}
