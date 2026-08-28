import type { Request, Response, NextFunction } from 'express';

/**
 * AppError — a custom error class for operational (expected) errors.
 * Usage: `throw new AppError(409, 'SKU already exists')`
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Central Express error-handling middleware.
 * Must be registered LAST (after all routes).
 *
 * Maps Prisma known error codes to HTTP status codes, and Zod
 * validation errors to 400 with structured detail.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Log the error with request context
  const method = req.method;
  const path = req.path;
  const body = req.body;
  console.error(`[${method} ${path}] Error:`, err);
  if (body && Object.keys(body as Record<string, unknown>).length > 0) {
    console.error(`[${method} ${path}] Request body:`, JSON.stringify(body));
  }

  // AppError — our own operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.isOperational ? {} : { stack: err.stack }),
    });
    return;
  }

  // Generic Error with statusCode (e.g. from notFound middleware)
  if (err instanceof Error && 'statusCode' in err) {
    const status = (err as Error & { statusCode: number }).statusCode;
    res.status(status).json({ error: err.message });
    return;
  }

  // Zod validation errors
  if (
    err &&
    typeof err === 'object' &&
    'issues' in err &&
    Array.isArray((err as { issues: unknown[] }).issues)
  ) {
    const issues = (
      err as { issues: { message: string; path: (string | number)[]; code?: string }[] }
    ).issues;
    res.status(400).json({
      error: 'Validation failed',
      details: issues.map((issue) => ({
        message: issue.message,
        path: issue.path,
        code: issue.code,
      })),
    });
    return;
  }

  // Prisma error codes
  if (err && typeof err === 'object' && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string }; message: string };

    switch (prismaErr.code) {
      case 'P2002': {
        const target = prismaErr.meta?.target ? String(prismaErr.meta.target) : 'field';
        res.status(409).json({
          error: 'Conflict: duplicate value',
          details: `Unique constraint violation on ${target}`,
        });
        return;
      }
      case 'P2025':
        res.status(404).json({ error: 'Resource not found' });
        return;
      case 'P2003':
        res.status(400).json({
          error: 'Foreign key constraint violation',
          details: 'Referenced resource does not exist',
        });
        return;
      case 'P2023':
        res.status(400).json({ error: 'Invalid query — column filter mismatch' });
        return;
      default:
        console.error('Unhandled Prisma error code:', prismaErr.code);
    }
  }

  // Default: 500 Internal Server Error
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development'
      ? { stack: err instanceof Error ? err.stack : String(err) }
      : {}),
  });
}
