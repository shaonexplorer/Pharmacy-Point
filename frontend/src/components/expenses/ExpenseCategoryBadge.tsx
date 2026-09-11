'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ExpenseCategory } from '@pharmacy-point/types';

/**
 * Clinical Precision — Expense Category Badge
 *
 * Maps each expense category to a clinical color and a short label.
 * Following the same pattern as OrderStatusBadge: color-coded badges
 * using the Clinical Precision semantic palette.
 */

interface CategoryStyle {
  label: string;
  className: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  INVENTORY_PURCHASE: {
    label: 'Inventory',
    className: 'bg-secondary/10 text-secondary border-secondary/30',
  },
  UTILITIES: {
    label: 'Utilities',
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  RENT: {
    label: 'Rent',
    className: 'bg-tertiary/10 text-tertiary border-tertiary/30',
  },
  SALARIES: {
    label: 'Salaries',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  MARKETING: {
    label: 'Marketing',
    className: 'bg-secondary/10 text-secondary border-secondary/30',
  },
  SUPPLIES: {
    label: 'Office Supplies',
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  INSURANCE: {
    label: 'Insurance',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    className: 'bg-secondary/10 text-secondary border-secondary/30',
  },
  TAXES: {
    label: 'Taxes',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  OTHER: {
    label: 'Other',
    className: 'bg-muted/20 text-muted-foreground border-border',
  },
};

const FALLBACK_STYLE: CategoryStyle = {
  label: 'Unknown',
  className: 'bg-muted/20 text-muted-foreground border-border',
};

interface ExpenseCategoryBadgeProps {
  category: string;
  className?: string;
}

export function ExpenseCategoryBadge({ category, className }: ExpenseCategoryBadgeProps) {
  const style = CATEGORY_STYLES[category] ?? FALLBACK_STYLE;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs uppercase tracking-wide',
        style.className,
        className
      )}
    >
      {style.label}
    </Badge>
  );
}

/** Export the raw category value for use in forms/dropdowns */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'INVENTORY_PURCHASE',
  'UTILITIES',
  'RENT',
  'SALARIES',
  'MARKETING',
  'SUPPLIES',
  'INSURANCE',
  'MAINTENANCE',
  'TAXES',
  'OTHER',
];
