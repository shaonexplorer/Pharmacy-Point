import nodemailer from 'nodemailer';
import { AppError } from '../../middleware/errorHandler';

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

export async function sendLowStockAlert(recipient: string, productName: string, qty: number, threshold: number) {
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

export async function sendDueAccountAlert(recipient: string, customerName: string, dueAmount: number, threshold: number) {
  if (!process.env.SMTP_USER) throw new AppError(500, 'SMTP not configured');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: `Due Account Alert: ${customerName}`,
    html: dueAccountTemplate(customerName, dueAmount, threshold),
  });
}

export async function sendBatchAlert(recipient: string, type: 'low_stock' | 'expiry_approaching' | 'expired' | 'due_account', items: { name?: string; customerName?: string; qty?: number; days?: number; threshold?: number; dueAmount?: number }[]) {
  if (!process.env.SMTP_USER) throw new AppError(500, 'SMTP not configured');
  const html = items.map(i => {
    if (type === 'low_stock') return `<li><strong>${i.name}</strong>: qty ${i.qty} (threshold ${i.threshold})</li>`;
    if (type === 'due_account') return `<li><strong>${i.customerName}</strong>: due $${i.dueAmount?.toFixed(2)} (threshold $${i.threshold?.toFixed(2)})</li>`;
    return `<li><strong>${i.name}</strong>: ${i.days} days</li>`;
  }).join('');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: `Inventory Alert — ${type.replace('_', ' ')}`,
    html: `<h2>Inventory Alert</h2><ul>${html}</ul>`,
  });
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
