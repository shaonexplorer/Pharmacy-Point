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

export interface Order {
  id: string;
  customerId?: string | null;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  total: number;
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
