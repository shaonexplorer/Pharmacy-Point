'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * Clinical Precision — Data Table Pagination
 *
 * Shared pagination control for all TanStack Table instances in the app.
 * Consolidates the patterns previously duplicated inline in CompanyTable,
 * CustomerTable, and ProductTable, plus the standalone InventoryPagination.
 *
 * Design spec (DESIGN.md → Status Chips / Data Tables):
 *  - Outline buttons for page navigation per the neutral/action style guide.
 *  - Current page highlighted with primary (Pharma Teal) fill.
 *  - Page size selector supported via `pageSizeOptions` (optional).
 *  - Screen-reader labels for prev/next and aria-current on the active page.
 *  - Ellipsis indicator for large page counts (> 5 pages).
 *
 * Props:
 *  - currentPage: 1-based page index
 *  - totalPages: total number of pages
 *  - totalItems: total rows across all pages (optional — enables "Showing X of Y")
 *  - pageSize: rows displayed on the current page (optional)
 *  - itemLabel: singular label for "Showing X of Y {itemLabel}" (e.g. "companies")
 *  - onPageChange: callback when user navigates to a new page
 */
interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Total rows across all pages — when provided alongside `itemLabel`,
   *  renders a "Showing X of Y {itemLabel}" summary on the left. */
  totalItems?: number;
  /** Number of rows displayed on the current page. */
  pageSize?: number;
  /** Label for the item type (e.g. "companies", "customers", "products"). */
  itemLabel?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemLabel,
}: DataTablePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Render up to 5 page-number buttons centered around the current page.
  // Uses a "sliding window" approach with ellipsis for large page counts.
  function pageNumbers(): number[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = 2;
    if (currentPage <= half) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - half) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      {/* ── Left summary: "Showing X of Y" OR "Page X of Y" ── */}
      <div className="text-body-sm text-on-surface-variant">
        {totalItems !== undefined && itemLabel !== undefined ? (
          <>
            Showing {pageSize ?? 0} of {totalItems} {itemLabel}
          </>
        ) : (
          <>
            Page {currentPage} of {totalPages}
          </>
        )}
      </div>

      {/* ── Right: page navigation ── */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers().map((pageNum) => (
          <Button
            type="button"
            key={pageNum}
            variant={pageNum === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            aria-current={pageNum === currentPage ? 'page' : undefined}
            aria-label={`Page ${pageNum}`}
          >
            {pageNum}
          </Button>
        ))}

        {/* Ellipsis when sliding window creates gaps */}
        {totalPages > 5 && currentPage > 3 && currentPage < totalPages - 2 && (
          <span className="flex h-8 w-8 items-center justify-center text-body-sm text-on-surface-variant">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
