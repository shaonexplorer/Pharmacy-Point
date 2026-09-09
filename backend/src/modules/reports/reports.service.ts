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
};

/* ─── Collection Report ────────────────────────────────── */

interface CollectionReportSummary {
  totalDue: number;
  totalOverdue30: number;
  totalOverdue60: number;
  totalOverdue90: number;
  totalCustomersWithDue: number;
  agingBuckets: Record<string, number>;
}

/**
 * Get comprehensive collection status report with aging buckets.
 */
export async function getCollectionReport(
  input: { page?: string; limit?: string; overdueDays?: number }
): Promise<{
  summary: CollectionReportSummary;
  customers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    dueAmount: number;
    overdueDays: number | null;
  }>;
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { page, limit, overdueDays } = input;
  const { skip } = parsePagination({ page: String(page), limit: String(limit) });
  const now = new Date();

  // Calculate aging bucket cutoffs
  const cutoff30 = new Date(now);
  cutoff30.setDate(cutoff30.getDate() - 30);
  const cutoff60 = new Date(now);
  cutoff60.setDate(cutoff60.getDate() - 60);
  const cutoff90 = new Date(now);
  cutoff90.setDate(cutoff90.getDate() - 90);

  // Build WHERE conditions for due amounts
  const whereConditions: string[] = ['c.due_amount > 0'];
  const params: Record<string, unknown> = {};

  // Add overdue filtering if specified
  if (overdueDays) {
    if (overdueDays >= 90) {
      whereConditions.push(`EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at < :cutoff90)`);
      params.cutoff90 = cutoff90;
    }
    if (overdueDays >= 60) {
      whereConditions.push(`EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at < :cutoff60)`);
      params.cutoff60 = cutoff60;
    }
    if (overdueDays >= 30) {
      whereConditions.push(`EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at < :cutoff30)`);
      params.cutoff30 = cutoff30;
    }
  }

  const whereClause = whereConditions.join(' AND ');

  // Paginated customers with due amounts and overdue info
  const customerQuery = `
    SELECT c.id, c.name, c.email, c.due_amount as dueAmount,
           CASE
             WHEN EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at < :nowCutoff) THEN 90
             WHEN o.created_at < :cutoff60 THEN 60
             WHEN o.created_at < :cutoff30 THEN 30
             ELSE 0
           END as overdueBucket
    FROM customers c
    ${whereClause === '' ? '' : 'WHERE ' + whereClause}
    ORDER BY c.due_amount DESC
    LIMIT :limit OFFSET :skip
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM customers c
    ${whereClause === '' ? '' : 'WHERE ' + whereClause}
  `;

  const [countResult, customers] = await Promise.all([
    prisma.$queryRaw<RawRow[]>(countQuery as any, params),
    prisma.$queryRaw<RawRow[]>(customerQuery as any, {
      ...params,
      nowCutoff: now,
    }),
  ]);

  const total = Number((countResult as RawRow)[0]?.total ?? 0);

  const customerList = (customers as RawRow[]).map((row) => ({
    id: row.id,
    name: row.name || null,
    email: row.email || null,
    dueAmount: Number(row.dueAmount ?? 0),
    overdueDays: row.overdueBucket ? Number(row.overdueBucket) : null,
  }));

  // Calculate aging buckets
  const bucketCounts: Record<string, number> = { '30-59': 0, '60-89': 0, '90+': 0 };
  const nowCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const c of customerList) {
    if (c.overdueDays && c.overdueDays >= 90) {
      bucketCounts['90+']++;
    } else if (c.overdueDays && c.overdueDays >= 60) {
      bucketCounts['60-89']++;
    } else if (c.overdueDays && c.overdueDays >= 30) {
      bucketCounts['30-59']++;
    }
  }

  const totalOverdue30 = bucketCounts['30-59'] + bucketCounts['60-89'] + bucketCounts['90+'];
  const totalOverdue60 = bucketCounts['60-89'] + bucketCounts['90+'];
  const totalOverdue90 = bucketCounts['90+'];

  // Summary
  const summary: CollectionReportSummary = {
    totalDue: customerList.reduce((sum, c) => sum + c.dueAmount, 0),
    totalOverdue30,
    totalOverdue60,
    totalOverdue90,
    totalCustomersWithDue: customerList.length,
    agingBuckets: bucketCounts,
  };

  return {
    summary,
    customers: customerList,
    pagination: {
      ...buildPagination(total, page, limit),
      total,
    },
  };
}

/* ─── Financial Report ────────────────────────────────── */