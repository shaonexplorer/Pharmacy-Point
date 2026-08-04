'use client';

import { OrderWithItems } from '@pharmacy-point/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { Receipt as ReceiptIcon, Printer, ShoppingCart, Mail } from 'lucide-react';

interface ReceiptProps {
  order: OrderWithItems;
  staffName?: string | null;
  onEmail?: () => void;
  onNewSale?: () => void;
}

export function Receipt({ order, staffName, onEmail, onNewSale }: ReceiptProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (printWindow) {
      const receiptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; font-size: 12px; }
            .receipt { max-width: 280px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .shop-name { font-size: 16px; font-weight: bold; }
            .shop-info { font-size: 11px; color: #666; }
            .section { margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .item-name { flex: 2; }
            .item-qty { flex: 1; text-align: center; }
            .item-price { flex: 1; text-align: right; }
            .total-row { border-top: 1px solid #000; font-weight: bold; margin-top: 5px; padding-top: 5px; }
            .footer { text-align: center; margin-top: 10px; font-size: 11px; color: #666; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="shop-name">Pharmacy Point</div>
              <div class="shop-info">Receipt • ${new Date(order.createdAt).toLocaleDateString()}</div>
              <div class="shop-info">Order #${order.id.slice(0, 8)}</div>
            </div>
            <div class="section">
              <div class="item"><span class="item-name">Item</span><span class="item-qty">Qty</span><span class="item-price">Price</span></div>
              ${order.items
                .map(
                  (item) => `
                <div class="item">
                  <span class="item-name">${item.product?.name ?? 'Unknown'}</span>
                  <span class="item-qty">${item.quantity}</span>
                  <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
                </div>
              `
                )
                .join('')}
            </div>
            <div class="section">
              <div class="item"><span>Subtotal</span><span></span><span class="item-price">${formatCurrency(order.subtotal ?? order.total)}</span></div>
              <div class="item"><span>Tax</span><span></span><span class="item-price">${formatCurrency(order.tax ?? 0)}</span></div>
              <div class="total-row"><span>Total</span><span></span><span class="item-price">${formatCurrency(order.total)}</span></div>
            </div>
            <div class="footer">
              Customer: ${order.customer?.name ?? 'Walk-in'}<br/>
              Payment: ${(order.paymentMethod ?? 'cash').toUpperCase()}<br/>
              Staff: ${staffName ?? 'N/A'}<br/>
              Thank you for your business!
            </div>
          </div>
        </body>
        </html>
      `;
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const receiptRef = (
    <div
      className="receipt-content border-2 border-dashed border-border rounded-lg p-6 bg-card text-body-md"
      id="pos-receipt"
    >
      {/* Header */}
      <div className="text-center border-b border-border pb-4 mb-4">
        <div className="flex items-center justify-center gap-2">
          <ReceiptIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Pharmacy Point</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(order.createdAt).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
      </div>

      {/* Customer & Payment Info */}
      {order.customer && (
        <div className="border-b border-border pb-3 mb-3">
          <p className="text-xs text-muted-foreground">Customer</p>
          <p className="font-medium text-foreground">{order.customer.name}</p>
          {order.customer.phone && (
            <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-muted-foreground border-b border-border pb-2 mb-2">
          <span className="flex-1">Item</span>
          <span className="w-12 text-center">Qty</span>
          <span className="w-20 text-right">Price</span>
        </div>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-xs py-1">
            <span className="flex-1 text-foreground">
              {item.product?.name ?? 'Unknown Product'}
            </span>
            <span className="w-12 text-center text-muted-foreground">{item.quantity}</span>
            <span className="w-20 text-right text-foreground">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-3 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatCurrency(order.subtotal ?? order.total)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Tax</span>
          <span className="text-foreground">{formatCurrency(order.tax ?? 0)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
          <span className="text-foreground">Total</span>
          <span className="text-primary">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Payment & Staff */}
      <div className="border-t border-border mt-4 pt-3 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="text-foreground">{(order.paymentMethod ?? 'cash').toUpperCase()}</span>
        </div>
        {staffName && (
          <div className="flex justify-between mt-1">
            <span>Staff:</span>
            <span className="text-foreground">{staffName}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-4 text-xs text-muted-foreground">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );

  return (
    <Card className="border-border bg-card card-elevated">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <ReceiptIcon className="h-8 w-8" />
            <span className="text-display-lg font-bold">Sale Complete!</span>
          </div>

          {receiptRef}

          <div className="flex flex-col gap-2 sm:flex-row pt-4 border-t border-border w-full">
            <Button variant="outline" size="tablet" onClick={handlePrint} className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
            <Button variant="outline" size="tablet" onClick={onEmail} className="flex-1">
              <Mail className="mr-2 h-4 w-4" />
              Email Receipt
            </Button>
            <Button size="tablet" onClick={onNewSale} className="flex-1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
