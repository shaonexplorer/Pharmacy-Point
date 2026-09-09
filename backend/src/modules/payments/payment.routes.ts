import { Router } from "express";
import { checkout, webhook, sendPaymentReminders } from "./payment.controller";
import { validate } from "../../middleware/validate";
import { checkoutSchema } from "./payment.dto";
import { z } from "zod";

const router = Router();
router.post("/checkout", validate(checkoutSchema), checkout);
router.post("/webhook", webhook);
router.post("/reminders", validate(zod.object({})), sendPaymentReminders);
export default router;