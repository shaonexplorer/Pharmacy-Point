'use client';

import { Customer, PaymentMethod } from '@pharmacy-point/types';
import { CartItem } from '@/context/PosContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DueAccountAlert } from './DueAccountAlert';
import { ExpiryChip, getExpiryStatus } from '@/components/inventory/StockChip';
import { AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatters';
import { CreditCard, Banknote, ShoppingCart } from 'lucide-react';
import PaymentForm from './PaymentForm';

interface CheckoutProps {
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  paymentMethod: PaymentMethod;
  customerId: string | null;
  customers: Customer[];
  isLoadingCustomers: boolean;
  isProcessing: boolean;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCustomerChange: (customerId: string) => void;
  onProcessSale: () => void;
  dueAmount?: number;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  redeemedPoints?: number;
  isCreditSale?: boolean;
  onRedeemPoints?: (pts: number) => void;
  onCreditSaleToggle?: (v: boolean) => void;
}

export function Checkout({
  items,
  subtotal,
  taxAmount,
  total,
  taxRate,
  paymentMethod,
  customerId,
  customers,
  isLoadingCustomers,
  isProcessing,
  dueAmount = 0,
  loyaltyPoints = 0,
  loyaltyTier = 'Bronze',
  redeemedPoints = 0,
  isCreditSale = false,
  onPaymentMethodChange,
  onCustomerChange,
  onProcessSale,
  onRedeemPoints,
  onCreditSaleToggle,
}: CheckoutProps) {
  const isEmpty = items.length === 0;

  // Expiry identification — flag expired and expiring-soon items before checkout
  const expiredItems = items.filter(
    (item) => item.product.expiryDate && getExpiryStatus(item.product.expiryDate) === 'expired'
  );
  const expiringItems = items.filter(
    (item) => item.product.expiryDate && getExpiryStatus(item.product.expiryDate) === 'critical'
  );
  const hasExpiredItems = expiredItems.length > 0;

  // Guard: prevent sale if any cart item is expired (pharmacy safety protocol)
  const handleProcessSale = () => {
    if (hasExpiredItems) return;
    onProcessSale();
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Checkout
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pb-4">
        {/* Order Summary — data-mono for numerical clarity per DESIGN.md */}
        <div className="rounded-md border border-border bg-surface-container-low/60 p-4">
          <div className="flex flex-col gap-2 text-body-md">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="text-data-mono font-medium text-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Tax ({Math.round(taxRate * 100)}%)</span>
              <span className="text-data-mono font-medium text-foreground">
                {formatCurrency(taxAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-xl font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-data-mono text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Expiry Warning — surfaced at checkout to catch expired items before
            the sale is finalized. Per pharmacy safety protocol, expired
            medication must never be dispensed. */}
        {hasExpiredItems && (
          <div className="rounded-md border border-error/30 bg-error/5 p-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-error">
                  Expired product{expiredItems.length > 1 ? 's' : ''} in cart — cannot process sale.
                </p>
                <p className="text-xs text-on-surface-variant">
                  Remove expired items before proceeding. The "Process Sale" button is disabled
                  until all expired products are removed from the cart.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {expiredItems.map((item) => (
                    <ExpiryChip
                      key={item.productId}
                      status="expired"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expiring-soon caution — items expiring within 7 days. This is a
            soft warning; sale can proceed but staff should verify with the
            pharmacist. */}
        {!hasExpiredItems && expiringItems.length > 0 && (
          <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-warning">
                  {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring within 7 days.
                </p>
                <p className="text-xs text-on-surface-variant">
                  Verify with the pharmacist that these products are safe to dispense.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {expiringItems.map((item) => (
                    <ExpiryChip
                      key={item.productId}
                      status="critical"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method — Clinical Precision: unified PaymentForm for Cash/Card + Stripe flow */}
        <div className="flex flex-col gap-2">
          <p className="text-label-md text-foreground">Payment Method</p>
          <PaymentForm
            total={total}
            disabled={hasExpiredItems}
            onSubmit={(method) => {
              onPaymentMethodChange(method);
              handleProcessSale();
            }}
          />
        </div>

        {/* Customer Selection */}
        <div className="flex flex-col gap-2">
          <Label className="text-label-md text-foreground">Customer (optional)</Label>
          <Select
            value={customerId ?? undefined}
            onValueChange={onCustomerChange}
            disabled={isLoadingCustomers || isProcessing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Walk-in Customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.phone ? ` (${customer.phone})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {dueAmount > 0 && (
          <DueAccountAlert dueAmount={dueAmount} />
        )}
        {customerId && loyaltyPoints > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-secondary/10 text-secondary">{loyaltyTier}</Badge>
            <span className="text-on-surface-variant">Points: <strong className="text-foreground">{loyaltyPoints}</strong></span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="credit-sale"
            checked={isCreditSale}
            onChange={(e) => onCreditSaleToggle?.(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <label htmlFor="credit-sale" className="text-sm text-foreground">Credit sale (record due amount)</label>
        </div>
        {customerId && loyaltyPoints > 0 && onRedeemPoints && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Redeem points:</span>
            <input
              type="number"
              min={0}
              max={loyaltyPoints}
              step={100}
              value={redeemedPoints}
              onChange={(e) => onRedeemPoints(Math.min(Math.max(0, Math.round(Number(e.target.value) / 100) * 100), loyaltyPoints))}
              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-xs text-on-surface-variant">({redeemedPoints / 100} discount)</span>
          </div>
        )}

        {/* Process Sale — primary action, large-format with rounded-lg per spec */}
        <Button
          size="tablet"
          variant="default"
          className="w-full"
          disabled={isEmpty || isProcessing || hasExpiredItems}
          onClick={handleProcessSale}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing Sale...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Process Sale — {formatCurrency(total)}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
