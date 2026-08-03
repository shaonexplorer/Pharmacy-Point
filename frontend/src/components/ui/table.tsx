import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Clinical Precision — Table Components
 *
 * Design spec (DESIGN.md → Data Tables):
 *  - Headers: label-md (uppercase, 12px, 600 weight, 0.05em tracking)
 *  - Borders: Subtle bottom border only — NO vertical borders.
 *  - Data cells: body-md (14px, 400 weight)
 *  - Numerical data: data-mono (JetBrains Mono, 14px, 500 weight) for precise alignment
 *  - Zebra-striping: Used in dark mode with 5% luminosity difference between rows
 *
 * Data Tables component spec:
 *  - Row hover: subtle background change
 *  - Selected state: muted background
 */

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card">
      <table
        ref={ref}
        className={cn(
          'w-full text-sm',
          'border-collapse',
          className
        )}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-muted/50', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border transition-colors',
        'hover:bg-surface-container-low',
        'data-[state=selected]:bg-surface-container-low',
        /* Zebra-striping in dark mode — 5% luminosity difference */
        'dark:even:bg-surface-container-lowest/50',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

/* TableHead — label-md (uppercase, 12px, 600 weight, 0.05em letter-spacing) */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 py-2.5',
      'text-left align-middle',
      /* label-md per DESIGN.md: 12px, 600 weight, uppercase, 0.05em tracking */
      'text-xs font-semibold uppercase tracking-[0.05em]',
      'text-on-surface-variant',
      /* Subtle bottom border only — NO vertical borders */
      'border-b border-border',
      'bg-surface-container-low',
      '[&_[data-sortable]]:cursor-pointer [&_[data-sortable]]:select-none',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

/* TableCell — body-md (14px, 400 weight) */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle text-sm text-on-surface',
      /* Subtle bottom border only — NO vertical borders */
      'border-b border-border',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

/* TableCellMono — data-mono (JetBrains Mono, 14px, 500 weight) for numerical data */
const TableCellMono = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle text-sm',
      /* data-mono per DESIGN.md: JetBrains Mono, 14px, 500 weight */
      'font-mono font-medium text-on-surface',
      'border-b border-border',
      className
    )}
    {...props}
  />
));
TableCellMono.displayName = 'TableCellMono';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCellMono };
