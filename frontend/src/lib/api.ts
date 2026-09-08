import axios, { type AxiosRequestConfig } from 'axios';
import type {
  Product,
  Category,
  Company,
  Customer,
  CustomerWithOrders,
  Order,
  OrderWithItems,
  CreateOrderInput,
  PaginatedResponse,
  ApiResponse,
  CreateProductInput,
  UpdateProductInput,
  InventoryItem,
  InventoryTransaction,
  StockInInput,
  StockOutInput,
  StockAdjustInput,
} from '@pharmacy-point/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Wrapper for API requests that returns typed responses.
 */
async function request<T>(
  url: string,
  config?: Omit<AxiosRequestConfig, 'url' | 'baseURL'>
): Promise<T> {
  const response = await apiClient.request<T>({ url, ...config });

  return response.data;
}

export const api = {
  // Products
  products: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      companyId?: string;
    }) => request<PaginatedResponse<Product>>('/api/products', { params }),

    get: (id: string) => request<ApiResponse<Product>>(`/api/products/${id}`),

    create: (data: CreateProductInput) =>
      request<ApiResponse<Product>>('/api/products', {
        method: 'POST',
        data,
      }),

    update: (id: string, data: UpdateProductInput) =>
      request<ApiResponse<Product>>(`/api/products/${id}`, {
        method: 'PUT',
        data,
      }),

    delete: (id: string) =>
      request<ApiResponse<never>>(`/api/products/${id}`, {
        method: 'DELETE',
      }),
  },

  // Orders
  orders: {
    list: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      customerId?: string;
      staffId?: string;
    }) => request<PaginatedResponse<Order>>('/api/orders', { params }),

    get: (id: string) => request<ApiResponse<OrderWithItems>>(`/api/orders/${id}`),

    create: (data: CreateOrderInput) =>
      request<ApiResponse<OrderWithItems>>('/api/orders', {
        method: 'POST',
        data,
      }),

    updateStatus: (id: string, status: string) =>
      request<ApiResponse<Order>>(`/api/orders/${id}/status`, {
        method: 'PATCH',
        data: { status },
      }),
  },

  // Categories
  categories: {
    list: () => request<ApiResponse<Category[]>>('/api/categories'),
  },

  // Companies
  companies: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      request<PaginatedResponse<Company>>('/api/companies', { params }),
    get: (id: string) => request<ApiResponse<Company>>(`/api/companies/${id}`),
    create: (data: Partial<Company>) =>
      request<ApiResponse<Company>>('/api/companies', {
        method: 'POST',
        data,
      }),
    update: (id: string, data: Partial<Company>) =>
      request<ApiResponse<Company>>(`/api/companies/${id}`, {
        method: 'PUT',
        data,
      }),
    delete: (id: string) =>
      request<ApiResponse<never>>(`/api/companies/${id}`, {
        method: 'DELETE',
      }),
  },

  // Customers
  customers: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      request<PaginatedResponse<Customer>>('/api/customers', { params }),
    get: (id: string) => request<ApiResponse<CustomerWithOrders>>(`/api/customers/${id}`),
    create: (data: Partial<Customer>) =>
      request<ApiResponse<Customer>>('/api/customers', {
        method: 'POST',
        data,
      }),
    update: (id: string, data: Partial<Customer>) =>
      request<ApiResponse<Customer>>(`/api/customers/${id}`, {
        method: 'PUT',
        data,
      }),
    delete: (id: string) =>
      request<ApiResponse<never>>(`/api/customers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Inventory
  inventory: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      lowStock?: boolean;
      companyId?: string;
    }) => request<PaginatedResponse<InventoryItem>>('/api/inventory', { params }),

    transactions: (params?: { page?: number; limit?: number; productId?: string; type?: string }) =>
      request<PaginatedResponse<InventoryTransaction>>('/api/inventory/transactions', { params }),

    stockIn: (data: StockInInput) =>
      request<ApiResponse<unknown>>('/api/inventory/stock-in', {
        method: 'POST',
        data,
      }),

    stockOut: (data: StockOutInput) =>
      request<ApiResponse<unknown>>('/api/inventory/stock-out', {
        method: 'POST',
        data,
      }),

    adjust: (productId: string, data: StockAdjustInput) =>
      request<ApiResponse<unknown>>(`/api/inventory/${productId}/adjust`, {
        method: 'PATCH',
        data,
      }),
  },

  // Analytics
  analytics: {
    dashboard: (params?: { period?: string; days?: number }) =>
      request<any>('/api/analytics/dashboard', { params }),

    revenueTrends: (params?: { period?: string; days?: number }) =>
      request<any>('/api/analytics/revenue-trends', { params }),

    salesByCategory: (params?: { days?: number }) =>
      request<any>('/api/analytics/sales-by-category', { params }),

    inventoryStatus: () =>
      request<any>('/api/analytics/inventory-status'),

    topProducts: (params?: { days?: number; limit?: number }) =>
      request<any>('/api/analytics/top-products', { params }),
  },

  // Reports
  reports: {
    sales: (params?: {
      startDate?: string;
      endDate?: string;
      productId?: string;
      category?: string;
      paymentMethod?: string;
      status?: string;
      groupBy?: string;
      page?: number;
      limit?: number;
    }) => request<any>('/api/reports/sales', { params }),

    salesSummary: (params?: { period?: string; days?: number }) =>
      request<any>('/api/reports/sales/summary', { params }),

    salesByPaymentMethod: (params?: { startDate?: string; endDate?: string }) =>
      request<any>('/api/reports/sales/payment-methods', { params }),

    inventory: (params?: { slowMovingDays?: number; expiryDays?: number; limit?: number }) =>
      request<any>('/api/reports/inventory', { params }),

    customers: (params?: {
      tier?: string;
      activeDays?: number;
      hasDueAccounts?: boolean;
      page?: number;
      limit?: number;
    }) => request<any>('/api/reports/customers', { params }),
  },
};
