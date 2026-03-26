import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { LoginSchema } from '@yoavchu/shared';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { Invoice4uService } from '../services/invoice4u.service';
import { getDb, schema } from '../db/index';
import { eq } from 'drizzle-orm';

const router = Router();

// POST /api/auth/login
router.post('/login', authRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const { token, userId } = await Invoice4uService.login(email, password);

    // Find or create user in our DB
    let user;
    try {
      const db = getDb();
      const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

      if (existing.length > 0) {
        user = existing[0];
        // Update invoice4u user id if changed
        if (userId && user.invoice4uUserId !== userId) {
          await db.update(schema.users)
            .set({ invoice4uUserId: userId, updatedAt: new Date() })
            .where(eq(schema.users.id, user.id));
        }
      } else {
        const [newUser] = await db.insert(schema.users).values({
          email,
          displayName: email.split('@')[0],
          invoice4uUserId: userId,
        }).returning();
        user = newUser;
      }
    } catch (dbErr) {
      // DB not available in dev - use mock user
      console.warn('DB not available, using mock user:', dbErr);
      user = {
        id: 'mock-user-id',
        email,
        displayName: email.split('@')[0],
        invoice4uUserId: userId,
      };
    }

    // Store session
    req.session.invoice4uToken = token;
    req.session.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName || null,
    };

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
    });

    res.clearCookie('connect.sid');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.session.user });
});

export default router;
