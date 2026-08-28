import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * 404 catch-all middleware.
 * Registers after all routes so any unmatched path returns JSON.
 */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Not Found — ${req.method} ${req.originalUrl}`));
}
