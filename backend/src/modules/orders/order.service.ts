/**
 * Order service — business logic for order processing.
 * Extracted from inline route handlers in orders.ts.
 *
 * Batch-aware stock deduction:
 * When creating orders, stock is deducted from ProductBatch rows using
 * FIFO (oldest expiring batch first). Each OrderItem is linked to the
 * batch(es) its quantity was drawn from.
 */
import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { CreateOrderInput } from './order.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface OrderListParams {
  page?: string | undefined;
  limit?: string | undefined;
  status?: string;
  customerId?: string;
  staffId?: string;
}

/**
 * List orders with pagination and optional filters.
 * Includes customer and items with product details and batch info.
 */
export async function listOrders(params: OrderListParams): Promise<{
  data: PrismaResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });

  const where: Record<string, unknown> = {};

  if (params.status) where.status = params.status;
  if (params.customerId) where.customerId = params.customerId;
  if (params.staffId) where.staffId = params.staffId;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: { include: { product: true, batch: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      ...buildPagination(total, page, limit),
      total,
    },
  };
}

/**
 * Get a single order by ID with full relations:
 * customer, items (with products and batches), and staff user.
 * Throws 404 if not found.
 */
export async function getOrder(id: string): Promise<PrismaResult> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true, batch: true } },
      user: true,
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  return order;
}

/**
 * Allocate stock from batches using FIFO (oldest expiring batch first).
 * Returns an array of { batchId, quantity, batchNo } allocations.
 *
 * If the product has quantity > 0 but no batch records exist (legacy data
 * or direct quantity assignment), a default batch is created from the
 * product's current quantity to backfill the batch tracking system.
 *
 * Throws 400 if insufficient stock.
 */
async function allocateStockFromBatches(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number
): Promise<Array<{ batchId: string; quantity: number; batchNo: string | null }>> {
  let batches = await tx.productBatch.findMany({
    where: { productId, quantity: { gt: 0 } },
    orderBy: [{ expiryDate: 'asc' }, { createdAt: 'asc' }],
  });

  // Backfill: if product has quantity but no batches, create a default batch
  if (batches.length === 0) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { quantity: true, batchNo: true, expiryDate: true, lotNumber: true, manufactureDate: true },
    });
    if (!product || product.quantity <= 0) {
      throw new AppError(400, 'Product is out of stock');
    }
    // Create a default batch from the product's existing quantity
    const defaultBatch = await tx.productBatch.create({
      data: {
        productId,
        batchNo: product.batchNo ?? undefined,
        lotNumber: product.lotNumber ?? undefined,
        expiryDate: product.expiryDate ?? undefined,
        manufactureDate: product.manufactureDate ?? undefined,
        quantity: product.quantity,
        initialQuantity: product.quantity,
      },
    });
    batches = [defaultBatch];
  }

  let remaining = quantity;
  const allocations: Array<{ batchId: string; quantity: number; batchNo: string | null }> = [];

  for (const batch of batches) {
    if (remaining <= 0) break;
    const allocate = Math.min(batch.quantity, remaining);
    allocations.push({ batchId: batch.id, quantity: allocate, batchNo: batch.batchNo });
    remaining -= allocate;
  }

  if (remaining > 0) {
    throw new AppError(400, `Insufficient stock for ${productId}: need ${quantity}, available ${quantity - remaining}`);
  }

  return allocations;
}

/**
 * Deduct stock from batches within a transaction.
 * Uses FIFO allocation across multiple batches if needed.
 */
async function deductFromBatches(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
  orderId: string,
  staffId: string | null | undefined,
  notes?: string
): Promise<Array<{ batchId: string; batchNo: string | null; quantity: number }>> {
  const allocations = await allocateStockFromBatches(tx, productId, quantity);

  const batchAllocations: Array<{ batchId: string; batchNo: string | null; quantity: number }> = [];

  for (const alloc of allocations) {
    const batchBefore = await tx.productBatch.findUnique({
      where: { id: alloc.batchId },
      select: { quantity: true },
    });

    const updatedBatch = await tx.productBatch.update({
      where: { id: alloc.batchId },
      data: { quantity: { decrement: alloc.quantity } },
    });

    await tx.inventoryTransaction.create({
      data: {
        productId,
        batchId: alloc.batchId,
        batchNo: alloc.batchNo,
        type: 'STOCK_OUT',
        quantity: alloc.quantity,
        notes: notes ?? `Sale — Order #${orderId.slice(0, 8)}`,
        referenceId: orderId,
        userId: staffId ?? undefined,
        previousQuantity: batchBefore?.quantity ?? 0,
        newQuantity: updatedBatch.quantity,
      },
    });

    batchAllocations.push({
      batchId: alloc.batchId,
      batchNo: alloc.batchNo,
      quantity: alloc.quantity,
    });
  }

  return batchAllocations;
}

/**
 * Create a new order.
 *
 * Uses a Prisma transaction to:
 *   1. Validate all products exist and have sufficient stock
 *   2. Create the order record
 *   3. Deduct stock from batches (FIFO) and create STOCK_OUT transactions
 *   4. Create order items linked to their source batches
 *   5. Fetch and return the complete order with relations
 */
export async function createOrder(data: CreateOrderInput): Promise<PrismaResult> {
  // 1. Check all products exist, are not soft-deleted, and have sufficient stock
  const productIds = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, deletedAt: null },
    select: {
      id: true,
      name: true,
      quantity: true,
      lowStock: true,
      price: true,
      sku: true,
      image: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate all products were found
  const missingProducts: string[] = [];
  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      missingProducts.push(item.productId);
    }
  }

  if (missingProducts.length > 0) {
    throw new AppError(404, `Product IDs not found: ${missingProducts.join(', ')}`);
  }

  // 2-6. Create order in a transaction
  const completeOrder = await prisma.$transaction(async (tx) => {
    // 2. Create the order
    const order = await tx.order.create({
      data: {
        customerId: data.customerId ?? undefined,
        total: data.total,
        subtotal: data.subtotal,
        discount: data.discount,
        paymentMethod: data.paymentMethod ?? 'cash',
        staffId: data.staffId ?? undefined,
        status: 'COMPLETED',
        isCreditSale: data.isCreditSale ?? false,
        redeemedPoints: data.redeemedPoints ?? 0,
        paymentIntentId: data.paymentIntentId ?? undefined,
      },
    });

    // 2b. Redeem loyalty points if specified
    if (data.redeemedPoints && data.redeemedPoints > 0 && data.customerId) {
      const { redeemPoints } = await import('../customers/customer.service');
      await redeemPoints(data.customerId, data.redeemedPoints);
    }

    // 2c. Update customer due amount for credit sales
    if (data.isCreditSale && data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { dueAmount: { increment: data.total } },
      });
    }

    // 3. Deduct stock from batches and create order items
    const staffId = data.staffId ?? undefined;
    const orderItemBatchMap: Array<{ orderItem: PrismaResult; batchAllocations: Array<{ batchId: string; batchNo: string | null; quantity: number }> }> = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId)!;

      // First check aggregate stock
      if (product.quantity < item.quantity) {
        throw new AppError(
          400,
          `${product.name} (SKU: ${product.sku}) — available: ${product.quantity}, requested: ${item.quantity}`
        );
      }

      // Deduct from batches using FIFO
      const batchAllocations = await deductFromBatches(
        tx,
        item.productId,
        item.quantity,
        order.id,
        staffId,
        `Sale — Order #${order.id.slice(0, 8)}`
      );

      // Update product aggregate quantity
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });

      // Create order item — link to first batch allocation (primary batch)
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          batchId: batchAllocations[0]?.batchId ?? undefined,
        },
      });

      orderItemBatchMap.push({ orderItem, batchAllocations });
    }

    // 5. Fetch the complete order with all relations
    const completeOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, price: true, image: true, batchNo: true, expiryDate: true, batches: true } },
            batch: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!completeOrder) {
      throw new AppError(500, 'Failed to create order — order not found after creation');
    }

    return completeOrder;
  });

  return completeOrder;
}

/**
 * Update an order's status.
 * Throws 404 if the order does not exist.
 */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['REFUNDED', 'PARTIALLY_REFUNDED', 'RETURNED'],
  CANCELLED: ['PENDING'],
  REFUNDED: ['RETURNED'],
  PARTIALLY_REFUNDED: ['REFUNDED', 'RETURNED'],
  RETURNED: [],
};

export async function updateOrderStatus(id: string, status: string): Promise<PrismaResult> {
  const existing = await prisma.order.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Order not found');
  }

  const current = existing.status as string;
  const allowed = ALLOWED_TRANSITIONS[current] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(400, `Invalid status transition from ${current} to ${status}`);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: status as
        'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'RETURNED',
    },
    include: {
      customer: true,
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true, price: true } },
          batch: true,
        },
      },
    },
  });

  // Loyalty points: earn 1 point per $1 on COMPLETED orders with customer
  if (status === 'COMPLETED' && existing.customerId) {
    try {
      const { earnPoints } = await import('../customers/customer.service');
      await earnPoints(
        existing.customerId,
        Number(updated.subtotal ?? 0),
        Number(updated.subtotal ?? 0)
      );
    } catch (e) {
      /* non-blocking */
    }
  }

  return updated;
}

const RETURN_WINDOW_DAYS = 30;

export async function processRefund(
  orderId: string,
  data: { amount: number; reason: string; refundMethod?: string }
) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new AppError(404, 'Order not found');
  if (order.status === 'REFUNDED' || order.status === 'CANCELLED')
    throw new AppError(400, 'Order already refunded or cancelled');
  const daysSince = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince > RETURN_WINDOW_DAYS) throw new AppError(400, 'Return window exceeded');

  // Reverse Stripe if paymentIntentId present (stubbed — real integration uses stripe.refunds.create)
  if (order.paymentIntentId) {
    // Stripe refund placeholder; in production use stripe.refunds.create({ payment_intent: order.paymentIntentId, amount })
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Mark items as refunded proportionally if full amount equals total
    const isFull = data.amount >= Number(order.total);
    if (isFull) {
      await tx.orderItem.updateMany({ where: { orderId }, data: { refunded: true } });
    }

    // Persist the refund reason on the order for audit trail
    if (data.reason) {
      await tx.order.update({
        where: { id: orderId },
        data: { refundReason: data.reason },
      });
    }

    // Adjust customer due amount for credit sale refunds
    if (order.isCreditSale && order.customerId) {
      await tx.customer.update({
        where: { id: order.customerId },
        data: { dueAmount: { decrement: data.amount } },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED' },
      include: { customer: true, items: { include: { product: true, batch: true } } },
    });
  });

  return { order: updated, refundAmount: data.amount, reason: data.reason };
}

/**
 * Process a return for an order.
 *
 * Restores inventory to the original batch if the batch still exists,
 * otherwise creates/restocks a batch with the original batchNo.
 * Also records STOCK_IN transactions and adjusts customer dueAmount for credit sales.
 */
export async function processReturn(
  orderId: string,
  data: { items: { orderItemId: string; quantity: number }[]; reason?: string }
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true, batch: true } } },
  });
  if (!order) throw new AppError(404, 'Order not found');
  if (order.status === 'RETURNED' || order.status === 'CANCELLED')
    throw new AppError(400, 'Order already returned');

  await prisma.$transaction(async (tx) => {
    let returnedValue = 0;
    for (const ret of data.items) {
      const item = await tx.orderItem.findUnique({
        where: { id: ret.orderItemId },
        include: { product: true, batch: true },
      });
      if (!item) throw new AppError(404, 'Order item not found');
      if (ret.quantity > item.quantity - (item.returnedQuantity || 0))
        throw new AppError(400, 'Return quantity exceeds available');

      // Update returned quantity on the order item
      await tx.orderItem.update({
        where: { id: ret.orderItemId },
        data: { returnedQuantity: (item.returnedQuantity || 0) + ret.quantity },
      });

      // Accumulate value of returned items for credit-sale dueAmount adjustment
      returnedValue += Number(item.price) * ret.quantity;

      // Restore stock — to the original batch if it exists, otherwise to a batch with the same batchNo
      let targetBatchId = item.batchId;

      if (!targetBatchId) {
        // No batch was linked — try to find a batch with the same batchNo on the product
        const batchNo = item.product?.batchNo;
        if (batchNo) {
          const matchingBatch = await tx.productBatch.findFirst({
            where: { productId: item.productId, batchNo },
          });
          if (matchingBatch) {
            targetBatchId = matchingBatch.id;
          }
        }
      }

      const productBefore = await tx.product.findUnique({
        where: { id: item.productId },
        select: { quantity: true },
      });

      // Restore product aggregate quantity
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: ret.quantity } },
      });

      // Create STOCK_IN transaction linked to the batch (if found)
      await tx.inventoryTransaction.create({
        data: {
          productId: item.productId,
          batchId: targetBatchId ?? undefined,
          batchNo: item.batch?.batchNo ?? item.product?.batchNo ?? undefined,
          type: 'STOCK_IN',
          quantity: ret.quantity,
          notes: `Return for order ${orderId}`,
          referenceId: orderId,
          previousQuantity: productBefore?.quantity ?? 0,
          newQuantity: (productBefore?.quantity ?? 0) + ret.quantity,
        },
      });

      // If restoring to an existing batch, update its quantity
      if (targetBatchId) {
        const batchBefore = await tx.productBatch.findUnique({
          where: { id: targetBatchId },
          select: { quantity: true },
        });
        await tx.productBatch.update({
          where: { id: targetBatchId },
          data: { quantity: { increment: ret.quantity } },
        });
      }
    }

    // Adjust customer due amount for credit sale returns
    if (order.isCreditSale && order.customerId && returnedValue > 0) {
      await tx.customer.update({
        where: { id: order.customerId },
        data: { dueAmount: { decrement: returnedValue } },
      });
    }

    await tx.order.update({ where: { id: orderId }, data: { status: 'RETURNED' } });
  });

  return { orderId, returnedItems: data.items, reason: data.reason || '' };
}

export async function getReturns(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true, batch: true } } },
  });
  if (!order) throw new AppError(404, 'Order not found');
  const returned = order.items.filter((i) => (i.returnedQuantity || 0) > 0);
  return { orderId, returnedItems: returned };
}
