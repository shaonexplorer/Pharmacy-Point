'use client';

import { Customer, PaymentMethod } from '@pharmacy-point/types';
import { CartItem } from '@/context/PosContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CreditCard, Banknote, ShoppingCart } from 'lucide-react';

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
  onPaymentMethodChange,
  onCustomerChange,
  onProcessSale,
}: CheckoutProps) {
  const isEmpty = items.length === 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Checkout
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax ({Math.round(taxRate * 100)}%)</span>
            <span className="text-foreground">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-xl font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Payment Method</p>
          <div className="flex gap-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPaymentMethodChange('cash')}
              className={cn(
                'flex-1',
                paymentMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'border-border'
              )}
            >
              <Banknote className="mr-2 h-4 w-4" />
              Cash
            </Button>
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPaymentMethodChange('card')}
              className={cn(
                'flex-1',
                paymentMethod === 'card' ? 'bg-primary text-primary-foreground' : 'border-border'
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Card
            </Button>
          </div>
        </div>

        {/* Customer Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Customer (optional)</label>
          <select
            value={customerId ?? ''}
            onChange={(e) => onCustomerChange(e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'transition-colors duration-200 placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
              'hover:border-muted'
            )}
            disabled={isLoadingCustomers}
          >
            <option value="">Walk-in Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
                {customer.phone ? ` (${customer.phone})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Process Sale Button */}
        <Button
          size="lg"
          className="w-full"
          disabled={isEmpty || isProcessing}
          onClick={onProcessSale}
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
