import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { sendAlertSchema, dueAccountAlertSchema, whatsappMessageSchema, whatsappPORequestSchema } from './notification.dto';
import {
  sendAlerts,
  sendDueAccountAlerts,
  sendPaymentReminders,
  sendWhatsApp,
  sendWhatsAppPurchaseOrder,
  getWhatsAppStatus,
} from './notification.controller';

const router = Router();

// Email / batch alerts
router.post('/send', validate(sendAlertSchema), sendAlerts);
router.post('/send/due-accounts', validate(dueAccountAlertSchema), sendDueAccountAlerts);
router.post('/reminders', sendPaymentReminders);

// WhatsApp Business Cloud API
router.get('/whatsapp/status', getWhatsAppStatus);
router.post('/whatsapp', validate(whatsappMessageSchema), sendWhatsApp);
router.post(
  '/whatsapp/purchase-order',
  validate(whatsappPORequestSchema),
  sendWhatsAppPurchaseOrder
);

export const notificationRouter = router;
