'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MaterialSymbols } from '@/components/ui/material-symbols';
import { MedicationCard } from '../shared/MedicationCard';
import { CategoryPills } from './CategoryPills';
import { FefoBanner } from './FefoBanner';
import type { Product, Category } from '@pharmacy-point/types';

/**
 * ProductCatalog — the left-side catalog browsing area of the Clinical
 * Precision POS terminal.
 *
 * Matches the Stitch design (stitch-screens/07-pos-interface.html):
 *  - Barcode/scanner search input with clear button + F1 hotkey
 *  - Optic Scan + filter (camera, tune) buttons
 *  - Category pills (scrollable)
 *  - "In Stock Only" + "Rx Mandatory" toggles
 *  - Dense 3-column medication card grid
 *  - FEFO Batch Prioritizer banner at the bottom
 */
export function ProductCatalog({
  products,
  categories,
  searchQuery,
  onSearchChange,
  onSearchClear,
  selectedCategory,
  onCategoryChange,
  isLoadingCategories = false,
  inStockOnly = false,
  onInStockOnlyChange,
  rxMandatory = false,
  onRxMandatoryChange,
  isLoading = false,
  onAddItem,
  canAddToCart,
  fefoBatchNumber,
  fefoExpiryDate,
  onOverrideBatch,
}: {
  products: Product[];
  categories?: Category[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isLoadingCategories?: boolean;
  inStockOnly?: boolean;
  onInStockOnlyChange?: (v: boolean) => void;
  rxMandatory?: boolean;
  onRxMandatoryChange?: (v: boolean) => void;
  isLoading?: boolean;
  onAddItem: (product: Product) => void;
  canAddToCart?: (product: Product) => boolean;
  fefoBatchNumber?: string;
  fefoExpiryDate?: string;
  onOverrideBatch?: () => void;
}) {
  // Build category pills from the categories list (with count = products in that category)
  const pills = [
    { id: 'all', name: 'All', count: products.length },
    ...(categories ?? []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: products.filter((p) => p.category === cat.name).length,
    })),
  ];

  const visibleProducts = inStockOnly ? products.filter((p) => p.quantity > 0) : products;

  return (
    <section className="flex flex-col gap-3 w-full">
      {/* ── Search, Scan & Filter Module ── */}
      <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row items-center gap-1">
          {/* Barcode Scanner Search Bar */}
          <div className="relative flex-1 w-full flex items-center">
            <MaterialSymbols
              icon="barcode_scanner"
              className="absolute left-2 text-primary text-lg animate-pulse"
            />
            <input
              type="text"
              placeholder="Scan barcode or type medication / generic (F1)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                'w-full bg-surface-container-low text-on-surface font-body-md text-body-md',
                'pl-10 pr-20 py-2 rounded-lg',
                'focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-inner'
              )}
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={onSearchClear}
                className={cn(
                  'p-0.5 text-on-surface-variant hover:text-on-surface',
                  'hover:bg-surface-container rounded transition-colors'
                )}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
              <kbd
                className={cn(
                  'hidden sm:inline-block font-label-numeric-sm text-label-numeric-sm',
                  'bg-surface-container-high text-on-surface-variant',
                  'px-1.5 py-0.5 rounded border border-outline-variant/40'
                )}
              >
                F1
              </kbd>
            </div>
          </div>

          {/* Camera Scan + Filter buttons */}
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              type="button"
              className={cn(
                'flex items-center justify-center gap-1 px-3 py-2',
                'bg-surface-container hover:bg-surface-container-high rounded-lg',
                'text-on-surface transition-colors'
              )}
              title="Camera scan"
            >
              <MaterialSymbols icon="photo_camera" className="text-base text-primary" />
              <span className="font-button-text text-button-text">Optic Scan</span>
            </button>
            <button
              type="button"
              className={cn(
                'p-2 bg-surface-container hover:bg-surface-container-high',
                'text-on-surface-variant rounded-lg transition-colors'
              )}
              title="Custom Formulation / Compounding Item"
            >
              <MaterialSymbols icon="tune" className="text-base" />
            </button>
          </div>
        </div>

        {/* Category Pills + Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
          <CategoryPills
            categories={pills}
            selected={selectedCategory}
            onSelect={onCategoryChange}
          />
          <div className="flex items-center gap-2 ml-auto">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockOnlyChange?.(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-primary accent-primary"
              />
              <span className="font-body-xs text-body-xs text-on-surface-variant">
                In Stock Only
              </span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rxMandatory}
                onChange={(e) => onRxMandatoryChange?.(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-primary accent-primary"
              />
              <span className="font-body-xs text-body-xs text-on-surface-variant">
                Rx Mandatory
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Medication Card Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest p-3 rounded-xl shadow-sm animate-pulse"
            >
              <div className="flex flex-col gap-2">
                <div className="h-4 w-3/4 bg-surface-container rounded" />
                <div className="h-3 w-1/2 bg-surface-container rounded" />
                <div className="h-3 w-full bg-surface-container rounded" />
                <div className="h-4 w-1/4 bg-surface-container rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="bg-surface-container-lowest p-6 rounded-xl text-center">
          <MaterialSymbols
            icon="medication"
            className="mx-auto text-4xl text-on-surface-variant/50"
          />
          <h3 className="mt-2 font-headline-sm text-headline-sm text-foreground">
            No medications found
          </h3>
          <p className="font-body-xs text-body-xs text-on-surface-variant mt-1">
            Try adjusting your search or clearing the category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {visibleProducts.map((product) => (
            <MedicationCard
              key={product.id}
              product={product}
              onAdd={onAddItem}
              canAddToCart={canAddToCart ? canAddToCart(product) : true}
            />
          ))}
        </div>
      )}

      {/* ── FEFO Batch Prioritizer Banner ── */}
      <FefoBanner
        batchNumber={fefoBatchNumber}
        expiryDate={fefoExpiryDate}
        onOverride={onOverrideBatch}
      />
    </section>
  );
}
