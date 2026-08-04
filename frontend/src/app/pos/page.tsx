'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateOrder } from '@/hooks/useOrders';
import { PosProvider, usePos } from '@/context/PosContext';
import type { Product, Customer, OrderWithItems } from '@pharmacy-point/types';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { ProductSearch } from '@/components/pos/ProductSearch';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { Checkout } from '@/components/pos/Checkout';
import { Receipt } from '@/components/pos/Receipt';
import { formatCurrency } from '@/lib/formatters';

const POS_PRODUCT_LIMIT = 24;
const POS_CUSTOMER_LIMIT = 100;

function PosContent() {
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();
  const { data: sessionData } = useSession();

  // Product search
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products (with search)
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts({
    page: 1,
    limit: POS_PRODUCT_LIMIT,
    search: searchQuery || undefined,
  });

  const products: Product[] = productsResponse?.data ?? [];

  // Fetch customers for checkout dropdown
  const { data: customersResponse, isLoading: isLoadingCustomers } = useCustomers({
    page: 1,
    limit: POS_CUSTOMER_LIMIT,
  });

  const customers: Customer[] = customersResponse?.data ?? [];

  // Order creation mutation
  const createOrderMutation = useCreateOrder();

  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderWithItems | null>(null);

  // Cart context
  const {
    items,
    subtotal,
    taxAmount,
    total,
    taxRate,
    paymentMethod,
    customerId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCustomer,
    setPaymentMethod,
    canAddToCart,
  } = usePos();

  const isProcessing = createOrderMutation.isPending;
  const isCartEmpty = items.length === 0;

  const handleProcessSale = async () => {
    if (isCartEmpty) return;

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        customerId: customerId ?? null,
        items: orderItems,
        subtotal,
        tax: taxAmount,
        taxRate,
        total,
        paymentMethod,
        staffId: sessionData?.user?.id ?? null,
      };

      const response = await createOrderMutation.mutateAsync(orderData);

      if (response?.data) {
        setCompletedOrder(response.data);
        setShowReceipt(true);
        clearCart();
      }
    } catch (error) {
      // Error is surfaced via mutation error state
      console.error('Failed to create order:', error);
    }
  };

  const handleNewSale = () => {
    setShowReceipt(false);
    setCompletedOrder(null);
  };

  const handleEmailReceipt = () => {
    // Phase 2: Email receipt integration
    console.log('Email receipt for order:', completedOrder?.id);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authPending && !session) {
      router.push('/login');
    }
  }, [session, authPending, router]);

  if (authPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  // Show receipt view after successful sale
  if (showReceipt && completedOrder) {
    const staffName = sessionData?.user?.name ?? undefined;
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="container-max">
          <Receipt
            order={completedOrder}
            staffName={staffName}
            onEmail={handleEmailReceipt}
            onNewSale={handleNewSale}
          />
        </div>
      </div>
    );
  }

  // Main POS interface
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container-max">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg text-foreground flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Point of Sale
            </h1>
            <p className="text-body-md text-on-surface-variant">
              {sessionData?.user?.name
                ? `Signed in as ${sessionData.user.name}`
                : 'Ready to process a new sale'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-label-md text-on-surface-variant">Order Total</p>
            <p className="text-2xl font-bold text-data-mono text-primary">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* Error State */}
        {createOrderMutation.isError && (
          <Card id="checkout-error" className="border-destructive bg-destructive/5 card-elevated p-4 mb-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-body-md">
                {createOrderMutation.error?.message || 'Failed to process sale. Please try again.'}
              </p>
            </div>
          </Card>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Left Column: Products */}
          {/* POS grid spacing: md (16px) between elements per spec */}
          <div className="space-y-4">
            {/* Product Search */}
            <ProductSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search products by name or SKU..."
            />

            {/* Products Error */}
            {productsError && (
              <Card className="border-destructive bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p>
                    {productsError instanceof Error
                      ? productsError.message
                      : 'Failed to load products'}
                  </p>
                </div>
              </Card>
            )}

            {/* Product Grid */}
            <ProductGrid
              products={products}
              onAddItem={(product, qty) => addItem(product, qty)}
              canAddToCart={(product, qty) => canAddToCart(product, qty)}
              isLoading={isLoadingProducts}
            />
          </div>

          {/* Right Column: Cart & Checkout */}
          <div className="space-y-4">
            <Cart
              items={items}
              subtotal={subtotal}
              taxAmount={taxAmount}
              total={total}
              taxRate={taxRate}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onClearCart={clearCart}
            />

            <Checkout
              items={items}
              subtotal={subtotal}
              taxAmount={taxAmount}
              total={total}
              taxRate={taxRate}
              paymentMethod={paymentMethod}
              customerId={customerId}
              customers={customers}
              isLoadingCustomers={isLoadingCustomers}
              isProcessing={isProcessing}
              onPaymentMethodChange={setPaymentMethod}
              onCustomerChange={(value) => setCustomer(value || null)}
              onProcessSale={handleProcessSale}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PosPage() {
  return (
    <PosProvider>
      <PosContent />
    </PosProvider>
  );
}
