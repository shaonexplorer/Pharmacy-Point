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
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground font-medium">Filter by:</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-sm text-muted-foreground">
            Category
          </Label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'transition-colors duration-200 focus-within:outline-none focus-within:ring-2',
              'focus-within:ring-primary focus-within:ring-offset-2 disabled:cursor-not-allowed',
              'hover:border-muted'
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
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'transition-colors duration-200 focus-within:outline-none focus-within:ring-2',
              'focus-within:ring-primary focus-within:ring-offset-2 disabled:cursor-not-allowed',
              'hover:border-muted'
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
      </div>

      {hasActiveFilters ? (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="transition-colors duration-200 hover:bg-muted"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="flex items-center text-sm text-muted-foreground">
          <Filter className="mr-2 h-4 w-4" />
          <span>No active filters</span>
        </div>
      )}
    </div>
  );
}
