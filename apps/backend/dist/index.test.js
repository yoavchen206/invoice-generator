"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("./index"));
(0, vitest_1.describe)('Backend API', () => {
    (0, vitest_1.describe)('GET /api/health', () => {
        (0, vitest_1.it)('should return health status', async () => {
            const res = await (0, supertest_1.default)(index_1.default).get('/api/health');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.status).toBe('ok');
            (0, vitest_1.expect)(res.body.version).toBe('1.0.0');
            (0, vitest_1.expect)(res.body.timestamp).toBeDefined();
        });
    });
    (0, vitest_1.describe)('Authentication', () => {
        (0, vitest_1.it)('should return 401 for protected routes without session', async () => {
            const res = await (0, supertest_1.default)(index_1.default).get('/api/invoices');
            (0, vitest_1.expect)(res.status).toBe(401);
            (0, vitest_1.expect)(res.body.error.code).toBe('UNAUTHORIZED');
        });
        (0, vitest_1.it)('should return 401 for dashboard without session', async () => {
            const res = await (0, supertest_1.default)(index_1.default).get('/api/dashboard');
            (0, vitest_1.expect)(res.status).toBe(401);
        });
        (0, vitest_1.it)('should return 401 for clients without session', async () => {
            const res = await (0, supertest_1.default)(index_1.default).get('/api/clients');
            (0, vitest_1.expect)(res.status).toBe(401);
        });
        (0, vitest_1.it)('should reject login with missing credentials', async () => {
            const res = await (0, supertest_1.default)(index_1.default).post('/api/auth/login').send({});
            (0, vitest_1.expect)(res.status).toBe(400);
        });
        (0, vitest_1.it)('should login with valid credentials', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.user).toBeDefined();
            (0, vitest_1.expect)(res.body.user.email).toBe('test@example.com');
        });
    });
    (0, vitest_1.describe)('Invoice Routes (authenticated)', () => {
        let cookies;
        (0, vitest_1.beforeAll)(async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });
            cookies = res.headers['set-cookie'];
        });
        (0, vitest_1.it)('should get invoices list', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .get('/api/invoices')
                .set('Cookie', cookies);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(Array.isArray(res.body.invoices)).toBe(true);
            (0, vitest_1.expect)(res.body.pagination).toBeDefined();
        });
        (0, vitest_1.it)('should get invoices with status filter', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .get('/api/invoices?status=paid')
                .set('Cookie', cookies);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.invoices.every((inv) => inv.status === 'paid')).toBe(true);
        });
        (0, vitest_1.it)('should get a specific invoice', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .get('/api/invoices/inv-1')
                .set('Cookie', cookies);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.invoice.id).toBe('inv-1');
        });
        (0, vitest_1.it)('should return 404 for nonexistent invoice', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .get('/api/invoices/nonexistent-id')
                .set('Cookie', cookies);
            (0, vitest_1.expect)(res.status).toBe(404);
        });
        (0, vitest_1.it)('should create an invoice', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .post('/api/invoices')
                .set('Cookie', cookies)
                .send({
                clientId: 'client-1',
                lineItems: [
                    { description: 'Design Work', quantity: 1, unitPrice: 1000 }
                ],
                issueDate: '2026-03-26',
            });
            (0, vitest_1.expect)(res.status).toBe(201);
            (0, vitest_1.expect)(res.body.invoice).toBeDefined();
            (0, vitest_1.expect)(res.body.invoice.client.id).toBe('client-1');
        });
        (0, vitest_1.it)('should reject invoice creation with invalid data', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .post('/api/invoices')
                .set('Cookie', cookies)
                .send({ lineItems: [] });
            (0, vitest_1.expect)(res.status).toBe(400);
        });
    });
    (0, vitest_1.describe)('Client Routes (authenticated)', () => {
        let cookies;
        (0, vitest_1.beforeAll)(async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });
            cookies = res.headers['set-cookie'];
        });
        (0, vitest_1.it)('should get clients list', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .get('/api/clients')
                .set('Cookie', cookies);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(Array.isArray(res.body.clients)).toBe(true);
        });
        (0, vitest_1.it)('should create a client', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .post('/api/clients')
                .set('Cookie', cookies)
                .send({
                name: 'New Test Client',
                email: 'newclient@test.com',
            });
            (0, vitest_1.expect)(res.status).toBe(201);
            (0, vitest_1.expect)(res.body.client.name).toBe('New Test Client');
        });
        (0, vitest_1.it)('should update a client', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .put('/api/clients/client-1')
                .set('Cookie', cookies)
                .send({ phone: '+972-99-999-9999' });
            (0, vitest_1.expect)(res.status).toBe(200);
        });
        (0, vitest_1.it)('should delete a client', async () => {
            // Create a client first
            const createRes = await (0, supertest_1.default)(index_1.default)
                .post('/api/clients')
                .set('Cookie', cookies)
                .send({ name: 'To Delete', email: 'delete@test.com' });
            const clientId = createRes.body.client.id;
            const res = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/clients/${clientId}`)
                .set('Cookie', cookies);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.ok).toBe(true);
        });
    });
    (0, vitest_1.describe)('Dashboard Routes (authenticated)', () => {
        let cookies;
        (0, vitest_1.beforeAll)(async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });
            cookies = res.headers['set-cookie'];
        });
        (0, vitest_1.it)('should get dashboard data', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .get('/api/dashboard')
                .set('Cookie', cookies);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.metrics).toBeDefined();
            (0, vitest_1.expect)(res.body.recentInvoices).toBeDefined();
            (0, vitest_1.expect)(res.body.periodLabel).toBeDefined();
        });
        (0, vitest_1.it)('should get dashboard trend data', async () => {
            const res = await (0, supertest_1.default)(index_1.default)
                .get('/api/dashboard/trend')
                .set('Cookie', cookies);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(Array.isArray(res.body.trend)).toBe(true);
            (0, vitest_1.expect)(res.body.trend).toHaveLength(12);
        });
    });
    (0, vitest_1.describe)('404 handling', () => {
        (0, vitest_1.it)('should return 404 for unknown routes', async () => {
            const res = await (0, supertest_1.default)(index_1.default).get('/api/unknown-route');
            (0, vitest_1.expect)(res.status).toBe(404);
        });
    });
});
//# sourceMappingURL=index.test.js.map