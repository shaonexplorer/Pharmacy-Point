/**
 * Stats controller — HTTP request handlers.
 * Delegates business logic to statsService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as statsService from './stats.service';

/**
 * GET /api/stats
 * Get aggregated statistics for the dashboard.
 */
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await statsService.getStats();
  res.json(stats);
});
