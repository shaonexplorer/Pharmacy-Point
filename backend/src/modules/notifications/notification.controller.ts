import { Request, Response, NextFunction } from 'express';
import { sendBatchAlert } from './notification.service';
import { sendAlertSchema } from './notification.dto';
import { asyncHandler } from '../../middleware/asyncHandler';

export const sendAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { type, recipients } = sendAlertSchema.parse(req.body);
  const to = recipients || (process.env.ALERT_RECIPIENTS ? process.env.ALERT_RECIPIENTS.split(',') : []);
  if (to.length === 0) throw new Error('No recipients configured');
  // Build sample data; in production this queries inventory service
  const items = [{ name: 'Sample Product', qty: 3, threshold: 10 }];
  await sendBatchAlert(to[0], type, items);
  res.json({ sent: true, to });
});
