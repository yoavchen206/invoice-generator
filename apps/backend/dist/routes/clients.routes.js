"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@yoavchu/shared");
const auth_middleware_1 = require("../middleware/auth.middleware");
const invoice4u_service_1 = require("../services/invoice4u.service");
const router = (0, express_1.Router)();
// All client routes require authentication
router.use(auth_middleware_1.requireAuth);
// GET /api/clients
router.get('/', async (req, res, next) => {
    try {
        const search = req.query.search;
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 50, 200);
        const token = req.session.invoice4uToken;
        const service = new invoice4u_service_1.Invoice4uService(token);
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/clients/:clientId
router.get('/:clientId', async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const token = req.session.invoice4uToken;
        const service = new invoice4u_service_1.Invoice4uService(token);
        const client = await service.getClient(clientId);
        res.json({ client });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/clients
router.post('/', async (req, res, next) => {
    try {
        const payload = shared_1.CreateClientSchema.parse(req.body);
        const token = req.session.invoice4uToken;
        const service = new invoice4u_service_1.Invoice4uService(token);
        const client = await service.createClient(payload);
        res.status(201).json({ client });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/clients/:clientId
router.put('/:clientId', async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const payload = shared_1.UpdateClientSchema.parse(req.body);
        const token = req.session.invoice4uToken;
        const service = new invoice4u_service_1.Invoice4uService(token);
        const client = await service.updateClient(clientId, payload);
        res.json({ client });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/clients/:clientId
router.delete('/:clientId', async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const token = req.session.invoice4uToken;
        const service = new invoice4u_service_1.Invoice4uService(token);
        await service.deleteClient(clientId);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=clients.routes.js.map