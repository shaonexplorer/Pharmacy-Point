import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * Serialize a Prisma Order for API responses.
 */
function serializeOrder(order: Record<string, unknown>) {
  return {
    id: order.id as string,
    customerId: order.customerId as string | null | undefined,
    total: Number(order.total),
    subtotal: Number(order.subtotal ?? 0),
    tax: Number(order.tax ?? 0),
    taxRate: Number(order.taxRate ?? 0),
    paymentMethod: order.paymentMethod as string | null,
    staffId: order.staffId as string | null | undefined,
    status: order.status as string,
    createdAt: order.createdAt as Date,
    updatedAt: order.updatedAt as Date,
  };
}

/**
 * Serialize a Prisma OrderItem for API responses.
 */
function serializeOrderItem(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orderId: item.orderId as string,
    productId: item.productId as string,
    quantity: item.quantity as number,
    price: Number(item.price),
    product: (item.product as Record<string, unknown> | null | undefined)
      ? serializeProductLite(item.product as Record<string, unknown>)
      : undefined,
  };
}

/**
 * Serialize just the product fields needed for order items.
 */
function serializeProductLite(product: Record<string, unknown>) {
  return {
    id: product.id as string,
    name: product.name as string,
    sku: product.sku as string,
    price: Number(product.price),
    image: product.image as string | null,
  };
}

/**
 * Validation helper: checks required fields for creating an order.
 */
function validateCreateOrder(input: unknown): string[] {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    errors.push('Invalid request body');
    return errors;
  }

  const body = input as Record<string, unknown>;

  // Items: must be a non-empty array
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('At least one order item is required');
    return errors;
  }

  // Validate each item
  for (let i = 0; i < (body.items as unknown[]).length; i++) {
    const item = (body.items as Record<string, unknown>[])[i];

    if (typeof item.productId !== 'string' || item.productId.trim().length === 0) {
      errors.push(`Item ${i + 1}: Product ID is required`);
    }

    if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
      errors.push(`Item ${i + 1}: Quantity must be a positive number`);
    }

    if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
      errors.push(`Item ${i + 1}: Price must be a positive number`);
    }
  }

  // Validate totals
  if (typeof body.subtotal !== 'number' || isNaN(body.subtotal) || body.subtotal < 0) {
    errors.push('Subtotal must be a non-negative number');
  }

  if (typeof body.tax !== 'number' || isNaN(body.tax) || body.tax < 0) {
    errors.push('Tax must be a non-negative number');
  }

  if (typeof body.total !== 'number' || isNaN(body.total) || body.total < 0) {
    errors.push('Total must be a non-negative number');
  }

  if (typeof body.taxRate !== 'number' || isNaN(body.taxRate) || body.taxRate < 0) {
    errors.push('Tax rate must be a non-negative number');
  }

  if (
    body.paymentMethod !== undefined &&
    body.paymentMethod !== null &&
    body.paymentMethod !== 'cash' &&
    body.paymentMethod !== 'card'
  ) {
    errors.push('Payment method must be "cash" or "card"');
  }

  return errors;
}

/**
 * GET /api/orders
 * List orders with pagination and optional filters.
 * Query params: page, limit, status, customerId, staffId
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const status = req.query.status as string | undefined;
    const customerId = (req.query.customerId as string) || undefined;
    const staffId = (req.query.staffId as string) || undefined;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (staffId) {
      where.staffId = staffId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      data: orders.map((order) => ({
        ...serializeOrder(order),
        customer: order.customer
          ? {
              id: order.customer.id,
              name: order.customer.name,
              phone: order.customer.phone,
            }
          : null,
        items: order.items.map((item) => ({
          ...serializeOrderItem(item),
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:id
 * Get a single order by ID with items and product details.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({
      data: {
        ...serializeOrder(order),
        customer: order.customer ? serializeCustomer(order.customer) : null,
        items: order.items.map((item) => serializeOrderItem(item)),
        user: order.user
          ? {
              id: order.user.id,
              name: order.user.name,
              email: order.user.email,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * Serialize a Prisma Customer for API responses.
 */
function serializeCustomer(customer: Record<string, unknown>) {
  return {
    id: customer.id as string,
    name: customer.name as string,
    email: customer.email as string | null,
    phone: customer.phone as string | null,
    address: customer.address as string | null,
    dueAmount: Number(customer.dueAmount ?? 0),
    createdAt: customer.createdAt as Date,
    updatedAt: customer.updatedAt as Date,
  };
}

/**
 * POST /api/orders
 * Create a new order.
 * Body: { customerId?, items: [{ productId, quantity, price }], subtotal, tax, taxRate, total, paymentMethod, staffId? }
 *
 * Uses a Prisma transaction to:
 *   1. Create the order
 *   2. Create order items
 *   3. Decrement product stock for each item
 *   4. Record STOCK_OUT inventory transactions
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const errors = validateCreateOrder(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const body = req.body as {
      customerId?: string | null;
      items: Array<{ productId: string; quantity: number; price: number }>;
      subtotal: number;
      tax: number;
      taxRate: number;
      total: number;
      paymentMethod?: 'cash' | 'card' | null;
      staffId?: string | null;
    };

    // Check all products exist, are not soft-deleted, and have sufficient stock
    const productIds = body.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
      },
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

    // Map products by id for easy lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products were found and have sufficient stock
    const missingProducts: string[] = [];
    const insufficientStock: string[] = [];

    for (const item of body.items) {
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
      return res.status(404).json({
        error: 'One or more products not found',
        details: `Product IDs not found: ${missingProducts.join(', ')}`,
      });
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock',
        details: insufficientStock.join('; '),
      });
    }

    // Use transaction to create order, items, update stock, and record transactions
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          customerId: body.customerId ?? undefined,
          total: body.total,
          subtotal: body.subtotal,
          tax: body.tax,
          taxRate: body.taxRate,
          paymentMethod: body.paymentMethod ?? 'cash',
          staffId: body.staffId ?? undefined,
          status: 'COMPLETED',
        },
      });

      // 2. Create order items
      const orderItemsData = body.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // 3. Decrement product stock and create STOCK_OUT transactions
      for (const item of body.items) {
        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        // Record STOCK_OUT transaction
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

      // 4. Fetch the complete order with items and product details
      const completeOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                  image: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return completeOrder;
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    return res.status(201).json({
      data: {
        ...serializeOrder(result),
        customer: result.customer ? serializeCustomer(result.customer) : null,
        items: result.items.map((item) => serializeOrderItem(item)),
        user: result.user
          ? {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
            }
          : null,
      },
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update the status of an order.
 * Body: { status: 'PENDING' | 'COMPLETED' | 'CANCELLED' }
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };

    if (!status || !['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['Status must be one of: PENDING, COMPLETED, CANCELLED'],
      });
    }

    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as 'PENDING' | 'COMPLETED' | 'CANCELLED' },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      data: {
        ...serializeOrder(updated),
        customer: updated.customer ? serializeCustomer(updated.customer) : null,
        items: updated.items.map((item) => serializeOrderItem(item)),
      },
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

export const orderRouter = router;
