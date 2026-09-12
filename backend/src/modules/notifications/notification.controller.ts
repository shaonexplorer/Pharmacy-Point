import { Request, Response, NextFunction } from 'express';
import {
  sendBatchAlert,
  sendDueAccountAlert,
  sendPaymentRemindersService,
  sendWhatsAppMessage,
  sendPurchaseOrderWhatsApp,
  isWhatsAppConfigured,
} from './notification.service';
import { sendAlertSchema, dueAccountAlertSchema, whatsappMessageSchema, whatsappPORequestSchema } from './notification.dto';
import { asyncHandler } from '../../middleware/asyncHandler';
import { prisma } from '../../config/database';

export const sendDueAccountAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { threshold, recipients } = dueAccountAlertSchema.parse(req.body);
  const to = recipients || (process.env.ALERT_RECIPIENTS ? process.env.ALERT_RECIPIENTS.split(',') : []);
  if (to.length === 0) throw new Error('No recipients configured');
  const overdueCustomers = await prisma.customer.findMany({
    where: { dueAmount: { gt: threshold } },
    select: { name: true, dueAmount: true, id: true },
  });
  const items = overdueCustomers.map(c => ({ customerName: c.name || c.id, dueAmount: Number(c.dueAmount || 0), threshold }));
  await sendBatchAlert(to[0], 'due_account', items);
  // Also send individual alerts for high-value accounts
  for (const c of overdueCustomers) {
    await sendDueAccountAlert(to[0], c.name || 'Customer', Number(c.dueAmount || 0), threshold);
  }
  res.json({ sent: true, to, count: overdueCustomers.length, customers: overdueCustomers.map(c => ({ name: c.name, dueAmount: Number(c.dueAmount || 0) })) });
});

export const sendAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { type, recipients } = sendAlertSchema.parse(req.body);
  const to = recipients || (process.env.ALERT_RECIPIENTS ? process.env.ALERT_RECIPIENTS.split(',') : []);
  if (to.length === 0) throw new Error('No recipients configured');
  // Build sample data; in production this queries inventory service
  const items = [{ name: 'Sample Product', qty: 3, threshold: 10 }];
  await sendBatchAlert(to[0], type, items);
  res.json({ sent: true, to });
});

/**
 * Send payment reminder emails to customers with due amounts.
 * Queries customers with outstanding due amounts and sends reminder emails.
 */
export const sendPaymentReminders = asyncHandler(async (req: Request, res: Response) => {
  const result = await sendPaymentRemindersService();
  res.json(result);
});

/**
 * Send a text message to a WhatsApp number via the Business Cloud API.
 *
 * Body (validated by whatsappMessageSchema):
 *   { to: string, message: string, purchaseOrderId?: string }
 */
export const sendWhatsApp = asyncHandler(async (req: Request, res: Response) => {
  const { to, message } = whatsappMessageSchema.parse(req.body);

  const result = await sendWhatsAppMessage(to, message);

  res.json({
    success: true,
    message: 'WhatsApp message sent successfully',
    messageId: result.id,
    waId: result.wa_id,
  });
});

/**
 * Send a purchase order's details to a supplier representative via WhatsApp.
 *
 * The PO is looked up server-side by ID (with full relations), the message
 * is formatted, and it's sent to the rep's whatsappNumber via the WhatsApp
 * Business Cloud API. If the API is not configured, a fallback wa.me link
 * is returned so the frontend can open it in a new tab.
 *
 * Body (validated by whatsappPORequestSchema):
 *   { purchaseOrderId: string, phoneOverride?: string }
 */
export const sendWhatsAppPurchaseOrder = asyncHandler(async (req: Request, res: Response) => {
  const { purchaseOrderId, phoneOverride } = whatsappPORequestSchema.parse(req.body);

  const result = await sendPurchaseOrderWhatsApp(purchaseOrderId, phoneOverride);

  if (result.success) {
    res.json({
      success: true,
      message: result.message,
      messageId: result.messageId,
      waId: result.waId,
    });
  } else {
    res.status(200).json({
      success: false,
      message: result.message,
      fallbackLink: result.fallbackLink,
    });
  }
});

/**
 * Check whether the WhatsApp Business Cloud API is configured.
 */
export const getWhatsAppStatus = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    configured: isWhatsAppConfigured(),
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? "***configured***" : null,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ? "***configured***" : null,
  });
});
