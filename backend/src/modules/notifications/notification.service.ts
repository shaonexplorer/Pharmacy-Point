import nodemailer from 'nodemailer';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { sanitizeWhatsAppNumber, formatPOWhatsAppMessage } from '../../utils/whatsapp';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function lowStockTemplate(productName: string, qty: number, threshold: number) {
  return `<h2>Low Stock Alert — ${productName}</h2>
<p>Quantity <strong>${qty}</strong> is below threshold <strong>${threshold}</strong>.</p>`;
}

function expiryTemplate(productName: string, days: number) {
  return `<h2>Expiration Approaching — ${productName}</h2>
<p>Expires in <strong>${days}</strong> day(s).</p>`;
}

function dueAccountTemplate(customerName: string, dueAmount: number, threshold: number) {
  return `<h2>Due Account Alert — ${customerName}</h2>
<p>Outstanding balance <strong>$${dueAmount.toFixed(2)}</strong> exceeds threshold <strong>$${threshold.toFixed(2)}</strong>.</p>`;
}

export async function sendLowStockAlert(
  recipient: string,
  productName: string,
  qty: number,
  threshold: number
) {
  if (!process.env.SMTP_USER) throw new AppError(500, 'SMTP not configured');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: `Low Stock Alert: ${productName}`,
    html: lowStockTemplate(productName, qty, threshold),
  });
}

export async function sendExpiryAlert(recipient: string, productName: string, days: number) {
  if (!process.env.SMTP_USER) throw new AppError(500, 'SMTP not configured');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: `Expiration Warning: ${productName}`,
    html: expiryTemplate(productName, days),
  });
}

export async function sendDueAccountAlert(
  recipient: string,
  customerName: string,
  dueAmount: number,
  threshold: number
) {
  if (!process.env.SMTP_USER) throw new AppError(500, 'SMTP not configured');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: `Due Account Alert: ${customerName}`,
    html: dueAccountTemplate(customerName, dueAmount, threshold),
  });
}

export async function sendBatchAlert(
  recipient: string,
  type: 'low_stock' | 'expiry_approaching' | 'expired' | 'due_account',
  items: {
    name?: string;
    customerName?: string;
    qty?: number;
    days?: number;
    threshold?: number;
    dueAmount?: number;
  }[]
) {
  if (!process.env.SMTP_USER) throw new AppError(500, 'SMTP not configured');
  const html = items
    .map((i) => {
      if (type === 'low_stock')
        return `<li><strong>${i.name}</strong>: qty ${i.qty} (threshold ${i.threshold})</li>`;
      if (type === 'due_account')
        return `<li><strong>${i.customerName}</strong>: due $${i.dueAmount?.toFixed(2)} (threshold $${i.threshold?.toFixed(2)})</li>`;
      return `<li><strong>${i.name}</strong>: ${i.days} days</li>`;
    })
    .join('');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: `Inventory Alert — ${type.replace('_', ' ')}`,
    html: `<h2>Inventory Alert</h2><ul>${html}</ul>`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Business Cloud API
// ─────────────────────────────────────────────

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const WHATSAPP_GRAPH_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

/**
 * WhatsApp Cloud API client for the business phone number.
 * Throws if required environment variables are not configured.
 */
function getWhatsAppConfig(): {
  accessToken: string;
  phoneNumberId: string;
} {
  const accessToken = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new AppError(
      503,
      'WhatsApp Business API is not configured. Set WHATSAPP_TOKEN and ' +
        'WHATSAPP_PHONE_NUMBER_ID in your environment variables.'
    );
  }

  return { accessToken, phoneNumberId };
}

/**
 * Check whether the WhatsApp Business Cloud API is configured.
 * Used by the controller to decide whether to return a fallback link.
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Send a text message via the WhatsApp Business Cloud API.
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 *
 * @param to   Recipient phone number in E.164 format (e.g. "+15551234567")
 * @param body Text message body (max 4096 chars)
 * @returns Meta message ID and wa_id on success
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<{ id: string; wa_id: string }> {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();

  const response = await fetch(
    `${WHATSAPP_GRAPH_BASE}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: sanitizeWhatsAppNumber(to),
        type: 'text',
        text: { preview_url: false, body },
      }),
    }
  );

  const result = await response.json().catch(() => ({})) as { messages?: Array<{ id: string }>; contacts?: Array<{ wa_id: string }>; error?: { message?: string; code?: string; error_user_msg?: string } };

  if (!response.ok) {
    const errorObj = result?.error ?? {};
    const detail = errorObj?.message
      ? `${errorObj.message} (${errorObj['error_user_msg'] || errorObj.code || ''})`
      : `HTTP ${response.status}`;
    throw new AppError(
      response.status === 401 ? 401 : 502,
      `WhatsApp API error: ${detail}`
    );
  }

  return {
    id: result.messages?.[0]?.id ?? "",
    wa_id: result.contacts?.[0]?.wa_id ?? "",
  };
}

/**
 * Send a purchase order's details to a supplier representative via WhatsApp.
 *
 * Looks up the PO by ID (with full relations), formats a human-readable
 * message, and sends it to the representative's whatsappNumber.
 * If the WhatsApp Business API is not configured, returns a fallback wa.me link.
 *
 * @param purchaseOrderId  The PO to look up and message
 * @param phoneOverride    (optional) override the rep's whatsappNumber
 */
export async function sendPurchaseOrderWhatsApp(
  purchaseOrderId: string,
  phoneOverride?: string
): Promise<{
  success: boolean;
  message: string;
  messageId?: string;
  waId?: string;
  fallbackLink?: string;
}> {
  // Fetch the PO with full relations
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: {
      supplier: true,
      supplierRepresentative: true,
      items: { include: { product: true } },
    },
  });

  if (!po) {
    throw new AppError(404, 'Purchase order not found');
  }

  // Determine the recipient phone number
  const rep = po.supplierRepresentative;
  const phoneNumber = phoneOverride ?? rep?.whatsappNumber;

  if (!phoneNumber) {
    return {
      success: false,
      message:
        rep?.name
          ? `${rep.name} does not have a WhatsApp number on file. Update their profile to enable WhatsApp messaging.`
          : 'No representative is linked to this purchase order. Select a representative with a WhatsApp number.',
    };
  }

  // Format the message
  const message = formatPOWhatsAppMessage({
    representativeName: rep?.name ?? undefined,
    poNumber: po.poNumber,
    items: (po.items ?? []).map((item) => ({
      product: item.product as { name?: string; sku?: string } | null | undefined,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice ?? 0),
    })),
    totalAmount: Number(po.totalAmount ?? 0),
    expectedDeliveryDate: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toISOString() : null,
    notes: po.notes ?? null,
  });

  // Try sending via the WhatsApp Business Cloud API
  if (isWhatsAppConfigured()) {
    try {
      const result = await sendWhatsAppMessage(phoneNumber, message);
      return {
        success: true,
        message: 'WhatsApp message sent successfully',
        messageId: result.id,
        waId: result.wa_id,
      };
    } catch (err) {
      const apiError = err as Error;
      throw new AppError(
        502,
        `Failed to send WhatsApp message: ${apiError.message}`
      );
    }
  }

  // Fallback: return a wa.me link
  const cleanNumber = sanitizeWhatsAppNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  const fallbackLink = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return {
    success: false,
    message:
      'WhatsApp Business API is not configured. Click the link to open WhatsApp in your browser.',
    fallbackLink,
  };
}

/**
 * Send payment reminder emails to customers with due amounts.
 * Queries customers with outstanding due amounts and sends reminder emails.
 */
export async function sendPaymentRemindersService() {
  const customersWithDue = await prisma.customer.findMany({
    where: { dueAmount: { gt: 0 } },
    select: { id: true, name: true, email: true, dueAmount: true },
    orderBy: { dueAmount: 'desc' },
  });

  const reminders = customersWithDue.map((customer) => ({
    customerId: customer.id,
    customerName: customer.name || 'Unknown',
    customerEmail: customer.email,
    dueAmount: Number(customer.dueAmount || 0),
  }));

  // Send email reminders for each customer
  const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  for (const reminder of reminders) {
    const html = `<h2>Payment Reminder — ${reminder.customerName}</h2>
      <p>Dear ${reminder.customerName},</p>
      <p>We noticed you have an outstanding balance of <strong>$${reminder.dueAmount.toFixed(2)}</strong> on your account.</p>
      <p>Please make a payment at your earliest convenience to keep your account in good standing.</p>
      <p>Thank you for choosing our pharmacy.</p>`;

    await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: reminder.customerEmail,
      subject: `Payment Reminder — Outstanding Balance $${reminder.dueAmount.toFixed(2)}`,
      html,
    });
  }

  return { sent: reminders.length, customers: reminders.length };
}
