import { z } from 'zod';

export const offlineSyncSchema = z.object({
  orders: z.array(z.object({
    customerId: z.string().optional().nullable(),
    items: z.array(z.object({
      productId: z.string().min(1),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })).min(1),
    subtotal: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    total: z.number().nonnegative(),
    paymentMethod: z.enum(['cash', 'card']).optional().nullable(),
    staffId: z.string().optional().nullable(),
    receiptEmail: z.string().email().optional().nullable(),
    isOffline: z.boolean().optional().default(true),
  })).min(1, 'At least one offline order required'),
});

export type OfflineSyncInput = z.infer<typeof offlineSyncSchema>;
