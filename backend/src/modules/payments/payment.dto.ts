import { z } from "zod";

export const checkoutSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("usd"),
  orderId: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export const webhookSchema = z.object({
  id: z.string(),
  object: z.string(),
  type: z.string(),
  data: z.any(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type WebhookPayload = z.infer<typeof webhookSchema>;
