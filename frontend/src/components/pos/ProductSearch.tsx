'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Category } from '@pharmacy-point/types';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  categories?: Category[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  isLoadingCategories?: boolean;
  placeholder?: string;
}

export function ProductSearch({
  value,
  onChange,
  onClear,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  isLoadingCategories = false,
  placeholder = 'Search products by name or SKU...',
}: ProductSearchProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      {/* Category filter — DESIGN.md: "top bar with text input and category filters" */}
      <div className="w-full sm:w-52">
        <Select
          value={selectedCategory}
          onValueChange={onCategoryChange}
          disabled={isLoadingCategories}
        >
          <SelectTrigger className="w-full bg-background border-input text-foreground">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'bg-background border-input pl-10 pr-10',
            'transition-all duration-200',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-primary'
          )}
          aria-label="Search products"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
            aria-label="Clear search"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
