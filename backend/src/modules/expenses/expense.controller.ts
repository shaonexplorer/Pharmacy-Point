/**
 * Expense controller — HTTP request handlers.
 * Delegates business logic to expenseService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { serializeExpense } from '../../utils/serializers';
import * as expenseService from './expense.service';

/**
 * GET /api/expenses
 * List expenses with pagination, search, and filters.
 * Query params: page, limit, search, category, paymentMethod, startDate, endDate
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await expenseService.listExpenses({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    search: (req.query.search as string) || undefined,
    category: (req.query.category as string) || undefined,
    paymentMethod: (req.query.paymentMethod as string) || undefined,
    startDate: (req.query.startDate as string) || undefined,
    endDate: (req.query.endDate as string) || undefined,
  });

  res.json({
    data: result.data.map((e: Record<string, unknown>) => serializeExpense(e)),
    pagination: result.pagination,
  });
});

/**
 * GET /api/expenses/stats
 * Get aggregated expense statistics.
 */
export const stats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await expenseService.getExpenseStats();
  res.json({ data: stats });
});

/**
 * GET /api/expenses/:id
 * Get a single expense by ID.
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.getExpense(req.params.id);
  res.json({ data: serializeExpense(expense) });
});

/**
 * POST /api/expenses
 * Create a new expense.
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.createExpense(req.body);
  res.status(201).json({
    data: serializeExpense(expense),
    message: 'Expense recorded successfully',
  });
});

/**
 * PUT /api/expenses/:id
 * Update an existing expense.
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body);
  res.json({
    data: serializeExpense(expense),
    message: 'Expense updated successfully',
  });
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense.
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await expenseService.deleteExpense(req.params.id);
  res.json({ message: 'Expense deleted successfully' });
});
