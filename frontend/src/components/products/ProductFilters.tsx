'use client';

import { PRODUCT_CATEGORIES } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import type { Company } from '@pharmacy-point/types';

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  companies?: Company[];
  availableCategories?: string[];
}

export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  selectedCompany,
  onCompanyChange,
  onClearFilters,
  hasActiveFilters,
  companies = [],
  availableCategories,
}: ProductFiltersProps) {
  // Use provided categories or fall back to default constants
  const categories = availableCategories || PRODUCT_CATEGORIES;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card card-elevated p-4">
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-label-md text-on-surface-variant">Filter by:</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-label-md text-on-surface-variant">
            Category
          </Label>
          <Select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-filter" className="text-label-md text-on-surface-variant">
            Company
          </Label>
          <Select
            id="company-filter"
            value={selectedCompany}
            onChange={(e) => onCompanyChange(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
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
