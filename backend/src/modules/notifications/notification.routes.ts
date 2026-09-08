import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { sendAlertSchema, dueAccountAlertSchema } from './notification.dto';
import { sendAlerts, sendDueAccountAlerts } from './notification.controller';

const router = Router();
router.post('/send', validate(sendAlertSchema), sendAlerts);
router.post('/send/due-accounts', validate(dueAccountAlertSchema), sendDueAccountAlerts);
export const notificationRouter = router;
