import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { sendAlertSchema } from './notification.dto';
import { sendAlerts } from './notification.controller';

const router = Router();
router.post('/send', validate(sendAlertSchema), sendAlerts);
export const notificationRouter = router;
