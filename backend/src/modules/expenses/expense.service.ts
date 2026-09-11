/**
 * Expense service — business logic for expense CRUD and analytics.
 * Follows the same patterns as company.service.ts: Prisma queries,
 * AppError for HTTP errors, parsePagination/buildPagination for lists.
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { CreateExpenseInput, ExpenseUpdateInput } from './expense.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface ExpenseListParams {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string;
  category?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedExpenses {
  data: PrismaResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}

/**
 * List expenses with pagination, search, and filters.
 *
 * Filters:
 *  - search: case-insensitive match on vendor, description, or category
 *  - category: exact category match
 *  - paymentMethod: exact payment method match
 *  - startDate/endDate: date range on expenseDate
 */
export async function listExpenses(params: ExpenseListParams): Promise<PaginatedExpenses> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const search = params.search ?? '';
  const category = params.category;
  const paymentMethod = params.paymentMethod;
  const startDate = params.startDate;
  const endDate = params.endDate;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { vendor: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) (where.expenseDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.expenseDate as Record<string, unknown>).lte = new Date(endDate);
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: { expenseDate: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    data: expenses,
    pagination: { ...buildPagination(total, page, limit), total },
  };
}

/**
 * Get a single expense by ID with user relation.
 * Throws 404 if not found.
 */
export async function getExpense(id: string): Promise<PrismaResult> {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!expense) {
    throw new AppError(404, 'Expense not found');
  }

  return expense;
}

/**
 * Create a new expense record.
 */
export async function createExpense(data: CreateExpenseInput): Promise<PrismaResult> {
  const expense = await prisma.expense.create({
    data: {
      amount: data.amount,
      category: data.category,
      description: data.description || undefined,
      expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
      vendor: data.vendor || undefined,
      paymentMethod: data.paymentMethod ?? 'cash',
      receiptImage: data.receiptImage || undefined,
      userId: data.userId ?? undefined,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return expense;
}

/**
 * Update an existing expense. Throws 404 if not found.
 */
export async function updateExpense(id: string, data: ExpenseUpdateInput): Promise<PrismaResult> {
  const existing = await prisma.expense.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Expense not found');
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      amount: data.amount ?? undefined,
      category: data.category ?? undefined,
      description: data.description || undefined,
      expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
      vendor: data.vendor || undefined,
      paymentMethod: data.paymentMethod ?? undefined,
      receiptImage: data.receiptImage || undefined,
      userId: data.userId ?? undefined,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return expense;
}

/**
 * Delete an expense. Throws 404 if not found.
 * Hard delete is safe here — expenses have no child records in any table.
 */
export async function deleteExpense(id: string): Promise<void> {
  const existing = await prisma.expense.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Expense not found');
  }

  await prisma.expense.delete({ where: { id } });
}

/**
 * Get aggregated expense statistics for the stats endpoint.
 * Returns total expenses, this month's total, and breakdowns by category
 * and payment method.
 */
export async function getExpenseStats(): Promise<Record<string, unknown>> {
  // Total expenses (all time)
  const totalResult = await prisma.expense.aggregate({ _sum: { amount: true } });
  const totalExpenses = Number(totalResult._sum.amount ?? 0);

  // Expenses this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const totalThisMonthResult = await prisma.expense.aggregate({
    where: { createdAt: { gte: startOfMonth } },
    _sum: { amount: true },
  });
  const totalThisMonth = Number(totalThisMonthResult._sum.amount ?? 0);

  // Expenses this year
  const startOfYear = new Date();
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const totalThisYearResult = await prisma.expense.aggregate({
    where: { createdAt: { gte: startOfYear } },
    _sum: { amount: true },
  });
  const totalThisYear = Number(totalThisYearResult._sum.amount ?? 0);

  // By category (top-level category breakdown)
  const byCategoryRows = await prisma.expense.groupBy({
    by: ['category'],
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });
  const byCategory: Record<string, number> = {};
  for (const row of byCategoryRows) {
    byCategory[row.category] = Number(row._sum.amount ?? 0);
  }

  // By payment method
  const byPaymentMethodRows = await prisma.expense.groupBy({
    by: ['paymentMethod'],
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });
  const byPaymentMethod: Record<string, number> = {};
  for (const row of byPaymentMethodRows) {
    const key = row.paymentMethod ?? 'unknown';
    byPaymentMethod[key] = Number(row._sum.amount ?? 0);
  }

  return {
    totalExpenses,
    totalThisMonth,
    totalThisYear,
    byCategory,
    byPaymentMethod,
  };
}
