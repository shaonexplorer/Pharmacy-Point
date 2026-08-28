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
        tax: data.tax,
        taxRate: data.taxRate,
        paymentMethod: data.paymentMethod ?? 'cash',
        staffId: data.staffId ?? undefined,
        status: 'COMPLETED',
      },
    });

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
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });

      await tx.inventoryTransaction.create({
        data: {
          productId: item.productId,
          type: 'STOCK_OUT',
          quantity: item.quantity,
          referenceId: order.id,
          notes: `Sale — Order #${order.id.slice(0, 8)}`,
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
export async function updateOrderStatus(id: string, status: string): Promise<PrismaResult> {
  const existing = await prisma.order.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Order not found');
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: status as 'PENDING' | 'COMPLETED' | 'CANCELLED' },
    include: {
      customer: true,
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true, price: true } },
        },
      },
    },
  });

  return updated;
}
