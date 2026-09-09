/**
 * Reports service — business logic for sales reporting.
 * Provides aggregated sales data with flexible grouping and filtering.
 * Includes data caching for frequently accessed report types.
 */
import { prisma } from '../../config/database';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { SalesReportInput, InventoryReportInput, CustomerReportInput, FinancialReportInput } from './reports.dto';

// Simple in-memory cache for report data (key: cache key, value: {data, timestamp})
const reportCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReportResult = Record<string, any>;

interface RawRow {
  [key: string]: any;
}

/**
 * Generate a consistent cache key for report queries.
 */
function makeCacheKey(prefix: string, input: Record<string, unknown>): string {
  const entries = Object.entries(input).sort(([a], [b]) => String(a).localeCompare(String(b)));
  return `${prefix}:${entries.map(([k, v]) => `${k}=${v}`).join('|')}`;
}

/**
 * Check if cached data is still valid (within TTL).
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
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
 * Uses server-side caching for improved performance on repeated requests.
 */
export async function getSalesReport(
  input: SalesReportInput
): Promise<{
  data: ReportResult[];
  summary: SalesSummaryData;
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { groupBy, productId, category, paymentMethod, status, startDate, endDate, page, limit } = input;

  const cacheKey = makeCacheKey('sales-report', { groupBy, productId, category, paymentMethod, status, startDate, endDate, page, limit });

  // Check cache
  const cached = reportCache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    const { data: cachedData, summary: cachedSummary, pagination: cachedPagination } = cached.data;
    const { skip } = parsePagination({ page: String(page), limit: String(limit) });
    return {
      data: cachedData.data.slice((page - 1) * limit, page * limit),
      summary: cachedSummary,
      pagination: { ...cachedPagination, total: cachedPagination.total },
    };
  }

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

  // Cache the result for future requests
  reportCache.set(cacheKey, {
    data: {
      data,
      summary,
      pagination: {
        ...buildPagination(total, page, limit),
        total,
      },
    },
    timestamp: Date.now(),
  });

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
 * Uses server-side caching for improved performance on repeated requests.
 */
export async function getSalesSummary(
  period: string = 'month',
  days: number = 30
): Promise<SalesSummaryData> {
  const cacheKey = makeCacheKey('sales-summary', { period, days });

  // Check cache
  const cached = reportCache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

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

  const summary: SalesSummaryData = {
    totalRevenue: Number((result as RawRow).total_revenue ?? 0),
    transactionCount: Number((result as RawRow).transaction_count ?? 0),
    averageBasketSize: Number((result as RawRow).avg_basket ?? 0),
    totalUnits: Number((result as RawRow).total_units ?? 0),
    uniqueProducts: Number((result as RawRow).unique_products ?? 0),
    uniqueCustomers: Number((result as RawRow).unique_customers ?? 0),
  };

  // Cache the result for future requests
  reportCache.set(cacheKey, {
    data: summary,
    timestamp: Date.now(),
  });

  return summary;
}

/**
 * Get sales grouped by payment method.
 * Uses server-side caching for improved performance on repeated requests.
 */
export async function getSalesByPaymentMethod(
  startDate: string,
  endDate: string
): Promise<Array<{ paymentMethod: string; totalSales: number; orderCount: number }>> {
  const cacheKey = makeCacheKey('sales-payment-methods', { startDate, endDate });

  // Check cache
  const cached = reportCache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

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

  const data = (results as RawRow[]).map((row) => ({
    paymentMethod: row.paymentMethod as string,
    totalSales: Number(row.total_sales ?? 0),
    orderCount: Number(row.order_count ?? 0),
  }));

  // Cache the result for future requests
  reportCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

// ─── Customer Report ─────────────────────────────────────

/**
 * Get comprehensive customer report with segmentation,
 * loyalty analytics, and due account metrics.
 */
export async function getCustomerReport(
  input: CustomerReportInput
): Promise<{
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    averageSpend: number;
    totalLifetimeSpend: number;
    totalDueAccounts: number;
    totalDueAmount: number;
    tierDistribution: Record<string, number>;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
  };
  customers: RawRow[];
  tierDistribution: Array<{ tier: string; count: number; percentage: number }>;
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { tier, activeDays, hasDueAccounts, page, limit } = input;

  const { skip } = parsePagination({ page: String(page), limit: String(limit) });
  const now = new Date();

  // Build WHERE conditions
  const conditions: string[] = [];
  const params: Record<string, unknown> = { limit, skip };

  if (tier) {
    conditions.push('c.loyalty_tier = :tier');
    params.tier = tier;
  }

  if (activeDays) {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - activeDays);
    conditions.push(`EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at >= :activeCutoff AND o.status = 'COMPLETED')`);
    params.activeCutoff = cutoff;
  }

  if (hasDueAccounts === true) {
    conditions.push('c.due_amount > 0');
  }

  if (hasDueAccounts === false) {
    conditions.push('c.due_amount <= 0');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Main query: paginated customers with order stats
  const query = `
    SELECT c.id, c.name, c.email, c.phone, c.loyalty_tier as loyaltyTier,
           c.loyalty_points as loyaltyPoints, c.lifetime_spend as lifetimeSpend,
           c.due_amount as dueAmount,
           COUNT(DISTINCT o.id) as orderCount,
           MAX(o.created_at) as lastPurchaseDate,
           COUNT(DISTINCT CASE WHEN o.created_at >= :activeCutoff THEN o.id END) > 0 as isActive
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    ${whereClause}
    GROUP BY c.id, c.name, c.email, c.phone, c.loyalty_tier, c.loyalty_points,
             c.lifetime_spend, c.due_amount
    ORDER BY c.lifetime_spend DESC
    LIMIT :limit OFFSET :skip
  `;

  const activeCutoff = new Date(now);
  activeCutoff.setDate(activeCutoff.getDate() - (activeDays ?? 30));
  params.activeCutoff = activeCutoff;

  const [countResult, results] = await Promise.all([
    prisma.$queryRaw<RawRow[]>(`SELECT COUNT(*) as total FROM customers c ${whereClause}` as any, params),
    prisma.$queryRaw<RawRow[]>(query as any, { ...params, activeCutoff }),
  ]);

  const total = Number((countResult as RawRow)[0]?.total ?? 0);

  const customers = (results as RawRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    loyaltyTier: row.loyaltyTier,
    loyaltyPoints: Number(row.loyaltyPoints ?? 0),
    lifetimeSpend: Number(row.lifetimeSpend ?? 0),
    dueAmount: Number(row.dueAmount ?? 0),
    orderCount: Number(row.orderCount ?? 0),
    lastPurchaseDate: row.lastPurchaseDate ? (row.lastPurchaseDate as string) : null,
    isActive: Boolean(row.isActive),
  }));

  // Summary metrics
  const [statsResult] = await prisma.$queryRaw<RawRow[]>(
    `SELECT
       COUNT(*) as total_customers,
       COALESCE(SUM(c.lifetime_spend), 0) as total_lifetime_spend,
       COALESCE(AVG(c.lifetime_spend), 0) as avg_spend,
       SUM(CASE WHEN c.due_amount > 0 THEN 1 ELSE 0 END) as total_due_accounts,
       COALESCE(SUM(c.due_amount), 0) as total_due_amount,
       SUM(CASE WHEN c.loyalty_points > 0 THEN c.loyalty_points ELSE 0 END) as total_points_earned,
       SUM(CASE WHEN c.loyalty_points < 0 THEN ABS(c.loyalty_points) ELSE 0 END) as total_points_redeemed
     FROM customers c` as any
  );

  const totalCustomers = Number((statsResult as RawRow).total_customers ?? 0);
  const totalLifetimeSpend = Number((statsResult as RawRow).total_lifetime_spend ?? 0);
  const averageSpend = Number((statsResult as RawRow).avg_spend ?? 0);
  const totalDueAccounts = Number((statsResult as RawRow).total_due_accounts ?? 0);
  const totalDueAmount = Number((statsResult as RawRow).total_due_amount ?? 0);
  const totalPointsEarned = Number((statsResult as RawRow).total_points_earned ?? 0);
  const totalPointsRedeemed = Number((statsResult as RawRow).total_points_redeemed ?? 0);

  // Active vs inactive counts
  const [activeResult] = await prisma.$queryRaw<RawRow[]>(
    `SELECT
       SUM(CASE WHEN EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at >= :cutoff AND o.status = 'COMPLETED') THEN 1 ELSE 0 END) as active_count,
       SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at >= :cutoff AND o.status = 'COMPLETED') THEN 1 ELSE 0 END) as inactive_count
     FROM customers c` as any,
    { cutoff: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
  );

  const activeCustomers = Number((activeResult as RawRow).active_count ?? 0);
  const inactiveCustomers = Number((activeResult as RawRow).inactive_count ?? 0);

  // Tier distribution
  const tierResults = await prisma.$queryRaw<RawRow[]>(
    `SELECT c.loyalty_tier as tier, COUNT(*) as count
     FROM customers c
     GROUP BY c.loyalty_tier
     ORDER BY count DESC` as any
  );

  const tierDistribution = (tierResults as RawRow[]).map((row) => ({
    tier: row.tier as string,
    count: Number(row.count ?? 0),
    percentage: totalCustomers > 0 ? Math.round((Number(row.count ?? 0) / totalCustomers) * 100) : 0,
  }));

  // Cache the result for future requests
  reportCache.set(cacheKey, {
    data: {
      summary: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        averageSpend,
        totalLifetimeSpend,
        totalDueAccounts,
        totalDueAmount,
        tierDistribution: tierResults.reduce((acc: Record<string, number>, row: RawRow) => {
          acc[(row.tier as string) ?? 'Unknown'] = Number(row.count ?? 0);
          return acc;
        }, {}),
        totalPointsEarned,
        totalPointsRedeemed,
      },
      customers,
      tierDistribution,
      pagination: {
        ...buildPagination(total, page, limit),
        total,
      },
    },
    timestamp: Date.now(),
  });

  return {
    summary: {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      averageSpend,
      totalLifetimeSpend,
      totalDueAccounts,
      totalDueAmount,
      tierDistribution: tierResults.reduce((acc: Record<string, number>, row: RawRow) => {
        acc[(row.tier as string) ?? 'Unknown'] = Number(row.count ?? 0);
        return acc;
      }, {}),
      totalPointsEarned,
      totalPointsRedeemed,
    },
    customers,
    tierDistribution,
    pagination: {
      ...buildPagination(total, page, limit),
      total,
    },
  };
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

// ─── Financial Report ──────────────────────────────────

interface FinancialSummary {
  grossRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  netProfit: number;
  totalOrders: number;
  totalUnits: number;
  averageOrderValue: number;
  totalRefunds: number;
  totalExpenses: number;
}

interface FinancialDataRow {
  groupLabel: string;
  revenue: number;
  cogs: number;
  profit: number;
  orders: number;
}

/**
 * Get comprehensive financial report with profit/loss metrics.
 * Calculates gross revenue, COGS (placeholder for purchase order integration),
 * gross profit, and net profit.
 */
export async function getFinancialReport(
  input: FinancialReportInput
): Promise<{
  summary: FinancialSummary;
  data: FinancialDataRow[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { groupBy, paymentMethod, status, startDate, endDate, page, limit } = input;

  const { skip } = parsePagination({ page: String(page), limit: String(limit) });

  // Determine cutoff date
  const cutoff = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Build WHERE conditions
  const conditions: string[] = ['o.status = :status'];
  const params: Record<string, unknown> = {
    status: status ?? 'COMPLETED',
    cutoff,
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
    params.endDate = new Date(endDate);
  }
  if (paymentMethod) {
    conditions.push('o.paymentMethod = :paymentMethod');
    params.paymentMethod = paymentMethod;
  }

  const whereClause = conditions.join(' AND ');

  // Build GROUP BY
  let groupByClause: string[];
  let selectClause: string;
  let orderByClause: string;

  switch (groupBy) {
    case 'week':
      groupByClause = ["DATE_FORMAT(o.createdAt, '%Y-%u')"];
      selectClause = `DATE_FORMAT(o.createdAt, '%Y-%u') as group_label, SUM(o.total) as revenue, SUM(oi.price * oi.quantity) as cogs, SUM(oi.quantity) as total_units, COUNT(DISTINCT o.id) as orders`;
      orderByClause = 'group_label ASC';
      break;
    case 'month':
      groupByClause = ["DATE_FORMAT(o.createdAt, '%Y-%m')"];
      selectClause = `DATE_FORMAT(o.createdAt, '%Y-%m') as group_label, SUM(o.total) as revenue, SUM(oi.price * oi.quantity) as cogs, SUM(oi.quantity) as total_units, COUNT(DISTINCT o.id) as orders`;
      orderByClause = 'group_label ASC';
      break;
    case 'day':
    default:
      groupByClause = ["DATE_FORMAT(o.createdAt, '%Y-%m-%d')"];
      selectClause = `DATE_FORMAT(o.createdAt, '%Y-%m-%d') as group_label, SUM(o.total) as revenue, SUM(oi.price * oi.quantity) as cogs, SUM(oi.quantity) as total_units, COUNT(DISTINCT o.id) as orders`;
      orderByClause = 'group_label ASC';
      break;
  }

  const countQuery = `
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    JOIN order_items oi ON oi.orderId = o.id
    WHERE ${whereClause}
  `;

  const query = `
    SELECT ${selectClause}
    FROM orders o
    JOIN order_items oi ON oi.orderId = o.id
    WHERE ${whereClause}
    GROUP BY ${groupByClause.join(', ')}
    ORDER BY ${orderByClause}
    LIMIT :limit OFFSET :skip
  `;

  const summaryQuery = `
    SELECT
      COALESCE(SUM(o.total), 0) as gross_revenue,
      COALESCE(SUM(oi.price * oi.quantity), 0) as cost_of_goods_sold,
      COALESCE(SUM(o.total), 0) - COALESCE(SUM(oi.price * oi.quantity), 0) as gross_profit,
      COALESCE(SUM(o.total), 0) - COALESCE(SUM(oi.price * oi.quantity), 0) as net_profit,
      COUNT(DISTINCT o.id) as total_orders,
      SUM(oi.quantity) as total_units,
      COALESCE(AVG(o.total), 0) as avg_order_value,
      COALESCE(SUM(CASE WHEN o.status IN ('REFUNDED', 'PARTIALLY_REFUNDED', 'RETURNED') THEN o.total ELSE 0 END), 0) as total_refunds
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

  const total = Number((countResult as RawRow)[0]?.total ?? 0);

  const data = (results as RawRow[]).map((row) => ({
    groupLabel: row.group_label as string,
    revenue: Number(row.revenue ?? 0),
    cogs: Number(row.cogs ?? 0),
    profit: Number(row.profit ?? 0),
    orders: Number(row.orders ?? 0),
  }));

  const sr = summaryResult as RawRow;
  const summary: FinancialSummary = {
    grossRevenue: Number(sr.gross_revenue ?? 0),
    costOfGoodsSold: Number(sr.cost_of_goods_sold ?? 0),
    grossProfit: Number(sr.gross_profit ?? 0),
    netProfit: Number(sr.net_profit ?? 0),
    totalOrders: Number(sr.total_orders ?? 0),
    totalUnits: Number(sr.total_units ?? 0),
    averageOrderValue: Number(sr.avg_order_value ?? 0),
    totalRefunds: Number(sr.total_refunds ?? 0),
    totalExpenses: 0, // Future: integrate with purchase orders
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
