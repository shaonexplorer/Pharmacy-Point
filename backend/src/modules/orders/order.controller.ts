/**
 * Order controller — HTTP request handlers.
 * Delegates business logic to orderService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
  serializeOrder,
  serializeOrderItem,
  serializeCustomer,
  serializeUser,
} from '../../utils/serializers';
import * as orderService from './order.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderRecord = Record<string, any>;

/**
 * GET /api/orders
 * List orders with pagination and optional filters.
 * Query params: page, limit, status, customerId, staffId
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listOrders({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    status: (req.query.status as string) || undefined,
    customerId: (req.query.customerId as string) || undefined,
    staffId: (req.query.staffId as string) || undefined,
  });

  res.json({
    data: result.data.map((order: OrderRecord) => ({
      ...serializeOrder(order),
      customer: order.customer
        ? {
            id: order.customer.id,
            name: order.customer.name,
            phone: order.customer.phone,
          }
        : null,
      items: (order.items as OrderRecord[]).map((item) => serializeOrderItem(item)),
    })),
    pagination: result.pagination,
  });
});

/**
 * GET /api/orders/:id
 * Get a single order by ID with items and product details.
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrder(req.params.id);
  const orderRecord = order as OrderRecord;
  res.json({
    data: {
      ...serializeOrder(orderRecord),
      customer: orderRecord.customer ? serializeCustomer(orderRecord.customer) : null,
      items: (orderRecord.items as OrderRecord[]).map((item) => serializeOrderItem(item)),
      user: orderRecord.user ? serializeUser(orderRecord.user) : null,
    },
  });
});

/**
 * POST /api/orders
 * Create a new order.
 * Body: { customerId?, items: [{ productId, quantity, price }], subtotal, tax, taxRate, total, paymentMethod, staffId? }
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body);
  const orderRecord = order as OrderRecord;
  res.status(201).json({
    data: {
      ...serializeOrder(orderRecord),
      customer: orderRecord.customer ? serializeCustomer(orderRecord.customer) : null,
      items: (orderRecord.items as OrderRecord[]).map((item) => serializeOrderItem(item)),
      user: orderRecord.user ? serializeUser(orderRecord.user) : null,
    },
    message: 'Order created successfully',
  });
});

/**
 * PATCH /api/orders/:id/status
 * Update the status of an order.
 * Body: { status: 'PENDING' | 'COMPLETED' | 'CANCELLED' }
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  const orderRecord = order as OrderRecord;
  res.json({
    data: {
      ...serializeOrder(orderRecord),
      customer: orderRecord.customer ? serializeCustomer(orderRecord.customer) : null,
      items: (orderRecord.items as OrderRecord[]).map((item) => serializeOrderItem(item)),
    },
    message: 'Order status updated successfully',
  });
});
