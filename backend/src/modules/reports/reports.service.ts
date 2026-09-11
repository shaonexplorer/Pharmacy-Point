/**
 * Reports service — business logic for sales reporting.
 * Provides aggregated sales data with flexible grouping and filtering.
 */
import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type {
  SalesReportInput,
  InventoryReportInput,
  CustomerReportInput,
  FinancialReportInput,
  CollectionReportInput,
} from './reports.dto';

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
 * Build a WHERE clause as Prisma.Sql fragments from optional conditions.
 */
function buildWhereClause(conditions: Prisma.Sql[]): Prisma.Sql {
  if (conditions.length === 0) return Prisma.sql``;
  if (conditions.length === 1) return conditions[0];
  return conditions.reduce((acc, cond) => Prisma.sql`${acc} AND ${cond}`);
}

/**
 * Get sales report data with flexible grouping and filtering.
 */
export async function getSalesReport(input: SalesReportInput): Promise<{
  data: ReportResult[];
  summary: SalesSummaryData;
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { groupBy, productId, category, paymentMethod, status, startDate, endDate, page, limit } =
    input;

  const { skip } = parsePagination({ page: String(page), limit: String(limit) });

  const cutoff = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const conditions: Prisma.Sql[] = [
    Prisma.sql`o.status::text = ${(status ?? 'COMPLETED') as string}`,
  ];

  if (!startDate) {
    conditions.push(Prisma.sql`o."createdAt" >= ${cutoff}`);
  }
  if (startDate) {
    conditions.push(Prisma.sql`o."createdAt" >= ${new Date(startDate)}`);
  }
  if (endDate) {
    conditions.push(Prisma.sql`o."createdAt" <= ${new Date(endDate)}`);
  }
  if (productId) {
    conditions.push(Prisma.sql`oi."productId" = ${productId}`);
  }
  if (category) {
    conditions.push(Prisma.sql`p.category = ${category}`);
  }
  if (paymentMethod) {
    conditions.push(Prisma.sql`o."paymentMethod" = ${paymentMethod}`);
  }

  const whereClause = buildWhereClause(conditions);

  let selectClause: Prisma.Sql;
  let groupByClause: Prisma.Sql;
  let orderByClause: Prisma.Sql;

  switch (groupBy) {
    case 'category':
      selectClause = Prisma.sql`COALESCE(p.category, 'Uncategorized') as group_label, SUM(oi.price * oi.quantity) as total_sales, COUNT(DISTINCT o.id) as order_count, SUM(oi.quantity) as total_units`;
      groupByClause = Prisma.sql`COALESCE(p.category, 'Uncategorized')`;
      orderByClause = Prisma.sql`total_sales DESC`;
      break;
    case 'paymentMethod':
      selectClause = Prisma.sql`o."paymentMethod" as group_label, SUM(o.total) as total_sales, COUNT(*) as order_count, SUM(oi.quantity) as total_units`;
      groupByClause = Prisma.sql`o."paymentMethod"`;
      orderByClause = Prisma.sql`total_sales DESC`;
      break;
    case 'week':
      selectClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-WW') as group_label, SUM(o.total) as total_sales, COUNT(*) as order_count, SUM(oi.quantity) as total_units`;
      groupByClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-WW')`;
      orderByClause = Prisma.sql`group_label ASC`;
      break;
    case 'month':
      selectClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-MM') as group_label, SUM(o.total) as total_sales, COUNT(*) as order_count, SUM(oi.quantity) as total_units`;
      groupByClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-MM')`;
      orderByClause = Prisma.sql`group_label ASC`;
      break;
    case 'day':
    default:
      selectClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-MM-DD') as group_label, SUM(o.total) as total_sales, COUNT(*) as order_count, SUM(oi.quantity) as total_units`;
      groupByClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-MM-DD')`;
      orderByClause = Prisma.sql`group_label ASC`;
      break;
  }


  const countQuery = Prisma.sql`
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    JOIN order_items oi ON oi."orderId" = o.id
    JOIN products p ON p.id = oi."productId"
    WHERE ${whereClause}
  `;

  const query = Prisma.sql`
    SELECT ${selectClause}
    FROM orders o
    JOIN order_items oi ON oi."orderId" = o.id
    JOIN products p ON p.id = oi."productId"
    WHERE ${whereClause}
    GROUP BY ${groupByClause}
    ORDER BY ${orderByClause}
    LIMIT ${limit} OFFSET ${skip}
  `;

  const summaryQuery = Prisma.sql`
    SELECT
      SUM(o.total) as total_revenue,
      COUNT(DISTINCT o.id) as transaction_count,
      AVG(o.total) as avg_basket,
      SUM(oi.quantity) as total_units,
      COUNT(DISTINCT oi."productId") as unique_products,
      COUNT(DISTINCT o."customerId") as unique_customers
    FROM orders o
    JOIN order_items oi ON oi."orderId" = o.id
    WHERE ${whereClause}
  `;

  const [countResult, results, summaryResult] = await Promise.all([
    prisma.$queryRaw<RawRow[]>(countQuery),
    prisma.$queryRaw<RawRow[]>(query),
    prisma.$queryRaw<RawRow[]>(summaryQuery),
  ]);

  const total = Number((countResult as RawRow[])[0]?.total ?? 0);

  const data = (results as RawRow[]).map((row) => ({
    groupLabel: row.group_label as string,
    totalSales: Number(row.total_sales ?? 0),
    orderCount: Number(row.order_count ?? 0),
    totalUnits: Number(row.total_units ?? 0),
  }));

  const summary: SalesSummaryData = {
    totalRevenue: Number(((summaryResult as RawRow[])[0]).total_revenue ?? 0),
    transactionCount: Number(((summaryResult as RawRow[])[0]).transaction_count ?? 0),
    averageBasketSize: Number(((summaryResult as RawRow[])[0]).avg_basket ?? 0),
    totalUnits: Number(((summaryResult as RawRow[])[0]).total_units ?? 0),
    uniqueProducts: Number(((summaryResult as RawRow[])[0]).unique_products ?? 0),
    uniqueCustomers: Number(((summaryResult as RawRow[])[0]).unique_customers ?? 0),
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

  const results = await prisma.$queryRaw<RawRow[]>`
    SELECT
      SUM(o.total) as total_revenue,
      COUNT(DISTINCT o.id) as transaction_count,
      AVG(o.total) as avg_basket,
      SUM(oi.quantity) as total_units,
      COUNT(DISTINCT oi."productId") as unique_products,
      COUNT(DISTINCT o."customerId") as unique_customers
    FROM orders o
    JOIN order_items oi ON oi."orderId" = o.id
    WHERE o.status::text = ${'COMPLETED'}
      AND o."createdAt" >= ${cutoff}
  `;

  const result = results[0];
  return {
    totalRevenue: Number((result as RawRow)?.total_revenue ?? 0),
    transactionCount: Number((result as RawRow)?.transaction_count ?? 0),
    averageBasketSize: Number((result as RawRow)?.avg_basket ?? 0),
    totalUnits: Number((result as RawRow)?.total_units ?? 0),
    uniqueProducts: Number((result as RawRow)?.unique_products ?? 0),
    uniqueCustomers: Number((result as RawRow)?.unique_customers ?? 0),
  };
}

/**
 * Get sales grouped by payment method.
 */
export async function getSalesByPaymentMethod(
  startDate: string,
  endDate: string
): Promise<Array<{ paymentMethod: string; totalSales: number; orderCount: number }>> {
  const results = await prisma.$queryRaw<RawRow[]>`
    SELECT o."paymentMethod" as paymentMethod,
           SUM(o.total) as total_sales,
           COUNT(*) as order_count
    FROM orders o
    WHERE o.status::text = ${'COMPLETED'}
      AND o."createdAt" >= ${new Date(startDate)}
      AND o."createdAt" <= ${new Date(endDate)}
    GROUP BY o."paymentMethod"
    ORDER BY total_sales DESC
  `;

  return (results as RawRow[]).map((row) => ({
    paymentMethod: row.paymentMethod as string,
    totalSales: Number(row.total_sales ?? 0),
    orderCount: Number(row.order_count ?? 0),
  }));
}

// ─── Customer Report ─────────────────────────────────────

/**
 * Get comprehensive customer report with segmentation,
 * loyalty analytics, and due account metrics.
 */
export async function getCustomerReport(input: CustomerReportInput): Promise<{
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
  const activeCutoff = new Date(now);
  activeCutoff.setDate(activeCutoff.getDate() - (activeDays ?? 30));

  // Build WHERE conditions using Prisma.Sql fragments
  const conditions: Prisma.Sql[] = [];

  if (tier) {
    conditions.push(Prisma.sql`c."loyaltyTier" = ${tier}`);
  }
  if (activeDays) {
    conditions.push(
      Prisma.sql`EXISTS (SELECT 1 FROM orders o WHERE o."customerId" = c.id AND o."createdAt" >= ${activeCutoff} AND o.status = 'COMPLETED')`
    );
  }
  if (hasDueAccounts === true) {
    conditions.push(Prisma.sql`c."dueAmount" > 0`);
  }
  if (hasDueAccounts === false) {
    conditions.push(Prisma.sql`c."dueAmount" <= 0`);
  }

  const whereClause = buildWhereClause(conditions);

  const mainQuery = Prisma.sql`
    SELECT c.id, c.name, c.email, c.phone, c."loyaltyTier" as loyaltyTier,
           c."loyaltyPoints" as loyaltyPoints, c."lifetimeSpend" as lifetimeSpend,
           c."dueAmount" as dueAmount,
           COUNT(DISTINCT o.id) as orderCount,
           MAX(o."createdAt") as lastPurchaseDate,
           COUNT(DISTINCT CASE WHEN o."createdAt" >= ${activeCutoff} THEN o.id END) > 0 as isActive
    FROM customers c
    LEFT JOIN orders o ON o."customerId" = c.id
    WHERE ${whereClause}
    GROUP BY c.id, c.name, c.email, c.phone, c."loyaltyTier", c."loyaltyPoints",
             c."lifetimeSpend", c."dueAmount"
    ORDER BY c."lifetimeSpend" DESC
    LIMIT ${limit} OFFSET ${skip}
  `;

  const countQuery = Prisma.sql`
    SELECT COUNT(*) as total
    FROM customers c
    WHERE ${whereClause}
  `;

  const [countResult, results] = await Promise.all([
    prisma.$queryRaw<RawRow[]>(countQuery),
    prisma.$queryRaw<RawRow[]>(mainQuery),
  ]);

  const total = Number((countResult as RawRow[])[0]?.total ?? 0);

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
  const [statsResult] = await prisma.$queryRaw<RawRow[]>`
    SELECT
       COUNT(*) as total_customers,
       COALESCE(SUM(c."lifetimeSpend"), 0) as total_lifetime_spend,
       COALESCE(AVG(c."lifetimeSpend"), 0) as avg_spend,
       SUM(CASE WHEN c."dueAmount" > 0 THEN 1 ELSE 0 END) as total_due_accounts,
       COALESCE(SUM(c."dueAmount"), 0) as total_due_amount,
       SUM(CASE WHEN c."loyaltyPoints" > 0 THEN c."loyaltyPoints" ELSE 0 END) as total_points_earned,
       SUM(CASE WHEN c."loyaltyPoints" < 0 THEN ABS(c."loyaltyPoints") ELSE 0 END) as total_points_redeemed
     FROM customers c
  `;

  const totalCustomers = Number((statsResult as RawRow).total_customers ?? 0);
  const totalLifetimeSpend = Number((statsResult as RawRow).total_lifetime_spend ?? 0);
  const averageSpend = Number((statsResult as RawRow).avg_spend ?? 0);
  const totalDueAccounts = Number((statsResult as RawRow).total_due_accounts ?? 0);
  const totalDueAmount = Number((statsResult as RawRow).total_due_amount ?? 0);
  const totalPointsEarned = Number((statsResult as RawRow).total_points_earned ?? 0);
  const totalPointsRedeemed = Number((statsResult as RawRow).total_points_redeemed ?? 0);

  // Active vs inactive counts
  const [activeResult] = await prisma.$queryRaw<RawRow[]>`
    SELECT
       SUM(CASE WHEN EXISTS (SELECT 1 FROM orders o WHERE o."customerId" = c.id AND o."createdAt" >= ${activeCutoff} AND o.status = 'COMPLETED') THEN 1 ELSE 0 END) as active_count,
       SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM orders o WHERE o."customerId" = c.id AND o."createdAt" >= ${activeCutoff} AND o.status = 'COMPLETED') THEN 1 ELSE 0 END) as inactive_count
     FROM customers c
  `;

  const activeCustomers = Number((activeResult as RawRow).active_count ?? 0);
  const inactiveCustomers = Number((activeResult as RawRow).inactive_count ?? 0);

  // Tier distribution
  const tierResults = await prisma.$queryRaw<RawRow[]>`
    SELECT c."loyaltyTier" as tier, COUNT(*) as count
    FROM customers c
    GROUP BY c."loyaltyTier"
    ORDER BY count DESC
  `;

  const tierDistribution = (tierResults as RawRow[]).map((row) => ({
    tier: row.tier as string,
    count: Number(row.count ?? 0),
    percentage:
      totalCustomers > 0 ? Math.round((Number(row.count ?? 0) / totalCustomers) * 100) : 0,
  }));

  return {
    summary: {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      averageSpend,
      totalLifetimeSpend,
      totalDueAccounts,
      totalDueAmount,
      tierDistribution: (tierResults as RawRow[]).reduce(
        (acc: Record<string, number>, row: RawRow) => {
          acc[(row.tier as string) ?? 'Unknown'] = Number(row.count ?? 0);
          return acc;
        },
        {}
      ),
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
export async function getInventoryReport(input: InventoryReportInput): Promise<{
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
  const [statsResult] = await prisma.$queryRaw<RawRow[]>`
    SELECT
       COUNT(*) as total_products,
       COALESCE(SUM(p.quantity * p.price), 0) as total_value
     FROM products p
     WHERE p."deletedAt" IS NULL
  `;

  const totalProducts = Number((statsResult as RawRow).total_products ?? 0);
  const totalInventoryValue = Number((statsResult as RawRow).total_value ?? 0);

  // Low stock: quantity <= COALESCE(lowStockThreshold, lowStock)
  const lowStockItems = await prisma.$queryRaw<RawRow[]>`
    SELECT p.id, p.name, p.sku, COALESCE(p.category, 'Uncategorized') as category,
            p.quantity, p.price, p."expiryDate", p."batchNo",
            p."lowStock", p."lowStockThreshold"
    FROM products p
    WHERE p."deletedAt" IS NULL
      AND p.quantity <= COALESCE(p."lowStockThreshold", p."lowStock")
    ORDER BY p.quantity ASC
    LIMIT ${limit}
  `;

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
  const [expiredResult] = await prisma.$queryRaw<RawRow[]>`
    SELECT COUNT(*) as expired_count
    FROM products p
    WHERE p."deletedAt" IS NULL
      AND p."expiryDate" < ${now}
      AND p.quantity > 0
  `;
  const expiredCount = Number((expiredResult as RawRow).expired_count ?? 0);

  // Slow-moving: no orders in last slowMovingDays
  const slowMovingCutoff = new Date(now.getTime() - slowMovingDays * 24 * 60 * 60 * 1000);
  const slowMovingItems = await prisma.$queryRaw<RawRow[]>`
    SELECT p.id, p.name, p.sku, COALESCE(p.category, 'Uncategorized') as category,
            p.quantity, p.price, p."expiryDate", p."batchNo"
    FROM products p
    WHERE p."deletedAt" IS NULL
      AND p.quantity > 0
      AND NOT EXISTS (
        SELECT 1 FROM order_items oi
        JOIN orders o ON o.id = oi."orderId"
        WHERE oi."productId" = p.id
          AND o.status = 'COMPLETED'
          AND o."createdAt" >= ${slowMovingCutoff}
      )
    ORDER BY p."createdAt" ASC
    LIMIT ${limit}
  `;

  const slowMovingCount = slowMovingItems.length;

  // In-stock and out-of-stock counts
  const [countsResult] = await prisma.$queryRaw<RawRow[]>`
    SELECT
       SUM(CASE WHEN p.quantity > 0 AND p.quantity > COALESCE(p."lowStockThreshold", p."lowStock") THEN 1 ELSE 0 END) as in_stock,
       SUM(CASE WHEN p.quantity > 0 AND p.quantity <= COALESCE(p."lowStockThreshold", p."lowStock") THEN 1 ELSE 0 END) as low_stock,
       SUM(CASE WHEN p.quantity = 0 THEN 1 ELSE 0 END) as out_of_stock
     FROM products p
     WHERE p."deletedAt" IS NULL
  `;

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
export async function getFinancialReport(input: FinancialReportInput): Promise<{
  summary: FinancialSummary;
  data: FinancialDataRow[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { groupBy, paymentMethod, status, startDate, endDate, page, limit } = input;

  const { skip } = parsePagination({ page: String(page), limit: String(limit) });

  const cutoff = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Build WHERE conditions
  const conditions: Prisma.Sql[] = [
    Prisma.sql`o.status::text = ${(status ?? 'COMPLETED') as string}`,
  ];

  if (!startDate) {
    conditions.push(Prisma.sql`o."createdAt" >= ${cutoff}`);
  }
  if (startDate) {
    conditions.push(Prisma.sql`o."createdAt" >= ${new Date(startDate)}`);
  }
  if (endDate) {
    conditions.push(Prisma.sql`o."createdAt" <= ${new Date(endDate)}`);
  }
  if (paymentMethod) {
    conditions.push(Prisma.sql`o."paymentMethod" = ${paymentMethod}`);
  }

  const whereClause = buildWhereClause(conditions);

  // Build SELECT / GROUP BY
  let selectClause: Prisma.Sql;
  let groupByClause: Prisma.Sql;

  switch (groupBy) {
    case 'week':
      selectClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-WW') as group_label, SUM(o.total) as revenue, SUM(oi.price * oi.quantity) as cogs, SUM(oi.quantity) as total_units, COUNT(DISTINCT o.id) as orders`;
      groupByClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-WW')`;
      break;
    case 'month':
      selectClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-MM') as group_label, SUM(o.total) as revenue, SUM(oi.price * oi.quantity) as cogs, SUM(oi.quantity) as total_units, COUNT(DISTINCT o.id) as orders`;
      groupByClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-MM')`;
      break;
    case 'day':
    default:
      selectClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-MM-DD') as group_label, SUM(o.total) as revenue, SUM(oi.price * oi.quantity) as cogs, SUM(oi.quantity) as total_units, COUNT(DISTINCT o.id) as orders`;
      groupByClause = Prisma.sql`TO_CHAR(o."createdAt", 'YYYY-MM-DD')`;
      break;
  }

  const countQuery = Prisma.sql`
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    JOIN order_items oi ON oi."orderId" = o.id
    WHERE ${whereClause}
  `;

  const query = Prisma.sql`
    SELECT ${selectClause}
    FROM orders o
    JOIN order_items oi ON oi."orderId" = o.id
    WHERE ${whereClause}
    GROUP BY ${groupByClause}
    ORDER BY group_label ASC
    LIMIT ${limit} OFFSET ${skip}
  `;

  const summaryQuery = Prisma.sql`
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
    JOIN order_items oi ON oi."orderId" = o.id
    WHERE ${whereClause}
  `;

  const [countResult, results, summaryResult] = await Promise.all([
    prisma.$queryRaw<RawRow[]>(countQuery),
    prisma.$queryRaw<RawRow[]>(query),
    prisma.$queryRaw<RawRow[]>(summaryQuery),
  ]);

  const total = Number((countResult as RawRow[])[0]?.total ?? 0);

  const data = (results as RawRow[]).map((row) => ({
    groupLabel: row.group_label as string,
    revenue: Number(row.revenue ?? 0),
    cogs: Number(row.cogs ?? 0),
    profit: Number(row.profit ?? 0),
    orders: Number(row.orders ?? 0),
  }));

  const sr = (summaryResult as RawRow[])[0];
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
    summary,
    data,
    pagination: {
      ...buildPagination(total, page, limit),
      total,
    },
  };
}

/**
 * Get comprehensive collection status report with aging buckets.
 * Returns customers with outstanding due amounts, grouped by debt age.
 */
export async function getCollectionReport(input: CollectionReportInput): Promise<{
  summary: {
    totalCustomers: number;
    totalDueAmount: number;
    agingBuckets: { bucket: string; count: number; amount: number }[];
  };
  data: ReportResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { page, limit, overdueDays } = input;
  const { skip } = parsePagination({ page: String(page), limit: String(limit) });

  const where: Record<string, unknown> = { dueAmount: { gt: 0 } };

  if (overdueDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - overdueDays);
    where.orders = { some: { createdAt: { lt: cutoff } } };
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dueAmount: 'desc' },
      include: { orders: true },
    }),
    prisma.customer.count({ where }),
  ]);

  const now = new Date();
  const agingBuckets = [
    { bucket: '0-30 days', count: 0, amount: 0 },
    { bucket: '31-60 days', count: 0, amount: 0 },
    { bucket: '61-90 days', count: 0, amount: 0 },
    { bucket: '90+ days', count: 0, amount: 0 },
  ];

  const data = customers.map((c) => {
    const dueAmount = Number(c.dueAmount ?? 0);
    const lastOrderDate = c.orders.length
      ? new Date(Math.max(...c.orders.map((o) => new Date(o.createdAt).getTime())))
      : new Date(c.createdAt);
    const daysOverdue = Math.floor(
      (now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let bucketIndex = 0;
    if (daysOverdue > 90) bucketIndex = 3;
    else if (daysOverdue > 60) bucketIndex = 2;
    else if (daysOverdue > 30) bucketIndex = 1;

    agingBuckets[bucketIndex].count += 1;
    agingBuckets[bucketIndex].amount += dueAmount;

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      dueAmount,
      daysOverdue,
      orderCount: c.orders.length,
      lastOrderDate: lastOrderDate.toISOString(),
    };
  });

  const totalDueAmount = customers.reduce((sum, c) => sum + Number(c.dueAmount ?? 0), 0);

  return {
    summary: {
      totalCustomers: total,
      totalDueAmount,
      agingBuckets: agingBuckets.map((b) => ({ ...b, amount: Number(b.amount.toFixed(2)) })),
    },
    data,
    pagination: {
      ...buildPagination(total, page, limit),
      total,
    },
  };
}
