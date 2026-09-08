/**
 * Customer controller — HTTP request handlers.
 * Delegates business logic to customerService; handles request/response.
 */
import type { Request, Response, NextFunction } from 'express';
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

import { duePaymentSchema } from './due-payment.dto';
import { adjustPointsSchema, loyaltyTierSchema } from './loyalty.dto';

/**
 * POST /api/customers/:id/due-payments
 * Record a payment against customer's due amount.
 */
export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const validated = duePaymentSchema.parse(req.body);
  const result = await customerService.recordDuePayment(req.params.id, validated);
  res.json({ data: result, message: 'Payment recorded successfully' });
});

/**
 * GET /api/customers/:id/due-payments
 * List payment history for a customer.
 */
export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const payments = await customerService.listDuePayments(req.params.id);
  res.json({ data: payments });
});

/**
 * GET /api/customers/due-accounts
 * List all customers with outstanding balances.
 */
/**
 * GET /api/customers/:id/dashboard
 * Aggregate customer activity (orders, payments, loyalty, lifetime value).
 */
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const result = await customerService.getCustomerDashboard(req.params.id);
  res.json({ data: result });
});

export const listDueAccounts = asyncHandler(async (req: Request, res: Response) => {
  const result = await customerService.listDueAccounts({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    overdueDays: req.query.overdueDays ? Number(req.query.overdueDays) : undefined,
  });
  res.json({
    data: result.data.map((c: Record<string, unknown>) => serializeCustomer(c)),
    pagination: result.pagination,
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

export async function getLoyaltyTiers(req: Request, res: Response, next: NextFunction) {
  try {
    const tiers = customerService.getLoyaltyTiers();
    res.json({ tiers });
  } catch (err) { next(err); }
}

export async function adjustLoyaltyPoints(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { amount, notes } = adjustPointsSchema.parse(req.body);
    const result = await customerService.adjustLoyaltyPoints(id, amount, notes);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
