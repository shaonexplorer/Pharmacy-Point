'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

interface FinancialLine {
  label: string;
  amount: number;
  type?: 'default' | 'discount' | 'tax' | 'total';
}

/**
 * FinancialSummary — the financial calculation / discount breakdown panel
 * from the Stitch POS design.
 *
 * Shows gross subtotal, promotions, concession discounts, tax, and the
 * net total payable.  All monetary figures use `data-mono` (JetBrains Mono)
 * per DESIGN.md for numerical clarity and scam prevention.
 */
export function FinancialSummary({
  subtotal = 0,
  taxRate = 0.085,
  discount = 0,
  pointsDiscount = 0,
  concessionRate = 0,
  customDiscount = 0,
  lines,
  className,
}: {
  /** Gross subtotal before any discounts/tax */
  subtotal?: number;
  /** Tax rate as a decimal (e.g. 0.085 for 8.5%) */
  taxRate?: number;
  /** Promotional / coupon discount (negative) */
  discount?: number;
  /** Points redemption discount (negative, already in dollars) */
  pointsDiscount?: number;
  /** Concession / senior discount rate (e.g. 0.05) */
  concessionRate?: number;
  /** Manual / custom discount (negative) */
  customDiscount?: number;
  /** Override the computed lines entirely (for custom displays) */
  lines?: FinancialLine[];
  className?: string;
}) {
  // If lines are provided, render them directly (flexible mode)
  if (lines) {
    return (
      <div
        className={cn(
          'flex flex-col gap-1.5 bg-surface-container-low p-3 rounded-lg',
          className
        )}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex items-center justify-between font-body-sm text-body-sm"
          >
            <span
              className={cn(
                'text-on-surface-variant',
                line.type === 'total' && 'font-bold text-foreground'
              )}
            >
              {line.label}
            </span>
            <span
              className={cn(
                'font-label-numeric-md text-label-numeric-md',
                line.type === 'discount' && 'text-primary font-semibold',
                line.type === 'tax' && 'text-foreground font-semibold',
                line.type === 'total' && 'text-primary font-bold text-lg'
              )}
            >
              {line.type === 'discount' ? `-$${Math.abs(line.amount).toFixed(2)}` : formatCurrency(line.amount)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Computed mode
  const concessionAmount = subtotal * concessionRate;
  const taxableBase = subtotal - discount - pointsDiscount - concessionAmount;
  const taxAmount = taxableBase * taxRate;
  const total = Math.max(0, subtotal - discount - pointsDiscount - concessionAmount + taxAmount);

  const displayLines: FinancialLine[] = [
    { label: 'Gross Subtotal', amount: subtotal },
    ...(discount !== 0
      ? [{ label: 'Item Promotional Discount', amount: discount, type: 'discount' as const }]
      : []),
    ...(pointsDiscount !== 0
      ? [
          {
            label: 'Loyalty Points Redeemed',
            amount: -pointsDiscount,
            type: 'discount' as const,
          },
        ]
      : []),
    ...(concessionRate > 0
      ? [
          {
            label: `Concession Discount (${Math.round(concessionRate * 100)}%)`,
            amount: -concessionAmount,
            type: 'discount' as const,
          },
        ]
      : []),
    ...(customDiscount !== 0
      ? [{ label: 'Custom Discount', amount: customDiscount, type: 'discount' as const }]
      : []),
    { label: `Tax (${Math.round(taxRate * 100)}%)`, amount: taxAmount, type: 'tax' as const },
    {
      label: 'Total Amount Payable',
      amount: total,
      type: 'total',
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 bg-surface-container-low p-3 rounded-lg',
        className
      )}
    >
      {displayLines.map((line, i) => {
        const isTotal = line.type === 'total';
        const isDiscount = line.type === 'discount';
        const isTax = line.type === 'tax';

        let amountStr: string;
        if (isDiscount) {
          amountStr = `-$${Math.abs(line.amount).toFixed(2)}`;
        } else {
          amountStr = formatCurrency(line.amount);
        }

        return (
          <div
            key={i}
            className={cn(
              'flex items-center justify-between font-body-sm text-body-sm',
              isTotal && 'border-t border-surface-container-high pt-2 mt-1',
              isTotal && 'first:mt-0'
            )}
          >
            <span
              className={cn(
                'text-on-surface-variant',
                isTotal && 'font-label-caps text-label-caps uppercase text-on-surface-variant font-bold'
              )}
            >
              {line.label}
            </span>
            <div
              className={cn(
                'flex items-baseline gap-1',
                isTotal && 'gap-0.5'
              )}
            >
              {isTotal && (
                <span className="font-headline-md text-headline-md text-primary font-bold">USD</span>
              )}
              <span
                className={cn(
                  'font-label-numeric-lg text-label-numeric-lg',
                  isTotal && 'text-on-surface text-2xl font-bold tracking-tight',
                  isDiscount && 'text-primary font-semibold',
                  isTax && 'text-foreground font-semibold'
                )}
              >
                {amountStr}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
