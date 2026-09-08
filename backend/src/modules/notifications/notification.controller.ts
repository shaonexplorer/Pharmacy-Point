import { Request, Response, NextFunction } from 'express';
import { sendBatchAlert, sendDueAccountAlert } from './notification.service';
import { sendAlertSchema, dueAccountAlertSchema } from './notification.dto';
import { asyncHandler } from '../../middleware/asyncHandler';
import { prisma } from '../../config/database';

export const sendDueAccountAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { threshold, recipients } = dueAccountAlertSchema.parse(req.body);
  const to = recipients || (process.env.ALERT_RECIPIENTS ? process.env.ALERT_RECIPIENTS.split(',') : []);
  if (to.length === 0) throw new Error('No recipients configured');
  const overdueCustomers = await prisma.customer.findMany({
    where: { dueAmount: { gt: threshold } },
    select: { name: true, dueAmount: true, id: true },
  });
  const items = overdueCustomers.map(c => ({ customerName: c.name || c.id, dueAmount: Number(c.dueAmount || 0), threshold }));
  await sendBatchAlert(to[0], 'due_account', items);
  // Also send individual alerts for high-value accounts
  for (const c of overdueCustomers) {
    await sendDueAccountAlert(to[0], c.name || 'Customer', Number(c.dueAmount || 0), threshold);
  }
  res.json({ sent: true, to, count: overdueCustomers.length, customers: overdueCustomers.map(c => ({ name: c.name, dueAmount: Number(c.dueAmount || 0) })) });
});

export const sendAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { type, recipients } = sendAlertSchema.parse(req.body);
  const to = recipients || (process.env.ALERT_RECIPIENTS ? process.env.ALERT_RECIPIENTS.split(',') : []);
  if (to.length === 0) throw new Error('No recipients configured');
  // Build sample data; in production this queries inventory service
  const items = [{ name: 'Sample Product', qty: 3, threshold: 10 }];
  await sendBatchAlert(to[0], type, items);
  res.json({ sent: true, to });
});
