/**
 * Reports service — business logic for sales reporting.
 * Provides aggregated sales data with flexible grouping and filtering.
 */
import { prisma } from '../../config/database';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { SalesReportInput } from './reports.dto';

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
