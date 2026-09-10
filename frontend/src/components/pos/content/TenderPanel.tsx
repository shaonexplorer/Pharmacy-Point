'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MaterialSymbols } from '@/components/ui/material-symbols';
import { formatCurrency } from '@/lib/formatters';

/**
 * TenderPanel — the payment method selection + cash calculation strip
 * from the Stitch POS design.
 *
 * Layout:
 *  1. "Select Tender Method" label
 *  2. 4-button grid: Cash (F8) | Card | Mobile | Due/Credit
 *  3. Tender Received input + Change Return display
 *  4. Primary CTA: "Complete Transaction & Print Receipt [Ctrl + Enter]"
 *  5. Secondary: Hold Bill (F6) | Cancel Order
 */
type TenderMethod = 'cash' | 'card' | 'mobile' | 'due';

export function TenderPanel({
  total = 0,
  tenderReceived,
  onTenderReceivedChange,
  selectedTender = 'cash',
  onTenderSelect,
  processing = false,
  onComplete,
  onHoldBill,
  onCancelOrder,
  disabled = false,
  className,
}: {
  total: number;
  tenderReceived?: number;
  onTenderReceivedChange?: (val: number) => void;
  selectedTender?: TenderMethod;
  onTenderSelect?: (method: TenderMethod) => void;
  processing?: boolean;
  onComplete?: () => void;
  onHoldBill?: () => void;
  onCancelOrder?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const [inputValue, setInputValue] = useState(
    tenderReceived ? String(tenderReceived) : ''
  );

  const tenderNum = parseFloat(inputValue) || 0;
  const change = Math.max(0, tenderNum - total);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onTenderReceivedChange?.(val);
    } else {
      onTenderReceivedChange?.(0);
    }
  };

  const tenderMethods = [
    { id: 'cash' as const, label: 'Cash (F8)', icon: 'payments' },
    { id: 'card' as const, label: 'Card', icon: 'credit_card' },
    { id: 'mobile' as const, label: 'Mobile', icon: 'qr_code_scanner' },
    { id: 'due' as const, label: 'Due/Credit', icon: 'account_balance_wallet' },
  ];

  return (
    <div className={cn('flex flex-col gap-2 pt-2', className)}>
      {/* Select Tender Method */}
      <label className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
        Select Tender Method
      </label>

      {/* Tender Method Grid */}
      <div className="grid grid-cols-4 gap-1">
        {tenderMethods.map((method) => {
          const isActive = selectedTender === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onTenderSelect?.(method.id)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center justify-center py-2 rounded-lg',
                'font-button-text text-button-text text-xs',
                'transition-all active:scale-95',
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              )}
            >
              <MaterialSymbols icon={method.icon} className="text-base mb-0.5" />
              <span>{method.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cash Calculation Strip */}
      <div className="grid grid-cols-2 gap-1 mt-1">
        {/* Tender Received */}
        <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
            Tender Received
          </span>
          <div className="flex items-center gap-1">
            <span className="font-body-md text-body-md text-on-surface font-bold">$</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              disabled={disabled || selectedTender !== 'cash'}
              className={cn(
                'w-full bg-transparent font-label-numeric-lg text-label-numeric-lg',
                'text-on-surface focus:outline-none'
              )}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Change Return */}
        <div className="bg-primary/30 p-2 rounded-lg flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-primary-fixed font-bold">
            Change Return
          </span>
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'font-label-numeric-lg text-label-numeric-lg text-primary font-bold'
              )}
            >
              {formatCurrency(change)}
            </span>
            <MaterialSymbols
              icon="currency_exchange"
              className="text-primary text-base"
            />
          </div>
        </div>
      </div>

      {/* Primary POS Trigger Buttons */}
      <div className="flex flex-col gap-1 pt-1">
        {/* Complete Transaction */}
        <button
          type="button"
          onClick={onComplete}
          disabled={disabled || processing}
          className={cn(
            'w-full h-12 bg-primary hover:bg-primary-container text-on-primary',
            'font-button-text text-button-text rounded-lg',
            'flex items-center justify-center gap-1 shadow-md',
            'transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <MaterialSymbols icon="receipt_long" className="text-xl" />
          <span className="text-sm uppercase tracking-wide">
            {processing ? 'Processing...' : 'Complete Transaction & Print Receipt [Ctrl + Enter]'}
          </span>
        </button>

        {/* Secondary: Hold Bill + Cancel Order */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onHoldBill}
            disabled={disabled}
            className={cn(
              'flex-1 h-9 bg-surface-container hover:bg-surface-container-high',
              'text-on-surface font-button-text text-button-text rounded-lg',
              'flex items-center justify-center gap-1 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <MaterialSymbols icon="pause" className="text-sm" />
            <span>Hold Bill (F6)</span>
          </button>
          <button
            type="button"
            onClick={onCancelOrder}
            disabled={disabled}
            className={cn(
              'flex-1 h-9 bg-surface-container hover:bg-error-container',
              'text-on-surface hover:text-on-error-container',
              'font-button-text text-button-text rounded-lg',
              'flex items-center justify-center gap-1 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <MaterialSymbols icon="cancel" className="text-sm" />
            <span>Cancel Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
