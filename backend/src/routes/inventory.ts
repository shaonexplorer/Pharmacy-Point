import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/inventory
 * List inventory with low stock filter.
 * Query params: page, limit, search, lowStock (boolean), companyId
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const lowStockOnly = req.query.lowStock === 'true';
    const companyId = (req.query.companyId as string) || undefined;

    // Build where clause — exclude soft-deleted products
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    // Fetch products matching where clause (we handle lowStock filtering in JS
    // since Prisma cannot compare two columns in a where clause)
    const allProducts = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    });

    // Apply low stock filter client-side if requested
    let filteredProducts = allProducts;
    if (lowStockOnly) {
      filteredProducts = allProducts.filter((p) => p.quantity <= p.lowStock);
    }

    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    const serializedProducts = paginatedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: Number(product.price),
      quantity: product.quantity,
      lowStock: product.lowStock,
      isLowStock: product.quantity <= product.lowStock,
      category: product.category,
      companyId: product.companyId,
      company: product.company,
      image: product.image,
      deletedAt: product.deletedAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return res.json({
      data: serializedProducts,
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
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * GET /api/inventory/transactions
 * List inventory transaction history.
 * Query params: page, limit, productId, type
 */
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;
    const productId = (req.query.productId as string) || undefined;
    const type = (req.query.type as string) || undefined;

    const where: Record<string, unknown> = {};

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type as 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
    }

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { product: true },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const serializedTransactions = transactions.map((t) => ({
      id: t.id,
      productId: t.productId,
      product: t.product
        ? {
            id: t.product.id,
            name: t.product.name,
            sku: t.product.sku,
          }
        : null,
      type: t.type,
      quantity: t.quantity,
      notes: t.notes,
      referenceId: t.referenceId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.json({
      data: serializedTransactions,
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
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * POST /api/inventory/stock-in
 * Record stock in (purchase receipt).
 * Body: { productId, quantity, notes?, referenceId? }
 */
router.post('/stock-in', async (req: Request, res: Response) => {
  try {
    const {
      productId,
      quantity: rawQuantity,
      notes,
      referenceId,
    } = req.body as {
      productId: string;
      quantity?: string | number;
      notes?: string;
      referenceId?: string;
    };

    // Validate - handle both string and number from JSON body
    const quantity = Number(rawQuantity);

    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    // Check product exists and is not soft-deleted
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Use transaction to update product quantity and create transaction record
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          quantity: { increment: quantity },
        },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          type: 'STOCK_IN',
          quantity,
          notes,
          referenceId,
        },
        include: { product: true },
      });

      return { product: updatedProduct, transaction };
    });

    return res.status(201).json({
      data: {
        product: {
          id: result.product.id,
          quantity: result.product.quantity,
          lowStock: result.product.lowStock,
        },
        transaction: {
          id: result.transaction.id,
          productId: result.transaction.productId,
          type: result.transaction.type,
          quantity: result.transaction.quantity,
          notes: result.transaction.notes,
          referenceId: result.transaction.referenceId,
          createdAt: result.transaction.createdAt,
        },
      },
      message: 'Stock in recorded successfully',
    });
  } catch (error) {
    console.error('Error recording stock in:', error);
    return res.status(500).json({
      error: 'Failed to record stock in',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/inventory/stock-out
 * Record stock out (sale).
 * Body: { productId, quantity, notes?, referenceId? }
 */
router.post('/stock-out', async (req: Request, res: Response) => {
  try {
    const {
      productId,
      quantity: rawQuantity,
      notes,
      referenceId,
    } = req.body as {
      productId: string;
      quantity?: string | number;
      notes?: string;
      referenceId?: string;
    };

    // Validate - handle both string and number from JSON body
    const quantity = Number(rawQuantity);

    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    // Check product exists and is not soft-deleted
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check sufficient stock
    if (product.quantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        details: `Available quantity is ${product.quantity}, requested ${quantity}`,
      });
    }

    // Use transaction to update product quantity and create transaction record
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          quantity: { decrement: quantity },
        },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          type: 'STOCK_OUT',
          quantity,
          notes,
          referenceId,
        },
        include: { product: true },
      });

      return { product: updatedProduct, transaction };
    });

    return res.status(201).json({
      data: {
        product: {
          id: result.product.id,
          quantity: result.product.quantity,
          lowStock: result.product.lowStock,
        },
        transaction: {
          id: result.transaction.id,
          productId: result.transaction.productId,
          type: result.transaction.type,
          quantity: result.transaction.quantity,
          notes: result.transaction.notes,
          referenceId: result.transaction.referenceId,
          createdAt: result.transaction.createdAt,
        },
      },
      message: 'Stock out recorded successfully',
    });
  } catch (error) {
    console.error('Error recording stock out:', error);
    return res.status(500).json({
      error: 'Failed to record stock out',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * PATCH /api/inventory/:productId/adjust
 * Manual stock adjustment.
 * Body: { quantity, notes }
 * Adjust the stock quantity to an absolute value.
 */
router.patch('/:productId/adjust', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity: rawQuantity, notes } = req.body as {
      quantity?: string | number;
      notes?: string;
    };

    // Validate - handle both string and number from JSON body
    const quantity = Number(rawQuantity);
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative number' });
    }

    // Check product exists and is not soft-deleted
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate difference for the transaction record
    const quantityDifference = quantity - product.quantity;

    // Use transaction to update product quantity and create transaction record
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          quantity,
        },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          type: 'ADJUSTMENT',
          quantity: quantityDifference,
          notes,
        },
        include: { product: true },
      });

      return { product: updatedProduct, transaction };
    });

    return res.json({
      data: {
        product: {
          id: result.product.id,
          quantity: result.product.quantity,
          lowStock: result.product.lowStock,
          previousQuantity: product.quantity,
          difference: quantityDifference,
        },
        transaction: {
          id: result.transaction.id,
          productId: result.transaction.productId,
          type: result.transaction.type,
          quantity: result.transaction.quantity,
          notes: result.transaction.notes,
          createdAt: result.transaction.createdAt,
        },
      },
      message: 'Stock adjusted successfully',
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return res.status(500).json({
      error: 'Failed to adjust stock',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export const inventoryRouter = router;
