/**
 * Stats service — business logic for dashboard statistics.
 * Extracted from inline route handlers in stats.ts.
 */
import { prisma } from '../../config/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StatsResult = Record<string, any>;

/**
 * Get aggregated statistics for the dashboard.
 * All queries are combined into a single service call.
 */
export async function getStats(): Promise<StatsResult> {
  // Get total products count (excluding soft-deleted)
  const totalProducts = await prisma.product.count({
    where: { deletedAt: null },
  });

  // Get total companies count
  const totalCompanies = await prisma.company.count();

  // Get total inventory transactions count
  const totalTransactions = await prisma.inventoryTransaction.count();

  // Get low stock items — fetch and filter in JavaScript since Prisma
  // cannot compare two columns (quantity <= lowStock) in where clause
  const allProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { quantity: true, lowStock: true, price: true },
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
    where: { type: 'STOCK_IN', createdAt: { gte: startOfMonth } },
  });

  // Get stock-out transactions this month (sales)
  const stockOutThisMonth = await prisma.inventoryTransaction.count({
    where: { type: 'STOCK_OUT', createdAt: { gte: startOfMonth } },
  });

  // Get total sales — sum of all completed order totals
  const totalSalesResult = await prisma.order.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { total: true },
  });
  const totalSales = Number(totalSalesResult._sum.total ?? 0);

  // Get pending orders count
  const pendingOrders = await prisma.order.count({
    where: { status: 'PENDING' },
  });

  return {
    totalProducts,
    totalCompanies,
    totalTransactions,
    lowStockItems,
    totalSales: Math.round(totalSales * 100) / 100,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
    stockInThisMonth,
    stockOutThisMonth,
    salesThisMonth: stockOutThisMonth,
    pendingOrders,
  };
}
