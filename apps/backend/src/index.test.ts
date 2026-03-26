import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from './index';

describe('Backend API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should return 401 for protected routes without session', async () => {
      const res = await request(app).get('/api/invoices');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for dashboard without session', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401);
    });

    it('should return 401 for clients without session', async () => {
      const res = await request(app).get('/api/clients');
      expect(res.status).toBe(401);
    });

    it('should reject login with missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
    });
  });

  describe('Invoice Routes (authenticated)', () => {
    let cookies: string[];

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      cookies = res.headers['set-cookie'] as unknown as string[];
    });

    it('should get invoices list', async () => {
      const res = await request(app)
        .get('/api/invoices')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.invoices)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should get invoices with status filter', async () => {
      const res = await request(app)
        .get('/api/invoices?status=paid')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.invoices.every((inv: { status: string }) => inv.status === 'paid')).toBe(true);
    });

    it('should get a specific invoice', async () => {
      const res = await request(app)
        .get('/api/invoices/inv-1')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.invoice.id).toBe('inv-1');
    });

    it('should return 404 for nonexistent invoice', async () => {
      const res = await request(app)
        .get('/api/invoices/nonexistent-id')
        .set('Cookie', cookies);
      expect(res.status).toBe(404);
    });

    it('should create an invoice', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', cookies)
        .send({
          clientId: 'client-1',
          lineItems: [
            { description: 'Design Work', quantity: 1, unitPrice: 1000 }
          ],
          issueDate: '2026-03-26',
        });
      expect(res.status).toBe(201);
      expect(res.body.invoice).toBeDefined();
      expect(res.body.invoice.client.id).toBe('client-1');
    });

    it('should reject invoice creation with invalid data', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', cookies)
        .send({ lineItems: [] });
      expect(res.status).toBe(400);
    });
  });

  describe('Client Routes (authenticated)', () => {
    let cookies: string[];

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      cookies = res.headers['set-cookie'] as unknown as string[];
    });

    it('should get clients list', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.clients)).toBe(true);
    });

    it('should create a client', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', cookies)
        .send({
          name: 'New Test Client',
          email: 'newclient@test.com',
        });
      expect(res.status).toBe(201);
      expect(res.body.client.name).toBe('New Test Client');
    });

    it('should update a client', async () => {
      const res = await request(app)
        .put('/api/clients/client-1')
        .set('Cookie', cookies)
        .send({ phone: '+972-99-999-9999' });
      expect(res.status).toBe(200);
    });

    it('should delete a client', async () => {
      // Create a client first
      const createRes = await request(app)
        .post('/api/clients')
        .set('Cookie', cookies)
        .send({ name: 'To Delete', email: 'delete@test.com' });
      const clientId = createRes.body.client.id;

      const res = await request(app)
        .delete(`/api/clients/${clientId}`)
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('Dashboard Routes (authenticated)', () => {
    let cookies: string[];

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      cookies = res.headers['set-cookie'] as unknown as string[];
    });

    it('should get dashboard data', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.metrics).toBeDefined();
      expect(res.body.recentInvoices).toBeDefined();
      expect(res.body.periodLabel).toBeDefined();
    });

    it('should get dashboard trend data', async () => {
      const res = await request(app)
        .get('/api/dashboard/trend')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.trend)).toBe(true);
      expect(res.body.trend).toHaveLength(12);
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown-route');
      expect(res.status).toBe(404);
    });
  });
});
