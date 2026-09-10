/**
 * Customer service — business logic for customer CRUD.
 * Extracted from inline route handlers in customers.ts.
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { CustomerCreateInput, CustomerUpdateInput } from './customer.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface CustomerListParams {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string;
}

export interface PaginatedCustomers {
  data: PrismaResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}

/**
 * List customers with pagination and optional search (name, email, phone).
 */
export async function listCustomers(params: CustomerListParams): Promise<PaginatedCustomers> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const search = params.search ?? '';

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers,
    pagination: { ...buildPagination(total, page, limit), total },
  };
}

/**
 * Get a single customer by ID with order history.
 * Throws 404 if not found.
 */
export async function getCustomer(id: string): Promise<PrismaResult> {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: true,
      duePayments: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!customer) {
    throw new AppError(404, 'Customer not found');
  }

  return customer;
}

/**
 * Create a new customer. Throws 409 on duplicate email.
 */
export async function createCustomer(data: CustomerCreateInput): Promise<PrismaResult> {
  if (data.email && data.email.trim()) {
    const existing = await prisma.customer.findUnique({
      where: { email: data.email.trim() },
    });

    if (existing) {
      throw new AppError(409, 'Customer with this email already exists');
    }
  }

  const customer = await prisma.customer.create({
    data: {
      name: data.name.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
    },
  });

  return customer;
}

/**
 * Update an existing customer. Throws 404 if not found; 409 on duplicate email.
 */
export async function updateCustomer(id: string, data: CustomerUpdateInput): Promise<PrismaResult> {
  const existing = await prisma.customer.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Customer not found');
  }

  // Check for duplicate email (exclude current customer)
  if (data.email && data.email.trim() && data.email.trim() !== existing.email) {
    const emailTaken = await prisma.customer.findUnique({
      where: { email: data.email.trim() },
    });

    if (emailTaken && emailTaken.id !== id) {
      throw new AppError(409, 'Customer with this email already exists');
    }
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: data.name ? data.name.trim() : existing.name,
      email: data.email !== undefined ? data.email.trim() || null : existing.email,
      phone: data.phone !== undefined ? data.phone.trim() || null : existing.phone,
      address: data.address !== undefined ? data.address.trim() || null : existing.address,
    },
    include: { orders: true },
  });

  return customer;
}

export async function listDuePayments(customerId: string): Promise<PrismaResult[]> {
  const payments = await prisma.duePayment.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return payments;
}

export async function recordDuePayment(
  customerId: string,
  data: { amount: number; orderId?: string; notes?: string; userId?: string }
): Promise<PrismaResult> {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new AppError(404, 'Customer not found');

  const payments = await prisma.duePayment.findMany({
    where: { customerId },
    select: { amount: true },
  });
  const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const orders = await prisma.order.findMany({
    where: { customerId, status: { notIn: ['CANCELLED', 'REFUNDED', 'RETURNED'] } },
    select: { total: true, isCreditSale: true },
  });
  const totalCredit = orders
    .filter((o) => o.isCreditSale)
    .reduce((sum, o) => sum + Number(o.total), 0);

  const dueAmount = totalCredit - paid;

  if (data.amount > dueAmount + 0.01) {
    throw new AppError(400, `Payment exceeds outstanding balance of ${dueAmount.toFixed(2)}`);
  }

  const payment = await prisma.duePayment.create({
    data: {
      customerId,
      amount: data.amount,
      orderId: data.orderId || null,
      notes: data.notes || null,
      userId: data.userId || null,
    },
    include: { customer: true, user: true },
  });

  await prisma.customer.update({
    where: { id: customerId },
    data: { dueAmount: totalCredit - (paid + data.amount) },
  });

  return payment;
}

export async function listDueAccounts(params: { page?: string; limit?: string; overdueDays?: number }) {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const where: Record<string, unknown> = { dueAmount: { gt: 0 } };
  if (params.overdueDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - params.overdueDays);
    where.orders = { some: { createdAt: { lt: cutoff } } };
  }
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take: limit, orderBy: { dueAmount: 'desc' }, include: { orders: true } }),
    prisma.customer.count({ where }),
  ]);
  return { data: customers, pagination: { ...buildPagination(total, page, limit), total } };
}

/**
 * Get comprehensive customer dashboard data.
 */
export async function getCustomerDashboard(id: string): Promise<Record<string, unknown>> {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: 'asc' } }, duePayments: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });
  if (!customer) throw new AppError(404, 'Customer not found');

  const orders = customer.orders ?? [];
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const lifetimeValue = validOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const firstPurchaseDate = validOrders.length ? validOrders[0].createdAt.toISOString() : undefined;
  const lastPurchaseDate = validOrders.length ? validOrders[validOrders.length - 1].createdAt.toISOString() : undefined;

  const pointsEarned = Math.round(lifetimeValue);
  const pointsRedeemed = 0;

  return {
    customer,
    orders: validOrders,
    payments: customer.duePayments ?? [],
    lifetimeValue,
    firstPurchaseDate,
    lastPurchaseDate,
    loyaltyPoints: customer.loyaltyPoints ?? 0,
    loyaltyTier: customer.loyaltyTier ?? 'Bronze',
    pointsEarned,
    pointsRedeemed,
  };
}

/**
 * Delete a customer. Throws 400 if the customer has orders; 404 if not found.
 */
export async function deleteCustomer(id: string): Promise<void> {
  const orderCount = await prisma.order.count({ where: { customerId: id } });

  if (orderCount > 0) {
    throw new AppError(400, 'Cannot delete customer with orders');
  }

  try {
    await prisma.customer.delete({ where: { id } });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      throw new AppError(404, 'Customer not found');
    }
    throw error;
  }
}

// --- Loyalty Points System (Step 4) ---

const TIERS = [
  { tier: 'Bronze', minSpend: 0, maxSpend: 499, benefits: 'Basic points accumulation' },
  { tier: 'Silver', minSpend: 500, maxSpend: 1999, benefits: '5% discount on orders' },
  { tier: 'Gold', minSpend: 2000, maxSpend: 4999, benefits: '10% discount + priority service' },
  { tier: 'Platinum', minSpend: 5000, maxSpend: undefined, benefits: '15% discount + exclusive perks' },
];

export function getLoyaltyTiers() {
  return TIERS;
}

export function calculateTier(lifetimeSpend: number) {
  for (const t of TIERS) {
    if (t.maxSpend === undefined) {
      if (lifetimeSpend >= t.minSpend) return t.tier;
    } else if (lifetimeSpend >= t.minSpend && lifetimeSpend <= t.maxSpend) {
      return t.tier;
    }
  }
  return 'Bronze';
}

export async function earnPoints(customerId: string, amount: number, orderTotal?: number) {
  const earned = amount > 0 ? Math.round(amount) : 0;
  // 1 point per $1 spent
  const points = Math.round(orderTotal ?? amount);
  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: { loyaltyPoints: { increment: points }, lifetimeSpend: { increment: orderTotal ?? amount } },
  });
  const tier = calculateTier(Number(customer.lifetimeSpend));
  await prisma.customer.update({ where: { id: customerId }, data: { loyaltyTier: tier } });
  return { pointsEarned: points, newTier: tier, loyaltyPoints: customer.loyaltyPoints ?? 0 };
}

export async function redeemPoints(customerId: string, pointsToRedeem: number) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new AppError(404, 'Customer not found');
  const current = customer.loyaltyPoints ?? 0;
  if (current < pointsToRedeem) throw new AppError(400, 'Insufficient points');
  const discount = pointsToRedeem / 100; // 100 pts = $1
  await prisma.customer.update({
    where: { id: customerId },
    data: { loyaltyPoints: { decrement: pointsToRedeem } },
  });
  return { redeemed: pointsToRedeem, discountValue: discount, remainingPoints: current - pointsToRedeem };
}

export async function adjustLoyaltyPoints(customerId: string, amount: number, notes?: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new AppError(404, 'Customer not found');
  const newPoints = Math.max(0, (customer.loyaltyPoints ?? 0) + amount);
  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: { loyaltyPoints: newPoints },
  });
  const tier = calculateTier(Number(updated.lifetimeSpend));
  if (tier !== updated.loyaltyTier) {
    await prisma.customer.update({ where: { id: customerId }, data: { loyaltyTier: tier } });
  }
  return { customerId, amount, newPoints, notes, tier };
}
