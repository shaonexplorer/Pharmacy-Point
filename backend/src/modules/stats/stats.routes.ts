/**
 * Stats routes — thin URL-to-controller mapping.
 */
import { Router } from 'express';
import { getStats } from './stats.controller';

const router = Router();

router.get('/', getStats);

export const statsRouter = router;
