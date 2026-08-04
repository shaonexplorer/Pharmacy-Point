'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function ProductSearch({
  value,
  onChange,
  onClear,
  placeholder = 'Search products by name or SKU...',
}: ProductSearchProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'bg-background border-border pl-10 pr-10',
          'transition-colors duration-200',
          'focus-visible:ring-primary/50'
        )}
        aria-label="Search products"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
          aria-label="Clear search"
          type="button"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
