import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

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
    dueAmount: Number(customer.dueAmount),
    createdAt: customer.createdAt as Date,
    updatedAt: customer.updatedAt as Date,
  };
}

/**
 * Validation helper: checks required fields and returns an errors array.
 */
function validateCustomer(input: unknown): string[] {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    errors.push('Invalid request body');
    return errors;
  }

  const body = input as Record<string, unknown>;

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Customer name is required');
  }

  if (body.email !== undefined && body.email !== null) {
    if (typeof body.email !== 'string' || body.email.trim().length === 0) {
      errors.push('Email must be a non-empty string');
    } else {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        errors.push('Email must be a valid email address');
      }
    }
  }

  if (body.phone !== undefined && body.phone !== null && typeof body.phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (body.address !== undefined && body.address !== null && typeof body.address !== 'string') {
    errors.push('Address must be a string');
  }

  if (
    body.dueAmount !== undefined &&
    (typeof body.dueAmount !== 'number' || isNaN(body.dueAmount) || body.dueAmount < 0)
  ) {
    errors.push('Due amount must be a non-negative number');
  }

  return errors;
}

/**
 * Serialize a Prisma Order for API responses.
 */
function serializeOrder(order: Record<string, unknown>) {
  return {
    id: order.id as string,
    customerId: order.customerId as string | null | undefined,
    status: order.status as string,
    total: Number(order.total),
    createdAt: order.createdAt as Date,
    updatedAt: order.updatedAt as Date,
  };
}

/**
 * GET /api/customers
 * List all customers with pagination and optional search.
 * Query params: page, limit, search
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string) || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      data: customers.map(serializeCustomer),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching customers:', err.stack || err.message || error);
    return res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
  }
});

/**
 * GET /api/customers/:id
 * Get a single customer by ID with order history.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { orders: true },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({
      data: {
        ...serializeCustomer(customer),
        orders: customer.orders?.map(serializeOrder) ?? [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
  }
});

/**
 * POST /api/customers
 * Create a new customer.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const errors = validateCustomer(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const body = req.body as {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };

    // Check for duplicate email (if provided)
    if (body.email && body.email.trim()) {
      const existing = await prisma.customer.findUnique({
        where: { email: body.email.trim() },
      });

      if (existing) {
        return res.status(409).json({ error: 'Customer with this email already exists' });
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
      },
    });

    return res
      .status(201)
      .json({ data: serializeCustomer(customer), message: 'Customer created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Customer with this email already exists' });
    }
    console.error('Error creating customer:', error);
    return res.status(500).json({ error: 'Failed to create customer', details: error.message });
  }
});

/**
 * PUT /api/customers/:id
 * Update an existing customer.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };

    // Check customer exists
    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Validate input
    const errors = validateCustomer({ ...existing, ...body });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Check for duplicate email (exclude current customer)
    if (body.email && body.email.trim() && body.email.trim() !== existing.email) {
      const emailTaken = await prisma.customer.findUnique({
        where: { email: body.email.trim() },
      });

      if (emailTaken && emailTaken.id !== id) {
        return res.status(409).json({ error: 'Customer with this email already exists' });
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name ? body.name.trim() : existing.name,
        email: body.email !== undefined ? body.email.trim() || null : existing.email,
        phone: body.phone !== undefined ? body.phone.trim() || null : existing.phone,
        address: body.address !== undefined ? body.address.trim() || null : existing.address,
      },
      include: { orders: true },
    });

    return res.json({
      data: {
        ...serializeCustomer(customer),
        orders: customer.orders?.map(serializeOrder) ?? [],
      },
      message: 'Customer updated successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Customer with this email already exists' });
    }
    console.error('Error updating customer:', error);
    return res.status(500).json({ error: 'Failed to update customer', details: error.message });
  }
});

/**
 * DELETE /api/customers/:id
 * Delete a customer.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if customer has orders
    const orderCount = await prisma.order.count({
      where: { customerId: id },
    });

    if (orderCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with orders',
        details: `Customer has ${orderCount} order(s). Remove all orders from this customer before deleting.`,
      });
    }

    await prisma.customer.delete({
      where: { id },
    });

    return res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    console.error('Error deleting customer:', error);
    return res.status(500).json({ error: 'Failed to delete customer', details: error.message });
  }
});

export const customerRouter = router;
