import { Router } from 'express';
import { auth } from '../config/auth';
import { toExpressHandler } from 'better-auth/express';

const router = Router();

// BetterAuth Express handler
router.all('/api/auth/*', toExpressHandler(auth));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', auth: 'initialized' });
});

export default router;