"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@yoavchu/shared");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const invoice4u_service_1 = require("../services/invoice4u.service");
const router = (0, express_1.Router)();
// All invoice routes require authentication
router.use(auth_middleware_1.requireAuth);
// GET /api/invoices
router.get('/', async (req, res, next) => {
    try {
        const query = shared_1.InvoiceListQuerySchema.parse(req.query);
        const token = req.session.invoice4uToken;
        const service = new invoice4u_service_1.Invoice4uService(token);
        // Build date range from period
        let from;
        let to;
        if (query.period && query.period !== 'custom') {
            const { getPeriodDateRange } = await Promise.resolve().then(() => __importStar(require('../lib/dateUtils')));
            const range = getPeriodDateRange(query.period);
            from = range.from.toISOString().split('T')[0];
            to = range.to.toISOString().split('T')[0];
        }
        else if (query.period === 'custom') {
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/invoices/:invoiceId
router.get('/:invoiceId', async (req, res, next) => {
    try {
        const { invoiceId } = req.params;
        const token = req.session.invoice4uToken;
        const service = new invoice4u_service_1.Invoice4uService(token);
        const invoice = await service.getInvoice(invoiceId);
        res.json({ invoice });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/invoices
router.post('/', rateLimit_middleware_1.invoiceCreateRateLimit, async (req, res, next) => {
    try {
        const payload = shared_1.CreateInvoiceSchema.parse(req.body);
        const token = req.session.invoice4uToken;
        const service = new invoice4u_service_1.Invoice4uService(token);
        const invoice = await service.createInvoice(payload);
        res.status(201).json({ invoice });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=invoices.routes.js.map