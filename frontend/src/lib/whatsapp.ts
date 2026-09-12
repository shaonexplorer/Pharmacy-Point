/**
 * WhatsApp utility helpers for formatting messages and generating wa.me links.
 *
 * The primary sending path is through the backend WhatsApp Business Cloud API
 * (`POST /api/notifications/whatsapp/purchase-order`). These frontend helpers
 * are used as a **fallback** when the API is not configured or fails:
 *
 * WhatsApp Web URL format: https://wa.me/<phoneNumber>?text=<urlEncodedMessage>
 * Phone numbers must be in international format without +, spaces, dashes, etc.
 */

/**
 * Strip all non-digit characters from a phone number to produce a WhatsApp
 * "chat" URL compatible phone number (e.g. "+1 (555) 123-4567" → "15551234567").
 */
export function sanitizeWhatsAppNumber(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.replace(/\D/g, '');
}

/**
 * Build a `wa.me` link that opens a pre-filled WhatsApp message.
 */
export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanNumber = sanitizeWhatsAppNumber(phoneNumber);
  if (!cleanNumber) return '';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Format a purchase order's line items into a human-readable WhatsApp message.
 *
 * Structure:
 *   Hi [Rep Name],
 *
 *   We'd like to place the following order:
 *
 *   1. [Product Name] (SKU: xxx) — Qty: Y @ $Z = $Total
 *   2. ...
 *
 *   Subtotal: $X
 *
 *   PO #[poNumber] · Expected delivery: [date or "TBD"]
 *
 *   Notes: [notes or "None"]
 */
export function formatPOWhatsAppMessage(params: {
  representativeName?: string | null;
  poNumber: string;
  items: Array<{
    product?: { name?: string; sku?: string } | null;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
}): string {
  const { representativeName, poNumber, items, totalAmount, expectedDeliveryDate, notes } = params;

  const greeting = representativeName
    ? `Hi ${representativeName},`
    : 'Hello,';

  const lines: string[] = [greeting, '', "We'd like to place the following order:", ''];

  // Line items
  items.forEach((item, index) => {
    const productName = item.product?.name ?? 'Unnamed Product';
    const sku = item.product?.sku;
    const qty = item.quantity;
    const unitPrice = item.unitPrice;
    const lineTotal = unitPrice * qty;

    let line = `${index + 1}. ${productName}`;
    if (sku) {
      line += ` (SKU: ${sku})`;
    }
    line += ` — Qty: ${qty} @ $${unitPrice.toFixed(2)} = $${lineTotal.toFixed(2)}`;
    lines.push(line);
  });

  lines.push('');
  lines.push(`Subtotal: $${totalAmount.toFixed(2)}`);
  lines.push('');

  const deliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate).toLocaleDateString('en-US') : 'TBD';
  lines.push(`PO #${poNumber} · Expected delivery: ${deliveryDate}`);

  const notesText = notes ? notes : 'None';
  lines.push(`Notes: ${notesText}`);

  lines.push('');
  lines.push('Please confirm availability and delivery. Thank you!');

  return lines.join('\n');
}
