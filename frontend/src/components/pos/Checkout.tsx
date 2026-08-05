'use client';

import { Customer, PaymentMethod } from '@pharmacy-point/types';
import { CartItem } from '@/context/PosContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

        {/* Payment Method Selection — DESIGN.md: secondary uses Medi-Blue */}
        <div className="flex flex-col gap-2">
          <p className="text-label-md text-foreground">Payment Method</p>
          <div className="flex gap-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'secondary'}
              size="tablet"
              disabled={isProcessing}
              onClick={() => onPaymentMethodChange('cash')}
              className="flex-1"
            >
              <Banknote className="mr-2 h-4 w-4" />
              Cash
            </Button>
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'secondary'}
              size="tablet"
              disabled={isProcessing}
              onClick={() => onPaymentMethodChange('card')}
              className="flex-1"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Card
            </Button>
          </div>
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

        {/* Process Sale — primary action, large-format with rounded-lg per spec */}
        <Button
          size="tablet"
          variant="default"
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
