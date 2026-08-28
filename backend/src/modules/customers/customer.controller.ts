/**
 * Customer controller — HTTP request handlers.
 * Delegates business logic to customerService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { serializeCustomer } from '../../utils/serializers';
import * as customerService from './customer.service';

/**
 * GET /api/customers
 * List all customers with pagination and optional search.
 * Query params: page, limit, search
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await customerService.listCustomers({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    search: (req.query.search as string) || '',
  });

  res.json({
    data: result.data.map((c: Record<string, unknown>) => serializeCustomer(c)),
    pagination: result.pagination,
  });
});

/**
 * GET /api/customers/:id
 * Get a single customer by ID with order history.
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.getCustomer(req.params.id);
  res.json({
    data: {
      ...serializeCustomer(customer),
      orders: customer.orders ?? [],
    },
  });
});

/**
 * POST /api/customers
 * Create a new customer.
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.createCustomer(req.body);
  res
    .status(201)
    .json({ data: serializeCustomer(customer), message: 'Customer created successfully' });
});

/**
 * PUT /api/customers/:id
 * Update an existing customer.
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.json({
    data: {
      ...serializeCustomer(customer),
      orders: customer.orders ?? [],
    },
    message: 'Customer updated successfully',
  });
});

/**
 * DELETE /api/customers/:id
 * Delete a customer (guarded against customers with orders).
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await customerService.deleteCustomer(req.params.id);
  res.json({ message: 'Customer deleted successfully' });
});
