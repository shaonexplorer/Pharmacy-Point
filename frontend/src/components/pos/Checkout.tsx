'use client';

import { Customer, PaymentMethod } from '@pharmacy-point/types';
import { CartItem } from '@/context/PosContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
    <Card className="border-border bg-card card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Checkout
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-body-md">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-foreground text-data-mono">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-body-md">
            <span className="text-on-surface-variant">Tax ({Math.round(taxRate * 100)}%)</span>
            <span className="text-foreground text-data-mono">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-xl font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-primary text-data-mono">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <p className="text-label-md text-foreground">Payment Method</p>
          <div className="flex gap-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              size="tablet"
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
              size="tablet"
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
          <Label className="text-label-md text-foreground">Customer (optional)</Label>
          <Select
            value={customerId ?? ''}
            onChange={(e) => onCustomerChange(e.target.value)}
            disabled={isLoadingCustomers}
          >
            <option value="">Walk-in Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
                {customer.phone ? ` (${customer.phone})` : ''}
              </option>
            ))}
          </Select>
        </div>

        {/* Process Sale Button — primary action, large format with rounded-lg */}
        <Button
          size="tablet"
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
