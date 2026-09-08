import { z } from 'zod';

export const alertSettingsSchema = z.object({
  lowStockThreshold: z.number().int().min(0).default(10),
  recipients: z.array(z.string().email()).min(1).default([]),
  expiryWarningDays: z.number().int().min(1).default(30),
});

export const dueAccountAlertSchema = z.object({
  threshold: z.number().min(0).default(100),
  recipients: z.array(z.string().email()).optional(),
});

export const sendAlertSchema = z.object({
  type: z.enum(['low_stock', 'expiry_approaching', 'expired', 'due_account']).default('low_stock'),
  recipients: z.array(z.string().email()).optional(),
});
