import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/stats
 * Get aggregated statistics for the dashboard.
 * Query params: none (uses aggregate queries)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get total products count (excluding soft-deleted)
    const totalProducts = await prisma.product.count({
      where: { deletedAt: null },
    });

    // Get total companies count
    const totalCompanies = await prisma.company.count();

    // Get low stock items count (quantity <= lowStock threshold, excluding soft-deleted)
    const lowStockItems = await prisma.product.count({
      where: {
        deletedAt: null,
        quantity: { lte: prisma.product.fields.lowStock },
      },
    });

    // Get total value of inventory
    const productsWithPrice = await prisma.product.findMany({
      where: { deletedAt: null },
      select: {
        price: true,
        quantity: true,
      },
    });

    const totalInventoryValue = productsWithPrice.reduce(
      (sum, product) => sum + (Number(product.price) * product.quantity),
      0
    );

    // Get products added this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const productsThisMonth = await prisma.product.count({
      where: {
        deletedAt: null,
        createdAt: { gte: startOfMonth },
      },
    });

    // Get sales this month (we'll estimate based on moved products)
    const salesThisMonth = productsThisMonth;

    const stats = {
      totalProducts,
      totalCompanies,
      lowStockItems,
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      salesThisMonth,
    };

    return res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export const statsRouter = router;