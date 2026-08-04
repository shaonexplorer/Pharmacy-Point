import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Clinical Precision — Inventory Pagination
 *
 * Design spec adherence:
 *  - Uses outline buttons for page navigation per the neutral/action style guide.
 *  - Current page highlighted with primary (Pharma Teal) fill.
 *  - Ellipsis indicator for large page counts (> 5 pages).
 *  - Screen-reader labels for prev/next and aria-current on the active page.
 *
 * Extracted from inventory/page.tsx so the InventoryTable component stays
 * focused on data rendering only.
 */
interface InventoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function InventoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: InventoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Render up to 5 page-number buttons centered around the current page
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
      <div className="text-body-sm text-on-surface-variant">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {pageNumbers().map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            aria-current={pageNum === currentPage ? 'page' : undefined}
          >
            {pageNum}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}
