// Shared types for Pharmacy Point application

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'PHARMACIST' | 'STAFF' | 'CUSTOMER';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  price: number;
  quantity: number;
  lowStock: number;
  category?: string | null;
  image?: string | null;
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