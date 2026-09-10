import { z } from 'zod';

/**
 * DTOs for Order endpoints.
 * Extracted from inline validation in orders.ts route handler.
 */

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required').trim(),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be a positive number'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be a positive number'),
});

export const orderCreateSchema = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'At least one order item is required'),
  subtotal: z
    .number({ invalid_type_error: 'Subtotal must be a number' })
    .nonnegative('Subtotal must be a non-negative number'),
  tax: z
    .number({ invalid_type_error: 'Tax must be a number' })
    .nonnegative('Tax must be a non-negative number'),
  total: z
    .number({ invalid_type_error: 'Total must be a number' })
    .nonnegative('Total must be a non-negative number'),
  taxRate: z
    .number({ invalid_type_error: 'Tax rate must be a number' })
    .nonnegative('Tax rate must be a non-negative number'),
  paymentMethod: z.enum(['cash', 'card']).optional().nullable(),
  staffId: z.string().optional().nullable(),
  receiptEmail: z.string().email().optional().nullable(),
  isOffline: z.boolean().optional().default(false),
  paymentIntentId: z.string().optional().nullable(),
  isCreditSale: z.boolean().optional(),
  redeemedPoints: z.number().int().nonnegative().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(
    ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'RETURNED'],
    {
      errorMap: () => ({ message: 'Status must be a valid order status' }),
    }
  ),
});

export type CreateOrderInput = z.infer<typeof orderCreateSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;

export const refundSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
  refundMethod: z.enum(['original', 'store_credit']).optional().default('original'),
});
export const returnSchema = z.object({
  items: z
    .array(
      z.object({
        orderItemId: z.string().min(1),
        quantity: z.number().positive(),
      })
    )
    .min(1),
  reason: z.string().min(1).max(500).optional(),
});
export type RefundInput = z.infer<typeof refundSchema>;
export type ReturnInput = z.infer<typeof returnSchema>;
