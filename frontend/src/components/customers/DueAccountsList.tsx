'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useDueAccounts } from '@/hooks/useCustomers';
import type { Customer } from '@pharmacy-point/types';

/**
 * Clinical Precision — Due Accounts List
 *
 * Lists all customers with outstanding due balances, sourced from
 * GET /api/customers/due-accounts. Supports pagination and overdue-day filtering.
 */
interface DueAccountsListProps {
  /** Only show accounts with balances older than this many days (optional). */
  overdueDays?: number;
  /** Page size for the paginated query (default 10). */
  limit?: number;
}

export function DueAccountsList({ overdueDays = 0, limit = 10 }: DueAccountsListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useDueAccounts({
    page,
    limit,
    overdueDays: overdueDays > 0 ? overdueDays : undefined,
  });

  const accounts: Customer[] = data?.data ?? [];
  const pagination = data?.pagination;

  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;

  const handlePageChange = (newPage: number) => setPage(newPage);

  if (error) {
    return (
      <Card className="border-error/30 bg-error/10 card-elevated">
        <CardContent className="flex items-center gap-2 p-4 text-error">
          <AlertCircle className="h-4 w-4" />
          <p className="text-body-md">
            {error instanceof Error ? error.message : 'Failed to load due accounts.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Due Accounts
        </CardTitle>
        <CardDescription>
          Customers with outstanding balances
          {overdueDays > 0 && ` (overdue ${overdueDays}+ days)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-on-surface-variant">
            <DollarSign className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-body-md">No outstanding balances found.</p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {accounts.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}/dashboard`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-2 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-foreground">{customer.name}</div>
                      {customer.loyaltyTier && (
                        <Badge
                          variant={
                            customer.loyaltyTier === 'Platinum'
                              ? 'default'
                              : customer.loyaltyTier === 'Gold'
                                ? 'default'
                                : customer.loyaltyTier === 'Silver'
                                  ? 'secondary'
                                  : 'outline'
                          }
                          className="text-xs"
                        >
                          {customer.loyaltyTier}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                      {customer.email && <span>{customer.email}</span>}
                      {customer.phone && <span>- {customer.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge
                        variant={Number(customer.dueAmount) > 0 ? 'destructive' : 'secondary'}
                        className="data-mono"
                      >
                        ${Number(customer.dueAmount).toFixed(2)}
                      </Badge>
                      <div className="text-xs text-on-surface-variant">
                        <Calendar className="mb-0.5 mr-1 h-3 w-3 inline" />
                        Updated {new Date(customer.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>

            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={accounts.length}
              itemLabel="accounts"
              onPageChange={handlePageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
