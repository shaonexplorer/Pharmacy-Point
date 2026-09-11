/**
 * Order service — business logic for order processing.
 * Extracted from inline route handlers in orders.ts.
 */
import { prisma } from '../../config/database';
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
 * Includes customer and items with product details.
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
        items: { include: { product: true } },
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
 * customer, items (with products), and staff user.
 * Throws 404 if not found.
 */
export async function getOrder(id: string): Promise<PrismaResult> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      user: true,
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  return order;
}

/**
 * Create a new order.
 *
 * Uses a Prisma transaction to:
 *   1. Validate all products exist and have sufficient stock
 *   2. Create the order record
 *   3. Create order items (via createMany)
 *   4. Decrement product stock for each item
 *   5. Record STOCK_OUT inventory transactions
 *   6. Fetch and return the complete order with relations
 *
 * Throws 404 if any product is not found; 400 if insufficient stock.
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

  // Validate all products were found and have sufficient stock
  const missingProducts: string[] = [];
  const insufficientStock: string[] = [];

  for (const item of data.items) {
    const product = productMap.get(item.productId);

    if (!product) {
      missingProducts.push(item.productId);
    } else if (product.quantity < item.quantity) {
      insufficientStock.push(
        `${product.name} (SKU: ${product.sku}) — available: ${product.quantity}, requested: ${item.quantity}`
      );
    }
  }

  if (missingProducts.length > 0) {
    throw new AppError(404, `Product IDs not found: ${missingProducts.join(', ')}`);
  }

  if (insufficientStock.length > 0) {
    throw new AppError(400, insufficientStock.join('; '));
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

    // 3. Create order items
    const orderItemsData = data.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    await tx.orderItem.createMany({ data: orderItemsData });

    // 4. Decrement product stock and record STOCK_OUT transactions
    for (const item of data.items) {
      const productBefore = productMap.get(item.productId)!;
      const previousQuantity = productBefore.quantity;
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
        select: { id: true, quantity: true },
      });

      await tx.inventoryTransaction.create({
        data: {
          productId: item.productId,
          type: 'STOCK_OUT',
          quantity: item.quantity,
          referenceId: order.id,
          notes: `Sale — Order #${order.id.slice(0, 8)}`,
          userId: data.staffId ?? undefined,
          previousQuantity,
          newQuantity: updatedProduct.quantity,
        },
      });
    }

    // 5. Fetch the complete order with all relations
    const completeOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, price: true, image: true } },
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
      include: { customer: true, items: { include: { product: true } } },
    });
  });

  return { order: updated, refundAmount: data.amount, reason: data.reason };
}

export async function processReturn(
  orderId: string,
  data: { items: { orderItemId: string; quantity: number }[]; reason?: string }
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new AppError(404, 'Order not found');
  if (order.status === 'RETURNED' || order.status === 'CANCELLED')
    throw new AppError(400, 'Order already returned');

  await prisma.$transaction(async (tx) => {
    let returnedValue = 0;
    for (const ret of data.items) {
      const item = await tx.orderItem.findUnique({
        where: { id: ret.orderItemId },
        include: { product: true },
      });
      if (!item) throw new AppError(404, 'Order item not found');
      if (ret.quantity > item.quantity - (item.returnedQuantity || 0))
        throw new AppError(400, 'Return quantity exceeds available');
      await tx.orderItem.update({
        where: { id: ret.orderItemId },
        data: { returnedQuantity: (item.returnedQuantity || 0) + ret.quantity },
      });
      // Accumulate value of returned items for credit-sale dueAmount adjustment
      returnedValue += Number(item.price) * ret.quantity;
      // Restock inventory and create RETURN transaction
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: ret.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          productId: item.productId,
          type: 'STOCK_IN',
          quantity: ret.quantity,
          batchNo: item.product?.batchNo,
          userId: undefined,
          previousQuantity: item.product?.quantity ?? 0,
          newQuantity: (item.product?.quantity ?? 0) + ret.quantity,
          notes: `Return for order ${orderId}`,
          referenceId: orderId,
        },
      });
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
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new AppError(404, 'Order not found');
  const returned = order.items.filter((i) => (i.returnedQuantity || 0) > 0);
  return { orderId, returnedItems: returned };
}
