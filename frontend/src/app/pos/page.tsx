'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateOrder } from '@/hooks/useOrders';
import { useCategories } from '@/hooks/useCategories';
import { PosProvider, usePos } from '@/context/PosContext';
import type { Product, Customer, OrderWithItems } from '@pharmacy-point/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Product search & category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch categories for the filter dropdown
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  // Fetch products (with search + category filter)
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts({
    page: 1,
    limit: POS_PRODUCT_LIMIT,
    search: searchQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
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
      <div className="bg-background p-4 sm:p-6 sm:max-w-7xl mx-auto">
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
    <div className="bg-background p-4 sm:p-6 sm:max-w-7xl mx-auto">
      <div className="sm:container-max space-y-6">
        {/* ── Header (the POS "vitals" — live transaction total) ─────────── */}
        <header className="prescription-border-l pl-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary/10">
                <ShoppingCart className="h-5 w-5 text-tertiary" />
              </div>
              <div>
                <h1 className="sm:text-display-lg text-foreground">Point of Sale</h1>
                <p className="text-body-md text-on-surface-variant">
                  {sessionData?.user?.name
                    ? `Signed in as ${sessionData.user.name}`
                    : 'Ready to process a new sale'}
                </p>
              </div>
            </div>

            {/* Live order total — data-mono for numerical clarity per spec */}
            <div className="text-right">
              <p className="text-label-md text-on-surface-variant">Order Total</p>
              <p className="text-3xl font-bold text-data-mono text-primary">
                {formatCurrency(total)}
              </p>
              {!isCartEmpty && (
                <Badge variant="secondary" size="sm" className="mt-1">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} items
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* ── Mutation Error ───────────────────────────────────────────── */}
        {createOrderMutation.isError && (
          <Card className="border-error bg-error/5 shadow-[var(--shadow-md)] p-4">
            <div className="flex items-start gap-3 text-error">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-body-md">
                {createOrderMutation.error?.message || 'Failed to process sale. Please try again.'}
              </p>
            </div>
          </Card>
        )}

        {/* ── Main Layout (Product Search + Grid | Cart + Checkout) ───── */}
        <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Left Column: Products */}
          <div className="min-w-0 space-y-4">
            {/* Product Search + Category Filter — DESIGN.md: top bar with text input */}
            <ProductSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              isLoadingCategories={isLoadingCategories}
              placeholder="Search products by name or SKU..."
            />

            {/* Products Error */}
            {productsError && (
              <Card className="border-error bg-error/5 p-4">
                <div className="flex items-center gap-2 text-error">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-body-md">
                    {productsError instanceof Error
                      ? productsError.message
                      : 'Failed to load products'}
                  </p>
                </div>
              </Card>
            )}

            {/* Active filters indicator */}
            {(searchQuery || (selectedCategory !== 'all' && (categories ?? []).length > 0)) && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="outline" size="sm">
                    Search: &quot;{searchQuery}&quot;
                  </Badge>
                )}
                {selectedCategory !== 'all' && (categories ?? []).length > 0 && (
                  <Badge variant="outline" size="sm">
                    {(categories ?? []).find((c) => c.id === selectedCategory)?.name ||
                      selectedCategory}
                  </Badge>
                )}
              </div>
            )}

            {/* Product Grid — DESIGN.md: md (16px) spacing between interactive elements */}
            <ProductGrid
              products={products}
              onAddItem={(product, qty) => addItem(product, qty)}
              canAddToCart={(product, qty) => canAddToCart(product, qty)}
              isLoading={isLoadingProducts}
            />
          </div>

          {/* Right Column: Cart & Checkout */}
          <div className="flex flex-col gap-4 sm:min-w-[30rem]">
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
