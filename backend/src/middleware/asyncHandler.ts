import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrap an async route handler so that rejected promises are forwarded
 * to Express's error middleware.
 *
 * Express 5 handles async rejections natively, but this wrapper provides:
 * - Consistent error catching across sync and async handlers
 * - A clear signal that the handler is async (for code reviews)
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
