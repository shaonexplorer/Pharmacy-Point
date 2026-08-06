'use client';

import { useState, useEffect, useRef } from 'react';
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

  // Keep a ref to the latest onSearch so the debounced effect doesn't need
  // to re-fire every time the parent passes a new callback reference (which
  // happens on every parent re-render when the callback isn't memoised).
  // Without this, changing the page (or any parent state) would trigger the
  // effect and fire onSearch('') — resetting the page to 1.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      if (value.trim() !== '') {
        setIsSearching(true);
        onSearchRef.current(value.trim());
        setIsSearching(false);
      }
    }, delay);

    // Only call onSearch when value is empty (clear) or after debounce
    if (value === '') {
      onSearchRef.current('');
    }

    return () => clearTimeout(handler);
  }, [value, delay]);

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
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50"
        aria-hidden="true"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          'pl-10 pr-10',
          'transition-all duration-200',
          'focus:ring-2 focus:ring-primary/30 focus:border-primary'
        )}
        aria-label="Search products"
      />
      {value && (
        <button
          onClick={handleClear}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1',
            'text-on-surface-variant/50 hover:text-foreground hover:bg-muted',
            'transition-all duration-200',
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
