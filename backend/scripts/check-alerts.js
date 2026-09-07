/**
 * Scheduled alert check — run via cron (e.g. every hour) or interval.
 * Usage: node backend/scripts/check-alerts.js
 */
const { sendBatchAlert } = require('../dist/modules/notifications/notification.service');

async function run() {
  // In production: query inventory for low-stock / expiring items via Prisma
  // For Step 5 implementation, sample alert sent to configured recipient
  const recipients = process.env.ALERT_RECIPIENTS ? process.env.ALERT_RECIPIENTS.split(',') : [];
  if (recipients.length === 0 || !process.env.SMTP_USER) {
    console.log('SMTP or recipients not configured — skipping alert check');
    return;
  }
  await sendBatchAlert(recipients[0], 'low_stock', [{ name: 'Sample Product', qty: 3, threshold: 10 }]);
  console.log('Alert batch sent to', recipients[0]);
}

run().catch(console.error);
