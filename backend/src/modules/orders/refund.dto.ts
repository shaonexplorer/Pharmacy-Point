import { z } from 'zod';

export const refundSchema = z.object({
  amount: z.number().positive('Refund amount must be positive'),
  reason: z.string().min(1, 'Reason is required').max(500),
  refundMethod: z.enum(['original', 'store_credit']).optional().default('original'),
});

export const returnSchema = z.object({
  items: z.array(z.object({
    orderItemId: z.string().min(1),
    quantity: z.number().positive(),
  })).min(1, 'At least one item required'),
  reason: z.string().min(1).max(500).optional(),
});

export type RefundInput = z.infer<typeof refundSchema>;
export type ReturnInput = z.infer<typeof returnSchema>;
