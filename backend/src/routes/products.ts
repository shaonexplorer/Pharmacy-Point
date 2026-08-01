import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const router = Router();

/**
 * Serialize a Prisma Product for API responses (converts Decimal to number).
 */
function serializeProduct(product: Record<string, unknown>) {
  return {
    id: product.id as string,
    name: product.name as string,
    description: product.description as string | null,
    sku: product.sku as string,
    price: product.price instanceof Decimal ? product.price.toNumber() : Number(product.price),
    quantity: product.quantity as number,
    lowStock: product.lowStock as number,
    category: product.category as string,
    companyId: product.companyId as string | null | undefined,
    company: product.company as Record<string, unknown> | null | undefined,
    image: product.image as string | null,
    deletedAt: product.deletedAt as Date | null,
    createdAt: product.createdAt as Date,
    updatedAt: product.updatedAt as Date,
  };
}

/**
 * Validation helper: checks required fields and returns an errors array.
 */
function validateProduct(input: unknown): string[] {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    errors.push('Invalid request body');
    return errors;
  }

  const body = input as Record<string, unknown>;

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (typeof body.sku !== 'string' || body.sku.trim().length === 0) {
    errors.push('SKU is required');
  }

  if (typeof body.price !== 'number' || isNaN(body.price) || body.price <= 0) {
    errors.push('Price must be a positive number');
  }

  if (typeof body.category !== 'string' || body.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (body.quantity !== undefined && (typeof body.quantity !== 'number' || body.quantity < 0)) {
    errors.push('Quantity must be a non-negative number');
  }

  if (body.lowStock !== undefined && (typeof body.lowStock !== 'number' || body.lowStock < 0)) {
    errors.push('Low stock threshold must be a non-negative number');
  }

  return errors;
}

/**
 * GET /api/products
 * List products with pagination, search, and category filter.
 * Query params: page, limit, search, category, companyId
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const companyId = (req.query.companyId as string) || undefined;

    // Build where clause — exclude soft-deleted products
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    // Search by name or sku (case-insensitive, contains matching)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by company
    if (companyId) {
      where.companyId = companyId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { company: true },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      data: products.map(serializeProduct),
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
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { company: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ data: serializeProduct(product) });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/products
 * Create a new product.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const errors = validateProduct(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Check for duplicate sku (exclude soft-deleted products)
    const existing = await prisma.product.findFirst({
      where: { sku: req.body.sku, deletedAt: null },
    });

    if (existing) {
      return res.status(409).json({ error: 'SKU already exists' });
    }

    const product = await prisma.product.create({
      data: {
        name: req.body.name,
        description: req.body.description ?? undefined,
        sku: req.body.sku,
        companyId: req.body.companyId ?? undefined,
        price: new Decimal(req.body.price),
        quantity: req.body.quantity ?? 0,
        lowStock: req.body.lowStock ?? 10,
        category: req.body.category,
        image: req.body.image ?? undefined,
      },
      include: { company: true },
    });

    return res
      .status(201)
      .json({ data: serializeProduct(product), message: 'Product created successfully' });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * PUT /api/products/:id
 * Update an existing product.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate if provided
    const errors = validateProduct(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Check for duplicate sku (exclude current product)
    if (req.body.sku && req.body.sku !== existing.sku) {
      const skuTaken = await prisma.product.findFirst({
        where: { sku: req.body.sku, deletedAt: null, id: { not: id } },
      });

      if (skuTaken) {
        return res.status(409).json({ error: 'SKU already exists' });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: req.body.name,
        description: req.body.description ?? undefined,
        sku: req.body.sku,
        companyId: req.body.companyId ?? undefined,
        price: new Decimal(req.body.price),
        quantity: req.body.quantity,
        lowStock: req.body.lowStock,
        category: req.body.category,
        image: req.body.image ?? undefined,
      },
      include: { company: true },
    });

    return res.json({ data: serializeProduct(product), message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /api/products/:id
 * Soft delete a product.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;