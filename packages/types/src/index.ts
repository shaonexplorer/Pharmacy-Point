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
  category: string;
  image?: string | null;
  deletedAt?: string | null;
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
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'cash' | 'card';

export interface Order {
  id: string;
  customerId?: string | null;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  paymentMethod?: PaymentMethod | null;
  staffId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
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
}

export interface CreateOrderInput {
  customerId?: string | null;
  items: CreateOrderItemInput[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  paymentMethod: PaymentMethod;
  staffId?: string | null;
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
export type CustomerWithOrders = Customer & { orders?: Order[] };

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export interface InventoryTransaction {
  id: string;
  productId: string;
  product?: Product;
  type: TransactionType;
  quantity: number;
  notes?: string | null;
  referenceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem extends Product {
  isLowStock: boolean;
}

export interface StockInInput {
  productId: string;
  quantity: number;
  notes?: string;
  referenceId?: string;
}

export interface StockOutInput {
  productId: string;
  quantity: number;
  notes?: string;
  referenceId?: string;
}

export interface StockAdjustInput {
  quantity: number;
  notes?: string;
}
