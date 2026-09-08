import { Router } from "express";
import { checkout, webhook } from "./payment.controller";
import { validate } from "../../middleware/validate";
import { checkoutSchema } from "./payment.dto";

const router = Router();
router.post("/checkout", validate(checkoutSchema), checkout);
router.post("/webhook", webhook);

export default router;
