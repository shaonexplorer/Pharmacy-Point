import Stripe from "stripe";
import { CheckoutInput } from "./payment.dto";
import { AppError } from "../../middleware/errorHandler";

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
