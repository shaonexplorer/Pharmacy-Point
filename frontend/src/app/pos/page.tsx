'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateOrder } from '@/hooks/useOrders';
import { useCategories } from '@/hooks/useCategories';
import { usePos } from '@/context/PosContext';
import type { Product, Customer, OrderWithItems } from '@pharmacy-point/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { PosShell } from '@/components/pos/layout/PosShell';
import { PosToolbar } from '@/components/pos/content/PosToolbar';
import { ProductCatalog } from '@/components/pos/content/ProductCatalog';
import { ActiveBill } from '@/components/pos/content/ActiveBill';
import { Receipt } from '@/components/pos/Receipt';
import { ReceiptEmailForm } from '@/components/orders/ReceiptEmailForm';
import { Card } from '@/components/ui/card';

const POS_PRODUCT_LIMIT = 24;
const POS_CUSTOMER_LIMIT = 100;

function PosContent() {
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();

  // Product search & category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch categories for the filter pills
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const categories = categoriesData ?? [];

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

  // Fetch customers for checkout
  const { data: customersResponse, isLoading: isLoadingCustomers } = useCustomers({
    page: 1,
    limit: POS_CUSTOMER_LIMIT,
  });

  const customers: Customer[] = customersResponse?.data ?? [];

  // Order creation mutation
  const createOrderMutation = useCreateOrder();

  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderWithItems | null>(null);

  // Cart context (provided by PosLayout's PosProvider)
  const {
    items,
    subtotal,
    taxAmount,
    total,
    taxRate,
    paymentMethod,
    customerId,
    redeemedPoints,
    isCreditSale,
    customerDueAmount,
    customerLoyaltyPoints,
    customerLoyaltyTier,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCustomer,
    setPaymentMethod,
    canAddToCart,
    setRedeemedPoints,
    setCreditSale,
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
        subtotal: Number(subtotal || 0),
        tax: Number(taxAmount || 0),
        taxRate: Number(taxRate || 0.085),
        total: Number(total || 0),
        paymentMethod: paymentMethod || 'cash',
        staffId: session?.user?.id ?? null,
        isCreditSale: !!isCreditSale,
        redeemedPoints: Number(redeemedPoints || 0),
      };

      const response = await createOrderMutation.mutateAsync(orderData);

      if (response?.data) {
        // Step 3: set status to COMPLETED after successful payment
        try {
          await fetch(`/api/orders/${response.data.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' }),
          });
        } catch {
          /* non-blocking */
        }
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

  const handleEmailReceipt = () => setShowEmailForm((s) => !s);

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

  // ── Receipt view after successful sale ──────────────────────────────
  if (showReceipt && completedOrder) {
    const staffName = session?.user?.name ?? undefined;
    return (
      <PosShell showHeader={false}>
        <div className="bg-background p-4 sm:p-6">
          <div className="container-max">
            <Receipt
              order={completedOrder}
              staffName={staffName}
              onEmail={handleEmailReceipt}
              onNewSale={handleNewSale}
            />
            {showEmailForm && completedOrder && (
              <div className="w-full mt-2">
                <ReceiptEmailForm
                  orderId={completedOrder.id}
                  defaultEmail={completedOrder.customer?.email ?? ''}
                  onSent={() => setShowEmailForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </PosShell>
    );
  }

  // ── Mutation Error ─────────────────────────────────────────────────
  const mutationError = createOrderMutation.isError
    ? createOrderMutation.error?.message || 'Failed to process sale. Please try again.'
    : null;

  // ── Main POS Interface ─────────────────────────────────────────────
  return (
    <PosShell>
      {/* Page toolbar: title + hotkeys + DEA banner */}
      <PosToolbar />

      {/* Products error */}
      {productsError && (
        <Card className="border-error bg-error/5 p-3 mb-2">
          <div className="flex items-center gap-2 text-error">
            <AlertCircle className="h-4 w-4" />
            <p className="font-body-sm text-body-sm">
              {productsError instanceof Error ? productsError.message : 'Failed to load products'}
            </p>
          </div>
        </Card>
      )}

      {/* Mutation error */}
      {mutationError && (
        <Card className="border-error bg-error/5 p-3 mb-2">
          <div className="flex items-start gap-2 text-error">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="font-body-sm text-body-sm">{mutationError}</p>
          </div>
        </Card>
      )}

      {/* Primary Split-Screen Container — 60% catalog | 40% cart */}
      <div className="flex flex-col gap-3 w-full lg:flex-row lg:items-start">
        {/* LEFT SIDE: Catalog & Product Search (60%) */}
        <section className="w-full lg:w-[60%]">
          <ProductCatalog
            products={products}
            categories={categories}
            searchQuery={searchQuery}
            onSearchChange={(v) => setSearchQuery(v)}
            onSearchClear={() => setSearchQuery('')}
            selectedCategory={selectedCategory}
            onCategoryChange={(v) => setSelectedCategory(v)}
            isLoadingCategories={isLoadingCategories}
            isLoading={isLoadingProducts}
            onAddItem={(product) => addItem(product, 1)}
            canAddToCart={(product) => canAddToCart(product, 1)}
          />
        </section>

        {/* RIGHT SIDE: Active Bill Cart & Checkout (40%) */}
        <section className="w-full lg:w-[40%]">
          <ActiveBill
            items={items}
            subtotal={Number(subtotal)}
            taxAmount={Number(taxAmount)}
            total={Number(total)}
            taxRate={Number(taxRate)}
            isCartEmpty={isCartEmpty}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            onClearCart={clearCart}
            customers={customers}
            selectedCustomerId={customerId}
            onCustomerChange={(value) => {
              const c = customers.find((cust) => cust.id === value);
              setCustomer(value ?? null, {
                name: c?.name ?? null,
                dueAmount: (c as any)?.dueAmount ?? 0,
                loyaltyPoints: (c as any)?.loyaltyPoints ?? 0,
                loyaltyTier: (c as any)?.loyaltyTier ?? 'Bronze',
              });
            }}
            customerDueAmount={customerDueAmount}
            loyaltyPoints={customerLoyaltyPoints}
            loyaltyTier={customerLoyaltyTier}
            redeemedPoints={redeemedPoints}
            isCreditSale={isCreditSale}
            onCreditSaleToggle={setCreditSale}
            onRedeemPoints={setRedeemedPoints}
            onProcessSale={handleProcessSale}
            processing={isProcessing}
          />
        </section>
      </div>
    </PosShell>
  );
}

export default function PosPage() {
  return (
    <div className=" mx-auto">
      <PosContent />
    </div>
  );
}
