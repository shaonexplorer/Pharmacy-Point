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
    include: { orders: true },
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
