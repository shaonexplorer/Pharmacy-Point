import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Validation middleware.
 *
 * Passes `req.body` (or `req.query` / `req.params`) through a Zod schema.
 * On success, the parsed (and potentially transformed) value is written
 * back to the request location so downstream handlers receive typed, sanitized data.
 * On failure, calls `next(error)` so the central error handler returns 400.
 *
 * Usage:
 *   router.post('/', validate(productDto.createSchema), controller.create);
 */
export function validate<T extends ZodSchema<unknown>>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = req[source] as unknown;
    const result = schema.safeParse(data);

    if (!result.success) {
      next(result.error);
      return;
    }

    // Replace the parsed data (Zod may transform/coerce values).
    // Express 5.x defines req.query as a getter-only property, so we must
    // use Object.defineProperty to overwrite it (direct assignment throws).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
    });
    next();
  };
}
