import Stripe from "stripe";
import nodemailer from 'nodemailer';
import { CheckoutInput } from "./payment.dto";
import { AppError } from "../../middleware/errorHandler";
import { prisma } from "../../config/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_", {
  apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion,
});

export async function createCheckoutSession(input: CheckoutInput) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: input.currency,
            product_data: { name: "Pharmacy Order" },
            unit_amount: Math.round(input.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/pos?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/pos`,
      metadata: input.orderId ? { orderId: input.orderId } : {},
    });
    return { sessionId: session.id, url: session.url };
  } catch (err: any) {
    throw new AppError(500, `Stripe error: ${err.message}`);
  }
}

export async function handleWebhook(payload: any, sig: string) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    throw new AppError(400, `Webhook signature verification failed: ${err.message}`);
  }
  return event;
}

/**
 * Send payment reminder emails to customers with due amounts.
 * Queries customers with outstanding due amounts and sends reminder emails.
 */
export async function sendPaymentReminders() {
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
  const transporter = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  const mailTransporter = nodemailer.createTransport(transporter);

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
