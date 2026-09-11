/**
 * Order controller — HTTP request handlers.
 * Delegates business logic to orderService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
  serializeOrder,
  serializeOrderItem,
  serializeCustomer,
  serializeUser,
} from '../../utils/serializers';
import * as orderService from './order.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderRecord = Record<string, any>;

/**
 * GET /api/orders
 * List orders with pagination and optional filters.
 * Query params: page, limit, status, customerId, staffId
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listOrders({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    status: (req.query.status as string) || undefined,
    customerId: (req.query.customerId as string) || undefined,
    staffId: (req.query.staffId as string) || undefined,
  });

  res.json({
    data: result.data.map((order: OrderRecord) => ({
      ...serializeOrder(order),
      customer: order.customer
        ? {
            id: order.customer.id,
            name: order.customer.name,
            phone: order.customer.phone,
          }
        : null,
      items: (order.items as OrderRecord[]).map((item) => serializeOrderItem(item)),
    })),
    pagination: result.pagination,
  });
});

/**
 * GET /api/orders/:id
 * Get a single order by ID with items and product details.
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrder(req.params.id);
  const orderRecord = order as OrderRecord;
  res.json({
    data: {
      ...serializeOrder(orderRecord),
      customer: orderRecord.customer ? serializeCustomer(orderRecord.customer) : null,
      items: (orderRecord.items as OrderRecord[]).map((item) => serializeOrderItem(item)),
      user: orderRecord.user ? serializeUser(orderRecord.user) : null,
    },
  });
});

/**
 * POST /api/orders
 * Create a new order.
 * Body: { customerId?, items: [{ productId, quantity, price }], subtotal, discount, total, paymentMethod, staffId? }
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body);
  const orderRecord = order as OrderRecord;
  res.status(201).json({
    data: {
      ...serializeOrder(orderRecord),
      customer: orderRecord.customer ? serializeCustomer(orderRecord.customer) : null,
      items: (orderRecord.items as OrderRecord[]).map((item) => serializeOrderItem(item)),
      user: orderRecord.user ? serializeUser(orderRecord.user) : null,
    },
    message: 'Order created successfully',
  });
});

/**
 * PATCH /api/orders/:id/status
 * Update the status of an order.
 * Body: { status: 'PENDING' | 'COMPLETED' | 'CANCELLED' }
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  const orderRecord = order as OrderRecord;
  res.json({
    data: {
      ...serializeOrder(orderRecord),
      customer: orderRecord.customer ? serializeCustomer(orderRecord.customer) : null,
      items: (orderRecord.items as OrderRecord[]).map((item) => serializeOrderItem(item)),
    },
    message: 'Order status updated successfully',
  });
});

import { processRefund, processReturn, getReturns } from './order.service';

export async function refund(req: any, res: any, next: any) {
  try {
    const result = await processRefund(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function returnOrder(req: any, res: any, next: any) {
  try {
    const result = await processReturn(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function getReturnsCtrl(req: any, res: any, next: any) {
  try {
    const result = await getReturns(req.params.id);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

import nodemailer from 'nodemailer';
import prisma from '../../config/database';

export const sendReceiptEmail = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
  const { email } = req.body;
  if (!email || typeof email !== 'string') { res.status(400).json({ message: 'Email required' }); return; }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const html = `
<html><body style="font-family:sans-serif;padding:20px;color:#0b1c30">
<h2 style="color:#00685f">Pharmacy Point Receipt</h2>
<p>Order #${order.id.slice(0,8)} — REF:${order.id}</p>
<p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
<p>Customer: ${order.customer?.name ?? 'Walk-in'}</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0">
<tr style="background:#00685f;color:#fff"><th style="padding:6px;text-align:left">Item</th><th>Qty</th><th>Price</th></tr>
${order.items.map(i => `<tr><td>${i.product?.name ?? 'Unknown'}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">$${Number(i.price).toFixed(2)}</td></tr>`).join('')}
</table>
<p><strong>Subtotal:</strong> $${Number(order.subtotal ?? order.total).toFixed(2)}</p>
<p><strong>Discount:</strong> -$${Number(order.discount ?? 0).toFixed(2)}</p>
<p><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
<p style="font-size:12px;color:#5b6b6b">License #PH-28491-NE • 1200 Medical Center Dr, Suite 300</p>
</body></html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'pharmacy@point.com',
    to: email,
    subject: `Pharmacy Point Receipt — Order #${order.id.slice(0, 8)}`,
    html,
  });

  res.json({ success: true, message: 'Receipt emailed successfully', email });
});

export const getReceiptHTML = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: { include: { product: true } }, user: true },
  });
  if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt ${order.id.slice(0,8)}</title>
<style>body{font-family:'JetBrains Mono',monospace;padding:20px;color:#0b1c30;background:#f8f9ff;max-width:280px;margin:auto}
.header{text-align:center;border-bottom:2px solid #00685f;padding-bottom:10px}
.dashboard-msg{text-align:center;font-size:12px;color:#5b6b6b}</style></head><body>
<div class="header"><h1 style="color:#00685f">Pharmacy Point</h1><p>License #PH-28491-NE • 1200 Medical Center Dr</p><p>Order #${order.id.slice(0,8)} • REF:${order.id}</p></div>
<p>Customer: ${order.customer?.name ?? 'Walk-in'}</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#00685f;color:#fff"><th style="padding:4px">Item</th><th>Qty</th><th>Price</th></tr>
${order.items.map(i => `<tr><td>${i.product?.name ?? 'Unknown'}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">$${Number(i.price).toFixed(2)}</td></tr>`).join('')}
</table>
<p><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
<p>Staff: ${order.user?.name ?? 'N/A'} • Payment: ${(order.paymentMethod ?? 'cash').toUpperCase()}</p>
</body></html>`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.id.slice(0,8)}.html"`);
  res.send(html);
});

export const syncOfflineOrders = asyncHandler(async (req: Request, res: Response) => {
  const { orders } = req.body as import('./offline.dto').OfflineSyncInput;
  const created: string[] = [];
  for (const o of orders) {
    const result = await orderService.createOrder({ ...o, isOffline: false, staffId: o.staffId ?? undefined });
    created.push(result.id);
  }
  res.json({ success: true, synced: created.length, orders: created });
});
