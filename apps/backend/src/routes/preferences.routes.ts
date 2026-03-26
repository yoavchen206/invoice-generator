import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { UpdatePreferencesSchema } from '@yoavchu/shared';
import { requireAuth } from '../middleware/auth.middleware';
import { getDb, schema } from '../db/index';
import { eq } from 'drizzle-orm';

const router = Router();

router.use(requireAuth);

// GET /api/preferences
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } });
      return;
    }

    try {
      const db = getDb();
      const [prefs] = await db.select()
        .from(schema.userPreferences)
        .where(eq(schema.userPreferences.userId, userId))
        .limit(1);

      if (prefs) {
        res.json({
          preferences: {
            defaultPeriod: prefs.defaultPeriod,
            sidebarCollapsed: prefs.sidebarCollapsed,
          },
        });
      } else {
        res.json({
          preferences: {
            defaultPeriod: 'this_month',
            sidebarCollapsed: false,
          },
        });
      }
    } catch {
      // Return defaults if DB unavailable
      res.json({
        preferences: {
          defaultPeriod: 'this_month',
          sidebarCollapsed: false,
        },
      });
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /api/preferences
router.patch('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } });
      return;
    }

    const payload = UpdatePreferencesSchema.parse(req.body);

    try {
      const db = getDb();
      await db.insert(schema.userPreferences).values({
        userId,
        defaultPeriod: payload.defaultPeriod || 'this_month',
        sidebarCollapsed: payload.sidebarCollapsed ?? false,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: schema.userPreferences.userId,
        set: {
          ...(payload.defaultPeriod ? { defaultPeriod: payload.defaultPeriod } : {}),
          ...(payload.sidebarCollapsed !== undefined ? { sidebarCollapsed: payload.sidebarCollapsed } : {}),
          updatedAt: new Date(),
        },
      });

      const [updated] = await db.select()
        .from(schema.userPreferences)
        .where(eq(schema.userPreferences.userId, userId))
        .limit(1);

      res.json({
        preferences: {
          defaultPeriod: updated?.defaultPeriod || 'this_month',
          sidebarCollapsed: updated?.sidebarCollapsed ?? false,
        },
      });
    } catch {
      res.json({
        preferences: {
          defaultPeriod: payload.defaultPeriod || 'this_month',
          sidebarCollapsed: payload.sidebarCollapsed ?? false,
        },
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
