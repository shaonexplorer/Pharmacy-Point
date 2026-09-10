'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MaterialSymbols } from '@/components/ui/material-symbols';
import { formatCurrency } from '@/lib/formatters';
import { CartLineItem } from '../shared/CartLineItem';
import { FinancialSummary } from '../shared/FinancialSummary';
import { ClinicalAlert } from '../shared/ClinicalAlert';
import { TenderPanel } from './TenderPanel';
import { BillHeader } from './BillHeader';
import { DueAccountBanner } from './DueAccountBanner';
import { PrescriberInput } from './PrescriberInput';
import type { CartItem } from '@/context/PosContext';
import type { Customer } from '@pharmacy-point/types';
import { cn } from '@/lib/utils';

/**
 * ActiveBill — the right-side cart + checkout container for the Clinical
 * Precision POS terminal.
 *
 * Matches the Stitch design structure:
 *  1. BillHeader — Bill # + customer type + hold/clear
 *  2. Customer selector + DueAccountBanner (credit/due alert)
 *  3. ClinicalAlert — drug interaction / allergy warning
 *  4. PrescriberInput — doctor name / license
 *  5. Dense cart line items table (12-col grid header + scrollable rows)
 *  6. FinancialSummary — totals breakdown
 *  7. TenderPanel — payment methods + cash calculation + action buttons
 *
 * All monetary values use `data-mono` (JetBrains Mono) per DESIGN.md.
 */
export function ActiveBill({
  // Cart data
  items,
  subtotal,
  taxAmount,
  total,
  taxRate,
  isCartEmpty,

  // Cart actions
  onUpdateQuantity,
  onRemove,
  onClearCart,

  // Customer
  customers,
  selectedCustomerId,
  onCustomerChange,
  customerDueAmount,

  // Prescriber
  prescriberName,
  onPrescriberChange,

  // Payment
  processing,
  onProcessSale,
  onHoldBill,
  onCancelOrder,

  // Loyalty / credit
  loyaltyPoints,
  loyaltyTier,
  redeemedPoints,
  isCreditSale,
  onRedeemPoints,
  onCreditSaleToggle,
  onTenderSelect,

  // Alerts
  showAllergyAlert = false,
  allergyAlertMessage = 'Penicillin Allergy Alert! Verify Amoxicillin cross-reactivity.',

  // Bill info
  billNumber = 'RX-89412',
  prescriberPlaceholder = 'Prescribing Doctor Name / License',

  className,
}: {
  // Cart data
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  isCartEmpty: boolean;

  // Cart actions
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClearCart: () => void;

  // Customer
  customers: Customer[];
  selectedCustomerId: string | null;
  onCustomerChange: (customerId: string | null) => void;
  customerDueAmount: number;

  // Prescriber
  prescriberName?: string;
  onPrescriberChange?: (value: string) => void;

  // Payment
  processing?: boolean;
  onProcessSale?: () => void;
  onHoldBill?: () => void;
  onCancelOrder?: () => void;

  // Loyalty / credit
  loyaltyPoints?: number;
  loyaltyTier?: string;
  redeemedPoints?: number;
  isCreditSale?: boolean;
  onRedeemPoints?: (pts: number) => void;
  onCreditSaleToggle?: (v: boolean) => void;
  onTenderSelect?: (method: 'cash' | 'card' | 'mobile' | 'due') => void;

  // Alerts
  showAllergyAlert?: boolean;
  allergyAlertMessage?: string;

  // Bill info
  billNumber?: string;
  prescriberPlaceholder?: string;

  className?: string;
}) {
  // Calculate line items text for the table header
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside
      className={cn(
        'w-full lg:w-[100%] flex flex-col gap-2',
        'bg-surface-container-lowest p-3 rounded-xl shadow-sm',
        className
      )}
    >
      {/* ── Bill Header ── */}
      <BillHeader billNumber={billNumber} onHold={onHoldBill} onClear={onClearCart} />

      {/* ── Customer / Credit Selector ── */}
      <div className="flex flex-col gap-1.5 mt-1.5">
        <div className="flex items-center justify-between">
          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant">
            Registered Customer / Patient
          </label>
          <a href="#" className="font-button-text text-button-text text-primary hover:underline">
            + New Customer
          </a>
        </div>

        {/* Customer Selector — native select styled per Clinical Precision */}
        <select
          value={selectedCustomerId ?? ''}
          onChange={(e) => onCustomerChange(e.target.value || null)}
          className={cn(
            'w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm',
            'px-2 py-1.5 rounded-lg border border-outline-variant/40',
            'focus:outline-none focus:ring-1 focus:ring-primary shadow-inner',
            'appearance-none'
          )}
        >
          <option value="">Walk-in Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
              {customer.phone ? ` (${customer.phone})` : ''}
            </option>
          ))}
        </select>

        {/* Due Account Banner (shows when customer has outstanding balance) */}
        <DueAccountBanner
          customerName={customers.find((c) => c.id === selectedCustomerId)?.name}
          customerId={selectedCustomerId}
          dueAmount={customerDueAmount}
        />
      </div>

      {/* ── Clinical Alert — Drug Interaction / Allergy Warning ── */}
      {showAllergyAlert && (
        <ClinicalAlert
          title="Penicillin Allergy Alert!"
          message={allergyAlertMessage}
          variant="error"
        />
      )}

      {/* ── Prescriber Input ── */}
      <PrescriberInput
        value={prescriberName}
        onChange={onPrescriberChange}
        placeholder={prescriberPlaceholder}
      />

      {/* ── Cart Line Items Table ── */}
      <div className="flex flex-col overflow-hidden rounded-lg">
        {/* Table Header — 12-column grid */}
        <div className="grid grid-cols-12 px-2 py-1 bg-surface-container font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
          <div className="col-span-5">Medication &amp; Form</div>
          <div className="col-span-3 text-center">Qty</div>
          <div className="col-span-2 text-right">Unit</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {/* Scrollable Line Items / Empty State */}
        <div className="flex flex-col max-h-56 overflow-y-auto divide-y divide-surface-container-high/40 bg-surface-container-lowest">
          {isCartEmpty ? (
            <div className="py-8 text-center">
              <MaterialSymbols
                icon="shopping_cart"
                className="mx-auto text-3xl text-on-surface-variant/30"
              />
              <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
                The cart is empty — search and add medications to start a sale.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <CartLineItem
                key={item.productId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Financial Summary ── */}
      <FinancialSummary
        subtotal={subtotal}
        taxRate={taxRate}
        discount={0}
        pointsDiscount={redeemedPoints ? redeemedPoints / 100 : 0}
        customDiscount={0}
      />

      {/* ── Loyalty & Credit Sale Options ── */}
      {selectedCustomerId && loyaltyPoints && loyaltyPoints > 0 && (
        <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
          <div className="flex items-center gap-2">
            <MaterialSymbols icon="star" className="text-sm text-warning" />
            <span className="font-body-xs text-body-xs text-on-surface-variant">Loyalty Tier:</span>
            <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface font-bold">
              {loyaltyTier ?? 'Bronze'}
            </span>
            <span className="font-body-xs text-body-xs text-on-surface-variant">
              ({loyaltyPoints} pts)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              id="credit-sale"
              checked={isCreditSale ?? false}
              onChange={(e) => onCreditSaleToggle?.(e.target.checked)}
              className="h-3.5 w-3.5 rounded accent-primary"
            />
            <label
              htmlFor="credit-sale"
              className="font-body-xs text-body-xs text-on-surface-variant"
            >
              Credit sale
            </label>
          </div>
        </div>
      )}

      {/* ── Tender Panel ── */}
      <TenderPanel
        total={total}
        processing={processing}
        onComplete={onProcessSale}
        onHoldBill={onHoldBill}
        onCancelOrder={onCancelOrder}
        onTenderSelect={onTenderSelect}
        disabled={isCartEmpty}
      />
    </aside>
  );
}
