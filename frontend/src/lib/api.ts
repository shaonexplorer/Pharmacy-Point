import axios, { type AxiosRequestConfig } from 'axios';
import type {
  Product,
  Category,
  Company,
  PaginatedResponse,
  ApiResponse,
  CreateProductInput,
  UpdateProductInput,
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
    list: (params?: { page?: number; limit?: number; search?: string; category?: string; companyId?: string }) =>
      request<PaginatedResponse<Product>>('/api/products', { params }),

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

  // Categories
  categories: {
    list: () => request<ApiResponse<Category[]>>('/api/categories'),
  },

  // Companies
  companies: {
    list: () => request<ApiResponse<Company[]>>('/api/companies'),
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
};
