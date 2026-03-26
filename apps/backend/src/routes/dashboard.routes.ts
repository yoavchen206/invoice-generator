import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { DashboardQuerySchema } from '@yoavchu/shared';
import { requireAuth } from '../middleware/auth.middleware';
import { Invoice4uService } from '../services/invoice4u.service';
import { DashboardService } from '../services/dashboard.service';

const router = Router();

// All dashboard routes require authentication
router.use(requireAuth);

// GET /api/dashboard
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = DashboardQuerySchema.parse(req.query);
    const token = req.session.invoice4uToken!;

    const invoice4uService = new Invoice4uService(token);
    const dashboardService = new DashboardService(invoice4uService);

    const data = await dashboardService.getDashboardData({
      period: query.period,
      clientId: query.clientId,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/trend
router.get('/trend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const token = req.session.invoice4uToken!;

    const invoice4uService = new Invoice4uService(token);
    const dashboardService = new DashboardService(invoice4uService);

    const data = await dashboardService.getTrendData({ clientId });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
