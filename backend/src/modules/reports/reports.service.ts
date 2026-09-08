/**
 * Reports service — business logic for sales reporting.
 * Provides aggregated sales data with flexible grouping and filtering.
 */
import { prisma } from '../../config/database';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { SalesReportInput, InventoryReportInput } from './reports.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReportResult = Record<string, any>;

interface RawRow {
  [key: string]: any;
}

interface SalesSummaryData {
  totalRevenue: number;
  transactionCount: number;
  averageBasketSize: number;
  totalUnits: number;
  uniqueProducts: number;
  uniqueCustomers: number;
}

/**
 * Get sales report data with flexible grouping and filtering.
 */
export async function getSalesReport(
  input: SalesReportInput
): Promise<{
  data: ReportResult[];
  summary: SalesSummaryData;
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { groupBy, productId, category, paymentMethod, status, startDate, endDate, page, limit } = input;

  const { skip } = parsePagination({ page: String(page), limit: String(limit) });

  // Determine cutoff date
  const cutoff = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Build WHERE conditions for raw SQL
  const conditions: string[] = ['o.status = :status'];
  const params: Record<string, unknown> = {
    status: status ?? 'COMPLETED',
    cutoff,
    ...(productId ? { productId } : {}),
    ...(category ? { category } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(endDate ? { endDate: new Date(endDate) } : {}),
    limit,
    skip,
  };

  if (!startDate) {
    conditions.push('o.createdAt >= :cutoff');
  }
  if (startDate) {
    conditions.push('o.createdAt >= :startDate');
    params.startDate = new Date(startDate);
  }
  if (endDate) {
    conditions.push('o.createdAt <= :endDate');
  }
  if (productId) {
    conditions.push('oi.productId = :productId');
  }
  if (category) {
    conditions.push('p.category = :category');
  }
  if (paymentMethod) {
    conditions.push('o.paymentMethod = :paymentMethod');
  }

  const whereClause = conditions.join(' AND ');

  // Build GROUP BY and SELECT based on groupBy
  let groupByClause: string[];
  let selectClause: string;
  let orderByClause: string;

  switch (groupBy) {
    case 'category':
      groupByClause = ["COALESCE(p.category, 'Uncategorized')"];
      selectClause = `COALESCE(p.category, 'Uncategorized') as group_label, SUM(oi.price * oi.quantity) as total_sales, COUNT(DISTINCT o.id) as order_count, SUM(oi.quantity) as total_units`;
      orderByClause = 'total_sales DESC';
      break;
    case 'paymentMethod':
      groupByClause = ['o.paymentMethod'];
      selectClause = `o.paymentMethod as group_label, SUM(o.total) as total_sales, COUNT(*) as order_count, SUM(oi.quantity) as total_units`;
      orderByClause = 'total_sales DESC';
      break;
    case 'week':
      groupByClause = ["DATE_FORMAT(o.createdAt, '%Y-%u')"];
      selectClause = `DATE_FORMAT(o.createdAt, '%Y-%u') as group_label, SUM(o.total) as total_sales, COUNT(*) as order_count, SUM(oi.quantity) as total_units`;
      orderByClause = 'group_label ASC';
      break;
    case 'month':
      groupByClause = ["DATE_FORMAT(o.createdAt, '%Y-%m')"];
      selectClause = `DATE_FORMAT(o.createdAt, '%Y-%m') as group_label, SUM(o.total) as total_sales, COUNT(*) as order_count, SUM(oi.quantity) as total_units`;
      orderByClause = 'group_label ASC';
      break;
    case 'day':
    default:
      groupByClause = ["DATE_FORMAT(o.createdAt, '%Y-%m-%d')"];
      selectClause = `DATE_FORMAT(o.createdAt, '%Y-%m-%d') as group_label, SUM(o.total) as total_sales, COUNT(*) as order_count, SUM(oi.quantity) as total_units`;
      orderByClause = 'group_label ASC';
      break;
  }

  const countQuery = `
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    JOIN order_items oi ON oi.orderId = o.id
    JOIN products p ON p.id = oi.productId
    WHERE ${whereClause}
  `;

  const query = `
    SELECT ${selectClause}
    FROM orders o
    JOIN order_items oi ON oi.orderId = o.id
    JOIN products p ON p.id = oi.productId
    WHERE ${whereClause}
    GROUP BY ${groupByClause.join(', ')}
    ORDER BY ${orderByClause}
    LIMIT :limit OFFSET :skip
  `;

  const summaryQuery = `
    SELECT
      SUM(o.total) as total_revenue,
      COUNT(DISTINCT o.id) as transaction_count,
      AVG(o.total) as avg_basket,
      SUM(oi.quantity) as total_units,
      COUNT(DISTINCT oi.productId) as unique_products,
      COUNT(DISTINCT o.customerId) as unique_customers
    FROM orders o
    JOIN order_items oi ON oi.orderId = o.id
    WHERE ${whereClause}
  `;

  // Execute all queries in parallel
  const [countResult, results, summaryResult] = await Promise.all([
    prisma.$queryRaw<RawRow[]>(countQuery as any, params),
    prisma.$queryRaw<RawRow[]>(query as any, params),
    prisma.$queryRaw<RawRow[]>(summaryQuery as any, params),
  ]);

  const total = Number((countResult as RawRow[])[0]?.total ?? 0);

  const data = (results as RawRow[]).map((row) => ({
    groupLabel: row.group_label as string,
    totalSales: Number(row.total_sales ?? 0),
    orderCount: Number(row.order_count ?? 0),
    totalUnits: Number(row.total_units ?? 0),
  }));

  const summary: SalesSummaryData = {
    totalRevenue: Number((summaryResult as RawRow).total_revenue ?? 0),
    transactionCount: Number((summaryResult as RawRow).transaction_count ?? 0),
    averageBasketSize: Number((summaryResult as RawRow).avg_basket ?? 0),
    totalUnits: Number((summaryResult as RawRow).total_units ?? 0),
    uniqueProducts: Number((summaryResult as RawRow).unique_products ?? 0),
    uniqueCustomers: Number((summaryResult as RawRow).unique_customers ?? 0),
  };

  return {
    data,
    summary,
    pagination: {
      ...buildPagination(total, page, limit),
      total,
    },
  };
}

/**
 * Get sales summary metrics for a time period.
 */
export async function getSalesSummary(
  period: string = 'month',
  days: number = 30
): Promise<SalesSummaryData> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const query = `
    SELECT
      SUM(o.total) as total_revenue,
      COUNT(DISTINCT o.id) as transaction_count,
      AVG(o.total) as avg_basket,
      SUM(oi.quantity) as total_units,
      COUNT(DISTINCT oi.productId) as unique_products,
      COUNT(DISTINCT o.customerId) as unique_customers
    FROM orders o
    JOIN order_items oi ON oi.orderId = o.id
    WHERE o.status = 'COMPLETED'
      AND o.createdAt >= :cutoff
  `;

  const [result] = await prisma.$queryRaw<RawRow[]>(query as any, { cutoff });

  return {
    totalRevenue: Number((result as RawRow).total_revenue ?? 0),
    transactionCount: Number((result as RawRow).transaction_count ?? 0),
    averageBasketSize: Number((result as RawRow).avg_basket ?? 0),
    totalUnits: Number((result as RawRow).total_units ?? 0),
    uniqueProducts: Number((result as RawRow).unique_products ?? 0),
    uniqueCustomers: Number((result as RawRow).unique_customers ?? 0),
  };
}

/**
 * Get sales grouped by payment method.
 */
export async function getSalesByPaymentMethod(
  startDate: string,
  endDate: string
): Promise<Array<{ paymentMethod: string; totalSales: number; orderCount: number }>> {
  const query = `
    SELECT o.paymentMethod as paymentMethod,
           SUM(o.total) as total_sales,
           COUNT(*) as order_count
    FROM orders o
    WHERE o.status = 'COMPLETED'
      AND o.createdAt >= :startDate
      AND o.createdAt <= :endDate
    GROUP BY o.paymentMethod
    ORDER BY total_sales DESC
  `;

  const results = await prisma.$queryRaw<RawRow[]>(query as any, { startDate, endDate });

  return (results as RawRow[]).map((row) => ({
    paymentMethod: row.paymentMethod as string,
    totalSales: Number(row.total_sales ?? 0),
    orderCount: Number(row.order_count ?? 0),
  }));
}

// ─── Inventory Report ────────────────────────────────────

/**
 * Get comprehensive inventory report.
 * Includes stock levels, low stock, slow-moving, and expiry warnings.
 */
export async function getInventoryReport(
  input: InventoryReportInput
): Promise<{
  summary: {
    totalProducts: number;
    totalInventoryValue: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringCount: number;
    expiredCount: number;
    slowMovingCount: number;
  };
  lowStockItems: RawRow[];
  slowMovingItems: RawRow[];
  expiringItems: RawRow[];
}> {
  const { slowMovingDays, expiryDays, limit } = input;
  const now = new Date();
  const expiryCutoff = new Date(now);
  expiryCutoff.setDate(expiryCutoff.getDate() + expiryDays);

  // Aggregate metrics
  const [statsResult] = await prisma.$queryRaw<RawRow[]>(
    `SELECT
       COUNT(*) as total_products,
       COALESCE(SUM(p.quantity * p.price), 0) as total_value
     FROM products p
     WHERE p.deleted_at IS NULL` as any
  );

  const totalProducts = Number((statsResult as RawRow).total_products ?? 0);
  const totalInventoryValue = Number((statsResult as RawRow).total_value ?? 0);

  // Low stock: quantity <= COALESCE(lowStockThreshold, lowStock)
  const lowStockItems = await prisma.$queryRaw<RawRow[]>(
    `SELECT p.id, p.name, p.sku, COALESCE(p.category, 'Uncategorized') as category,
            p.quantity, p.price, p.expiry_date, p.batch_no,
            p.low_stock, p.low_stock_threshold
     FROM products p
     WHERE p.deleted_at IS NULL
       AND p.quantity <= COALESCE(p.low_stock_threshold, p.low_stock)
     ORDER BY p.quantity ASC
     LIMIT :limit` as any,
    { limit }
  );

  const lowStockCount = lowStockItems.length;

  // Expiring items (expiryDate between now and now + expiryDays)
  const expiringItems = await prisma.product.findMany({
    where: {
      deletedAt: null,
      expiryDate: { gte: now, lte: expiryCutoff },
      quantity: { gt: 0 },
    },
    orderBy: { expiryDate: 'asc' },
    take: limit,
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      quantity: true,
      price: true,
      expiryDate: true,
      batchNo: true,
      lowStock: true,
      lowStockThreshold: true,
    },
  });

  const expiringCount = expiringItems.length;

  // Expired items (expiryDate < now)
  const [expiredResult] = await prisma.$queryRaw<RawRow[]>(
    `SELECT COUNT(*) as expired_count
     FROM products p
     WHERE p.deleted_at IS NULL
       AND p.expiry_date < :now
       AND p.quantity > 0` as any,
    { now }
  );
  const expiredCount = Number((expiredResult as RawRow).expired_count ?? 0);

  // Slow-moving: no orders in last slowMovingDays
  const slowMovingItems = await prisma.$queryRaw<RawRow[]>(
    `SELECT p.id, p.name, p.sku, COALESCE(p.category, 'Uncategorized') as category,
            p.quantity, p.price, p.expiry_date, p.batch_no
     FROM products p
     WHERE p.deleted_at IS NULL
       AND p.quantity > 0
       AND NOT EXISTS (
         SELECT 1 FROM order_items oi
         JOIN orders o ON o.id = oi.orderId
         WHERE oi.productId = p.id
           AND o.status = 'COMPLETED'
           AND o.created_at >= :cutoff
       )
     ORDER BY p.created_at ASC
     LIMIT :limit` as any,
    {
      cutoff: new Date(now.getTime() - slowMovingDays * 24 * 60 * 60 * 1000),
      limit,
    }
  );

  const slowMovingCount = slowMovingItems.length;

  // In-stock and out-of-stock counts
  const [countsResult] = await prisma.$queryRaw<RawRow[]>(
    `SELECT
       SUM(CASE WHEN p.quantity > 0 AND p.quantity > COALESCE(p.low_stock_threshold, p.low_stock) THEN 1 ELSE 0 END) as in_stock,
       SUM(CASE WHEN p.quantity > 0 AND p.quantity <= COALESCE(p.low_stock_threshold, p.low_stock) THEN 1 ELSE 0 END) as low_stock,
       SUM(CASE WHEN p.quantity = 0 THEN 1 ELSE 0 END) as out_of_stock
     FROM products p
     WHERE p.deleted_at IS NULL` as any
  );

  const inStockCount = Number((countsResult as RawRow).in_stock ?? 0);
  const lowStockCountFinal = Number((countsResult as RawRow).low_stock ?? 0);
  const outOfStockCount = Number((countsResult as RawRow).out_of_stock ?? 0);

  const lowStockItemsWithFlag = lowStockItems.map((item) => ({
    ...item,
    isLowStock: true,
    isExpiringSoon: item.expiryDate
      ? item.expiryDate >= now && item.expiryDate <= expiryCutoff
      : false,
    isSlowMoving: false,
  }));

  const expiringItemsWithFlag = expiringItems.map((item) => ({
    ...item,
    isLowStock: (item.quantity ?? 0) <= (item.lowStock ?? 10),
    isExpiringSoon: true,
    isSlowMoving: false,
  }));

  const slowMovingItemsWithFlag = slowMovingItems.map((item) => ({
    ...item,
    isLowStock: (item.quantity ?? 0) <= (item.lowStock ?? 10),
    isExpiringSoon: item.expiryDate
      ? item.expiryDate >= now && item.expiryDate <= expiryCutoff
      : false,
    isSlowMoving: true,
  }));

  return {
    summary: {
      totalProducts,
      totalInventoryValue,
      inStockCount,
      lowStockCount: lowStockCountFinal,
      outOfStockCount,
      expiringCount,
      expiredCount,
      slowMovingCount,
    },
    lowStockItems: lowStockItemsWithFlag,
    slowMovingItems: slowMovingItemsWithFlag,
    expiringItems: expiringItemsWithFlag,
  };
}
