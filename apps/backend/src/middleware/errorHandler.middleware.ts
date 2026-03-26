import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod validation errors (check by name too for cross-module instances)
  if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
    const zodErr = err as ZodError;
    const fields: Record<string, string> = {};
    if (zodErr.issues) {
      for (const issue of zodErr.issues) {
        const path = issue.path.join('.');
        fields[path] = issue.message;
      }
    }
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        fields,
      },
    });
    return;
  }

  // Handle known API errors
  if (typeof err === 'object' && err !== null && 'code' in err && 'status' in err) {
    const apiErr = err as { status: number; code: string; message: string };
    res.status(apiErr.status || 500).json({
      error: {
        code: apiErr.code || 'INTERNAL_ERROR',
        message: apiErr.message || 'An error occurred.',
      },
    });
    return;
  }

  // Handle standard errors
  if (err instanceof Error) {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
}
