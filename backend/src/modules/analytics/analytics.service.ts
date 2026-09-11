/**
 * Analytics service — business logic for analytics & reporting dashboards.
 * Provides aggregated data for the analytics overview page.
 */
import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalyticsResult = Record<string, any>;

interface RawRow {
  [key: string]: any;
}

/**
 * Get revenue trends grouped by period.
 * Returns daily/weekly/monthly sales totals for the last N days.
 */
export async function getRevenueTrends(
  period: string,
  days: number
): Promise<{ labels: string[]; revenue: number[]; orders: number[] }> {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  let dateFormat: string;

  switch (period) {
    case 'day':
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'week':
      dateFormat = 'YYYY-WW';
      break;
    case 'quarter':
      dateFormat = 'YYYY-MM';
      break;
    default: // month
      dateFormat = 'YYYY-MM';
      break;
  }

  const results = await prisma.$queryRaw<RawRow[]>`
    SELECT
      TO_CHAR("createdAt", ${dateFormat}) as period_label,
      SUM(total) as total_revenue,
      COUNT(*) as order_count
    FROM orders
    WHERE status = 'COMPLETED'
      AND "createdAt" >= ${cutoff}
    GROUP BY TO_CHAR("createdAt", ${dateFormat})
    ORDER BY "createdAt" ASC
  `;

  const labels: string[] = [];
  const revenue: number[] = [];
  const orders: number[] = [];

  for (const row of results) {
    const dateStr = row.period_label as string;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    } else {
      labels.push(dateStr);
    }
    revenue.push(Number(row.total_revenue ?? 0));
    orders.push(Number(row.order_count ?? 0));
  }

  return { labels, revenue: revenue.map((r) => Math.round(r * 100) / 100), orders };
}

/**
 * Get sales by product category for the last N days.
 */
export async function getSalesByCategory(
  days: number
): Promise<{ categories: string[]; sales: number[]; orderCounts: number[] }> {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  const results = await prisma.$queryRaw<RawRow[]>`
    SELECT
      COALESCE(p.category, 'Uncategorized') as category,
      SUM(oi.price * oi.quantity) as total_sales,
      COUNT(DISTINCT o.id) as order_count
    FROM order_items oi
    JOIN products p ON oi."productId" = p.id
    JOIN orders o ON oi."orderId" = o.id
    WHERE o.status = 'COMPLETED'
      AND o."createdAt" >= ${cutoff}
      AND p."deletedAt" IS NULL
    GROUP BY p.category
    ORDER BY total_sales DESC
    LIMIT 8
  `;

  const categories: string[] = [];
  const sales: number[] = [];
  const orderCounts: number[] = [];

  for (const row of results) {
    categories.push((row.category as string) ?? 'Uncategorized');
    sales.push(Number(row.total_sales ?? 0));
    orderCounts.push(Number(row.order_count ?? 0));
  }

  return { categories, sales, orderCounts };
}

/**
 * Get inventory status summary for the dashboard.
 */
export async function getInventoryStatus(): Promise<{
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalInventoryValue: number;
}> {
  const allProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { quantity: true, lowStock: true, price: true },
  });

  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let totalInventoryValue = 0;

  for (const p of allProducts) {
    totalInventoryValue += Number(p.price) * p.quantity;
    if (p.quantity <= 0) {
      outOfStock++;
    } else if (p.quantity <= (p.lowStock ?? 10)) {
      lowStock++;
    } else {
      inStock++;
    }
  }

  return {
    totalProducts: allProducts.length,
    inStock,
    lowStock,
    outOfStock,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
  };
}

/**
 * Get top products by revenue for the last N days.
 */
export async function getTopProducts(
  days: number,
  limit: number = 5
): Promise<Array<{ name: string; category: string; revenue: number; unitsSold: number }>> {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  const results = await prisma.$queryRaw<RawRow[]>`
    SELECT
      p.name,
      COALESCE(p.category, 'Uncategorized') as category,
      SUM(oi.price * oi.quantity) as total_revenue,
      SUM(oi.quantity) as total_units
    FROM order_items oi
    JOIN products p ON oi."productId" = p.id
    JOIN orders o ON oi."orderId" = o.id
    WHERE o.status = 'COMPLETED'
      AND o."createdAt" >= ${cutoff}
      AND p."deletedAt" IS NULL
    GROUP BY p.id, p.name, p.category
    ORDER BY total_revenue DESC
    LIMIT ${limit}
  `;

  return results.map((row) => ({
    name: (row.name as string) ?? 'Unknown',
    category: (row.category as string) ?? 'Uncategorized',
    revenue: Number(row.total_revenue ?? 0),
    unitsSold: Number(row.total_units ?? 0),
  }));
}

/**
 * Get comprehensive analytics dashboard data.
 */
export async function getAnalyticsDashboard(
  period: string = 'month',
  days: number = 30
): Promise<AnalyticsResult> {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  // Get base stats
  const statsResult = await prisma.order.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { total: true },
    _count: { id: true },
  });

  const totalRevenue = Number(statsResult._sum.total ?? 0);
  const totalOrders = Number(statsResult._count.id ?? 0);

  // Get revenue trends
  const revenueTrends = await getRevenueTrends(period, days);

  // Get sales by category
  const salesByCategory = await getSalesByCategory(days);

  // Get inventory status
  const inventoryStatus = await getInventoryStatus();

  // Get top products
  const topProducts = await getTopProducts(days);

  // Get average order value
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Stock-out transactions for the period
  const stockOutThisPeriod = await prisma.inventoryTransaction.count({
    where: { type: 'STOCK_OUT', createdAt: { gte: cutoff } },
  });

  // Customer count (last 30 days)
  const newCustomers = await prisma.customer.count({
    where: { createdAt: { gte: cutoff } },
  });

  return {
    overview: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      stockOutThisPeriod,
      newCustomers,
    },
    revenueTrends,
    salesByCategory,
    inventoryStatus,
    topProducts,
  };
}
