import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { createCheckoutSession, handleWebhook, sendPaymentReminders as sendRemindersService } from "./payment.service";
import { checkoutSchema } from "./payment.dto";
import { validate } from "../../middleware/validate";

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const data = checkoutSchema.parse(req.body);
  const result = await createCheckoutSession(data);
  res.json({ success: true, ...result });
});

export const sendPaymentReminders = asyncHandler(async (req: Request, res: Response) => {
  await sendRemindersService();
  res.json({ success: true, message: 'Reminders sent' });
});

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const event = await handleWebhook(req.body, sig);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    // TODO: update order with paymentIntentId in future step
  }
  res.json({ received: true });
});
