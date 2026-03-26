"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@yoavchu/shared");
const auth_middleware_1 = require("../middleware/auth.middleware");
const invoice4u_service_1 = require("../services/invoice4u.service");
const dashboard_service_1 = require("../services/dashboard.service");
const router = (0, express_1.Router)();
// All dashboard routes require authentication
router.use(auth_middleware_1.requireAuth);
// GET /api/dashboard
router.get('/', async (req, res, next) => {
    try {
        const query = shared_1.DashboardQuerySchema.parse(req.query);
        const token = req.session.invoice4uToken;
        const invoice4uService = new invoice4u_service_1.Invoice4uService(token);
        const dashboardService = new dashboard_service_1.DashboardService(invoice4uService);
        const data = await dashboardService.getDashboardData({
            period: query.period,
            clientId: query.clientId,
        });
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/dashboard/trend
router.get('/trend', async (req, res, next) => {
    try {
        const clientId = req.query.clientId;
        const token = req.session.invoice4uToken;
        const invoice4uService = new invoice4u_service_1.Invoice4uService(token);
        const dashboardService = new dashboard_service_1.DashboardService(invoice4uService);
        const data = await dashboardService.getTrendData({ clientId });
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map