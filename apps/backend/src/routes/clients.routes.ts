import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { CreateClientSchema, UpdateClientSchema } from '@yoavchu/shared';
import { requireAuth } from '../middleware/auth.middleware';
import { Invoice4uService } from '../services/invoice4u.service';

const router = Router();

// All client routes require authentication
router.use(requireAuth);

// GET /api/clients
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const token = req.session.invoice4uToken!;
    const service = new Invoice4uService(token);

    const { clients, total } = await service.getClients({ search, page, limit });

    res.json({
      clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/clients/:clientId
router.get('/:clientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const token = req.session.invoice4uToken!;
    const service = new Invoice4uService(token);

    const client = await service.getClient(clientId);
    res.json({ client });
  } catch (err) {
    next(err);
  }
});

// POST /api/clients
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = CreateClientSchema.parse(req.body);
    const token = req.session.invoice4uToken!;
    const service = new Invoice4uService(token);

    const client = await service.createClient(payload);
    res.status(201).json({ client });
  } catch (err) {
    next(err);
  }
});

// PUT /api/clients/:clientId
router.put('/:clientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const payload = UpdateClientSchema.parse(req.body);
    const token = req.session.invoice4uToken!;
    const service = new Invoice4uService(token);

    const client = await service.updateClient(clientId, payload);
    res.json({ client });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/clients/:clientId
router.delete('/:clientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const token = req.session.invoice4uToken!;
    const service = new Invoice4uService(token);

    await service.deleteClient(clientId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
