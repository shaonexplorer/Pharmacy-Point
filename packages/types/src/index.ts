// Shared types for Pharmacy Point application

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'PHARMACIST' | 'STAFF' | 'CUSTOMER';
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  companyId?: string | null;
  company?: Company | null;
  price: number;
  quantity: number;
  lowStock: number;
  barcode?: string | null;
  batchNo?: string | null;
  lowStockThreshold?: number | null;
  expiryDate?: string | null;
  lotNumber?: string | null;
  manufactureDate?: string | null;
  category: string;
  image?: string | null;
  deletedAt?: string | null;
  batches?: ProductBatch[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNo?: string | null;
  lotNumber?: string | null;
  expiryDate?: string | null;
  manufactureDate?: string | null;
  quantity: number;
  initialQuantity: number;
  costPrice?: number | null;
  referenceId?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dueAmount: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  lifetimeSpend: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'RETURNED';

export type PaymentMethod = 'cash' | 'card';

export interface Order {
  id: string;
  customerId?: string | null;
  status: OrderStatus;
  total: number;
  subtotal: number;
  discount: number;
  paymentMethod?: PaymentMethod | null;
  paymentIntentId?: string | null;
  refundReason?: string | null;
  returnWindowDays?: number | null;
  receiptEmail?: string | null;
  isCreditSale?: boolean;
  isOffline?: boolean;
  offlineSyncedAt?: string | null;
  staffId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  returnedQuantity?: number;
  refunded?: boolean;
  price: number;
  batchId?: string | null;
  batch?: ProductBatch | null;
}

export interface OrderItemWithProduct extends OrderItem {
  product?: Product | null;
}

export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
  customer?: Customer | null;
  user?: User | null;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  price: number;
  batchId?: string | null;
}

export interface CreateOrderInput {
  customerId?: string | null;
  items: CreateOrderItemInput[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  staffId?: string | null;
  receiptEmail?: string | null;
  isOffline?: boolean;
  paymentIntentId?: string | null;
  isCreditSale?: boolean;
  redeemedPoints?: number;
}

export interface RefundInput {
  amount: number;
  reason: string;
  refundMethod?: 'original' | 'store_credit';
}

export interface RefundResult {
  order: OrderWithItems;
  refundAmount: number;
  reason: string;
}

export interface ReturnItemInput {
  orderItemId: string;
  quantity: number;
}

export interface ReturnInput {
  items: ReturnItemInput[];
  reason?: string;
}

export interface ReturnResult {
  orderId: string;
  returnedItems: ReturnItemInput[];
  reason: string;
}

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type CreateProductInput = {
  name: string;
  sku: string;
  companyId?: string | null;
  price: number;
  category: string;
  quantity?: number;
  lowStock?: number;
  description?: string;
  image?: string;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type UpdateCompanyInput = Partial<Company>;
export type CreateCompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCustomerInput = Partial<Customer>;
export type CreateCustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'dueAmount'>;
export interface DuePayment { id: string; customerId: string; amount: number; orderId?: string | null; notes?: string | null; userId?: string | null; createdAt: string; updatedAt: string; }
export type CustomerWithOrders = Customer & { orders?: Order[] };
export type CreateDuePaymentInput = { amount: number; orderId?: string; notes?: string; userId?: string };
export type DuePaymentWithCustomer = { id: string; customerId: string; amount: number; orderId?: string | null; notes?: string | null; userId?: string | null; createdAt: string; customer?: Customer; user?: { id: string; name?: string; email?: string } };
export type CustomerWithDuePayments = Customer & { duePayments?: DuePaymentWithCustomer[] };
export interface CustomerDashboard { customer: Customer; orders: OrderWithItems[]; payments: DuePaymentWithCustomer[]; lifetimeValue: number; firstPurchaseDate?: string; lastPurchaseDate?: string; loyaltyPoints: number; loyaltyTier: string; pointsEarned: number; pointsRedeemed: number; }

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export interface InventoryTransaction {
  id: string;
  productId: string;
  product?: Product;
  type: TransactionType;
  quantity: number;
  notes?: string | null;
  referenceId?: string | null;
  batchNo?: string | null;
  batchId?: string | null;
  batch?: ProductBatch | null;
  userId?: string | null;
  user?: { id: string; name?: string | null; email: string } | null;
  previousQuantity?: number | null;
  newQuantity?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem extends Product {
  isLowStock: boolean;
  batches?: ProductBatch[];
  primaryBatch?: ProductBatch | null;
}

export interface StockInInput {
  productId?: string;
  barcode?: string;
  quantity: number;
  batchNo?: string;
  lotNumber?: string;
  expiryDate?: string;
  manufactureDate?: string;
  costPrice?: number;
  notes?: string;
  referenceId?: string;
  userId?: string;
}

export interface StockOutInput {
  productId: string;
  batchId?: string;
  quantity: number;
  notes?: string;
  referenceId?: string;
  userId?: string;
}

export interface StockAdjustInput {
  quantity: number;
  batchNo?: string;
  notes?: string;
  userId?: string;
}

/**
 * Aggregated statistics for the dashboard.
 * Populated by GET /api/stats
 */
export interface Stats {
  totalProducts: number;
  totalCompanies: number;
  lowStockItems: number;
  totalSales: number;
  salesThisMonth: number;
  totalInventoryValue?: number;
  totalTransactions?: number;
  totalBatches?: number;
  stockInThisMonth?: number;
  stockOutThisMonth?: number;
  pendingOrders?: number;
  totalExpenses?: number;
  expensesThisMonth?: number;
}

export interface CreatePaymentInput {
  amount: number;
  currency?: string;
  orderId?: string;
  customerEmail?: string;
}

export interface PaymentResponse {
  sessionId: string;
  url: string;
}

export interface PaymentIntentUpdate {
  paymentIntentId?: string | null;
}

// ─── Expense Types ────────────────────────────────────────────────

/** Standard pharmacy expense categories */
export type ExpenseCategory =
  | 'INVENTORY_PURCHASE'
  | 'UTILITIES'
  | 'RENT'
  | 'SALARIES'
  | 'MARKETING'
  | 'SUPPLIES'
  | 'INSURANCE'
  | 'MAINTENANCE'
  | 'TAXES'
  | 'OTHER';

/** Payment method for expense recording */
export type ExpensePaymentMethod = 'cash' | 'card' | 'bank_transfer';

/** Human-readable labels for expense categories */
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  INVENTORY_PURCHASE: 'Inventory Purchase',
  UTILITIES: 'Utilities',
  RENT: 'Rent',
  SALARIES: 'Salaries',
  MARKETING: 'Marketing',
  SUPPLIES: 'Office Supplies',
  INSURANCE: 'Insurance',
  MAINTENANCE: 'Maintenance',
  TAXES: 'Taxes',
  OTHER: 'Other',
};

/** A single expense record */
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string | null;
  expenseDate: string;
  vendor?: string | null;
  paymentMethod?: string | null;
  receiptImage?: string | null;
  userId?: string | null;
  user?: { id: string; name?: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a new expense */
export type CreateExpenseInput = {
  amount: number;
  category: string;
  description?: string;
  expenseDate?: string;
  vendor?: string;
  paymentMethod?: string;
  receiptImage?: string;
  userId?: string;
};

/** Input for updating an existing expense */
export type UpdateExpenseInput = Partial<CreateExpenseInput>;

/** Query parameters for listing expenses */
export interface ExpenseListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

/** Expense statistics breakdown */
export interface ExpenseStats {
  totalExpenses: number;
  totalThisMonth: number;
  totalThisYear: number;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
}

// ─── Supplier Types ────────────────────────────────────────────────

/** A single representative / medical promotion officer for a supplier */
export interface SupplierRepresentative {
  id: string;
  supplierId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  designation?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Purchase order statuses */
export type PurchaseOrderStatus = 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';

/** A single line item on a purchase order */
export interface PurchaseOrderItem {
  id: string;
  poId: string;
  productId?: string | null;
  product?: Product | null;
  quantity: number;
  unitPrice: number;
  receivedQty?: number;
  notes?: string | null;
}

/** A purchase order associated with a supplier */
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplier?: Supplier | null;
  supplierRepresentativeId?: string | null;
  supplierRepresentative?: SupplierRepresentative | null;
  poNumber: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  notes?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  expectedDeliveryDate?: string | null;
  createdById?: string | null;
  items?: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a purchase order (from procurement cart) */
export interface CreatePurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export type CreatePurchaseOrderInput = {
  supplierId: string;
  supplierRepresentativeId?: string | null;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
  createdById?: string | null;
  items: CreatePurchaseOrderItemInput[];
};

/** A purchase order with full relations (for detail views) */
export type PurchaseOrderWithItems = PurchaseOrder & {
  items: PurchaseOrderItem[];
};

/** A supplier in the pharmacy management system */
export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  leadTimeDays: number;
  paymentTerms?: string | null;
  performanceRating?: number | null;
  representatives?: SupplierRepresentative[];
  purchaseOrders?: PurchaseOrder[];
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a supplier */
export type CreateSupplierInput = {
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  leadTimeDays?: number;
  paymentTerms?: string;
  performanceRating?: number;
  representatives?: CreateSupplierRepresentativeInput[];
};

/** Input for updating a supplier */
export type UpdateSupplierInput = Partial<CreateSupplierInput>;

/** Input for creating a supplier representative */
export type CreateSupplierRepresentativeInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  designation?: string | null;
  address?: string | null;
  notes?: string | null;
};

/** Input for updating a supplier representative */
export type UpdateSupplierRepresentativeInput = Partial<CreateSupplierRepresentativeInput>;

// ─── Reports Types ────────────────────────────────────────────────

/** Sales report data item — one row per group */
export interface SalesReportItem {
  groupLabel: string;
  totalSales: number;
  orderCount: number;
  totalUnits: number;
}

/** Sales summary metrics */
export interface SalesSummaryData {
  totalRevenue: number;
  transactionCount: number;
  averageBasketSize: number;
  totalUnits: number;
  uniqueProducts: number;
  uniqueCustomers: number;
}

/** Sales report response */
export interface SalesReportResponse {
  data: SalesReportItem[];
  summary: SalesSummaryData;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Sales breakdown by payment method */
export interface SalesByPaymentMethod {
  paymentMethod: string;
  totalSales: number;
  orderCount: number;
}

/** Grouping options for sales reports */
export type SalesGroupBy = 'day' | 'week' | 'month' | 'category' | 'paymentMethod';

/** Filters for sales reports */
export interface SalesReportFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  category?: string;
  paymentMethod?: 'cash' | 'card';
  status?: OrderStatus;
  groupBy?: SalesGroupBy;
}

// ─── Inventory Report Types ───────────────────────────────────

/** Inventory report item — one product row */
export interface InventoryReportItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  expiryDate?: string | null;
  batchNo?: string | null;
  isLowStock: boolean;
  isExpiringSoon: boolean;
  isSlowMoving: boolean;
}

/** Inventory report summary metrics */
export interface InventoryReportSummary {
  totalProducts: number;
  totalInventoryValue: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  expiredCount: number;
  slowMovingCount: number;
}

/** Inventory report response */
export interface InventoryReportResponse {
  summary: InventoryReportSummary;
  lowStockItems: InventoryReportItem[];
  slowMovingItems: InventoryReportItem[];
  expiringItems: InventoryReportItem[];
}

// ─── Customer Report Types ────────────────────────────────────

/** Customer report summary metrics */
export interface CustomerReportSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  averageSpend: number;
  totalLifetimeSpend: number;
  totalDueAccounts: number;
  totalDueAmount: number;
  tierDistribution: Record<string, number>;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
}

/** Customer report item — one customer row */
export interface CustomerReportItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  loyaltyTier: string;
  loyaltyPoints: number;
  lifetimeSpend: number;
  dueAmount: number;
  orderCount: number;
  lastPurchaseDate?: string | null;
  isActive: boolean;
}

/** Tier distribution item */
export interface TierDistributionItem {
  tier: string;
  count: number;
  percentage: number;
}

/** Customer report response */
export interface CustomerReportResponse {
  summary: CustomerReportSummary;
  customers: CustomerReportItem[];
  tierDistribution: TierDistributionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Financial Report Types ────────────────────────────

/** Financial report summary metrics */
export interface FinancialReportSummary {
  grossRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  netProfit: number;
  totalOrders: number;
  totalUnits: number;
  averageOrderValue: number;
  totalRefunds: number;
  totalExpenses: number;
}

/** Financial report data row — one row per group */
export interface FinancialReportItem {
  groupLabel: string;
  revenue: number;
  cogs: number;
  profit: number;
  orders: number;
}

/** Financial report response */
export interface FinancialReportResponse {
  summary: FinancialReportSummary;
  data: FinancialReportItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
