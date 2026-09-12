'use client';

/**
 * Floating Procurement Cart Button
 *
 * A persistent floating action button that appears on every authenticated page.
 * Shows the current cart item count as a badge. Clicking it opens the
 * ProcurementCartSheet drawer.
 *
 * Design spec (DESIGN.md → Floating Action):
 *  - Positioned bottom-right, 48px minimum touch target
 *  - Pharma Teal (primary) with shadow on hover
 *  - Item count badge is amber warning when items exist
 */
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProcurementCartSheet } from '@/components/procurement/ProcurementCartSheet';
import { useProcurementCart } from '@/context/ProcurementCartContext';

export function ProcurementCartButton() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { itemCount } = useProcurementCart();

  return (
    <>
      <Button
        variant="default"
        size="lg"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105 transition-transform duration-200"
        onClick={() => setSheetOpen(true)}
        aria-label="Open procurement cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 flex h-5 w-5 min-w-[20px] items-center justify-center rounded-full border-2 border-card bg-warning text-[10px] font-bold text-primary-foreground"
          >
            {itemCount}
          </Badge>
        )}
      </Button>

      <ProcurementCartSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
