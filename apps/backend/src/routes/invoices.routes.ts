import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { CreateInvoiceSchema, InvoiceListQuerySchema } from '@yoavchu/shared';
import { requireAuth } from '../middleware/auth.middleware';
import { invoiceCreateRateLimit } from '../middleware/rateLimit.middleware';
import { Invoice4uService } from '../services/invoice4u.service';

const router = Router();

// All invoice routes require authentication
router.use(requireAuth);

// GET /api/invoices
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = InvoiceListQuerySchema.parse(req.query);
    const token = req.session.invoice4uToken!;
    const service = new Invoice4uService(token);

    // Build date range from period
    let from: string | undefined;
    let to: string | undefined;

    if (query.period && query.period !== 'custom') {
      const { getPeriodDateRange } = await import('../lib/dateUtils');
      const range = getPeriodDateRange(query.period);
      from = range.from.toISOString().split('T')[0];
      to = range.to.toISOString().split('T')[0];
    } else if (query.period === 'custom') {
      from = query.from;
      to = query.to;
    }

    const { invoices, total } = await service.getInvoices({
      status: query.status,
      clientId: query.clientId,
      from,
      to,
      page: query.page,
      limit: query.limit,
    });

    const page = query.page || 1;
    const limit = query.limit || 25;

    res.json({
      invoices,
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

// GET /api/invoices/:invoiceId
router.get('/:invoiceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoiceId } = req.params;
    const token = req.session.invoice4uToken!;
    const service = new Invoice4uService(token);

    const invoice = await service.getInvoice(invoiceId);
    res.json({ invoice });
  } catch (err) {
    next(err);
  }
});

// POST /api/invoices
router.post('/', invoiceCreateRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = CreateInvoiceSchema.parse(req.body);
    const token = req.session.invoice4uToken!;
    const service = new Invoice4uService(token);

    const invoice = await service.createInvoice(payload);
    res.status(201).json({ invoice });
  } catch (err) {
    next(err);
  }
});

export default router;
