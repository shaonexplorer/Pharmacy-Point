'use client';

import { PRODUCT_CATEGORIES } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card card-elevated p-4">
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-on-surface-variant/50 flex-shrink-0" />
        <span className="text-label-md text-on-surface-variant">Filter by:</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-label-md text-on-surface-variant">
            Category
          </Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger
              id="category-filter"
              className="border-border focus:ring-2 focus:ring-primary/30 w-full"
            >
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-filter" className="text-label-md text-on-surface-variant">
            Company
          </Label>
          <Select value={selectedCompany} onValueChange={onCompanyChange}>
            <SelectTrigger
              id="company-filter"
              className="border-border focus:ring-2 focus:ring-primary/30 w-full"
            >
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
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
        <div className="flex items-center text-body-sm text-on-surface-variant">
          <Filter className="mr-2 h-4 w-4" />
          <span>No active filters</span>
        </div>
      )}
    </div>
  );
}
