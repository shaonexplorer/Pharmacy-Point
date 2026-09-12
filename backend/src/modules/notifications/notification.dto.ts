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

/**
 * WhatsApp message DTO — send a text message to a WhatsApp number via the
 * Meta Business Cloud API.
 * - `to`: recipient phone number in international format (e.g. "+15551234567")
 * - `message`: the text body (max 4096 characters per WhatsApp limit)
 * - `purchaseOrderId` (optional): if provided, a fallback wa.me link is returned
 *   when the WhatsApp Business Cloud API is not configured.
 */
export const whatsappMessageSchema = z.object({
  to: z.string().min(1, 'Recipient phone number is required'),
  message: z.string().min(1, 'Message body is required').max(4096),
  purchaseOrderId: z.string().optional(),
});

/**
 * Purchase-order-specific WhatsApp request — sends the PO details to the
 * supplier representative's WhatsApp number.
 * - `purchaseOrderId`: the PO to look up and message
 * - `phoneOverride` (optional): override the rep's whatsappNumber
 */
export const whatsappPORequestSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order ID is required'),
  phoneOverride: z.string().optional(),
});
