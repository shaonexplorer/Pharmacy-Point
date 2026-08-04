'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
}

export function ProductSearch({
  onSearch,
  placeholder = 'Search products...',
  delay = 300,
}: ProductSearchProps) {
  const [value, setValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      if (value.trim() !== '') {
        setIsSearching(true);
        onSearch(value.trim());
        setIsSearching(false);
      }
    }, delay);

    // Only call onSearch when value is empty (clear) or after debounce
    if (value === '') {
      onSearch('');
    }

    return () => clearTimeout(handler);
  }, [value, onSearch, delay]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = value.trim();
      if (trimmed) {
        onSearch(trimmed);
      }
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-10"
        aria-label="Search products"
      />
      {value && (
        <button
          onClick={handleClear}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1',
            'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
          aria-label="Clear search"
          type="button"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
