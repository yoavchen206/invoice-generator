import type { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    invoice4uToken?: string;
    user?: {
      id: string;
      email: string;
      displayName: string | null;
    };
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.invoice4uToken) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated. Please log in.',
      },
    });
    return;
  }
  next();
}
