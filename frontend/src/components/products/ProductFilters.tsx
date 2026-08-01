'use client';

import { PRODUCT_CATEGORIES } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Company } from '@pharmacy-point/types';

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  companies?: Company[];
}

export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  selectedCompany,
  onCompanyChange,
  onClearFilters,
  hasActiveFilters,
  companies = [],
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="category-filter" className="text-sm text-muted-foreground">
          Category
        </Label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={cn(
            'h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm',
            'transition-colors focus-within:outline-none focus-within:ring-2',
            'focus-within:ring-ring focus-within:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-filter" className="text-sm text-muted-foreground">
          Company
        </Label>
        <select
          id="company-filter"
          value={selectedCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
          className={cn(
            'h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm',
            'transition-colors focus-within:outline-none focus-within:ring-2',
            'focus-within:ring-ring focus-within:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}

      {!hasActiveFilters && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Filter className="mr-2 h-4 w-4" />
          No active filters
        </div>
      )}
    </div>
  );
}
