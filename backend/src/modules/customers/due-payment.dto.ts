import { z } from 'zod';

export const duePaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be positive'),
  orderId: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string().optional(),
});

export type DuePaymentInput = z.infer<typeof duePaymentSchema>;
