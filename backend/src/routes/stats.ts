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

    // Get total inventory transactions count
    const totalTransactions = await prisma.inventoryTransaction.count();

    // Get low stock items - fetch and filter in JavaScript since Prisma
    // cannot compare two columns (quantity <= lowStock) in where clause
    const allProducts = await prisma.product.findMany({
      where: { deletedAt: null },
      select: {
        quantity: true,
        lowStock: true,
        price: true,
      },
    });

    const lowStockItems = allProducts.filter((p) => p.quantity <= p.lowStock).length;

    // Get total value of inventory
    const totalInventoryValue = allProducts.reduce(
      (sum, product) => sum + Number(product.price) * product.quantity,
      0
    );

    // Get stock-in transactions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stockInThisMonth = await prisma.inventoryTransaction.count({
      where: {
        type: 'STOCK_IN',
        createdAt: { gte: startOfMonth },
      },
    });

    // Get stock-out transactions this month (sales)
    const stockOutThisMonth = await prisma.inventoryTransaction.count({
      where: {
        type: 'STOCK_OUT',
        createdAt: { gte: startOfMonth },
      },
    });

    const stats = {
      totalProducts,
      totalCompanies,
      totalTransactions,
      lowStockItems,
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      stockInThisMonth,
      stockOutThisMonth,
      salesThisMonth: stockOutThisMonth,
    };

    return res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export const statsRouter = router;
