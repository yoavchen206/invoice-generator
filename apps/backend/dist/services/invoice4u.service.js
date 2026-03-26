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
exports.Invoice4uService = void 0;
const invoice4uClient_1 = require("../lib/invoice4uClient");
// Mock data for development/testing when API is unavailable
const mockClients = [
    {
        id: 'client-1',
        name: 'Startup Studio Ltd.',
        businessName: 'Startup Studio Ltd.',
        email: 'contact@startupstudio.io',
        phone: '+972-50-000-0001',
        address: '12 Rothschild Blvd, Tel Aviv',
        taxId: '515000001',
    },
    {
        id: 'client-2',
        name: 'Amir Cohen',
        businessName: 'Cohen Dev',
        email: 'amir@cohendev.io',
        phone: '+972-50-000-0002',
        address: '5 HaHashmonaim St, Haifa',
        taxId: '515000002',
    },
    {
        id: 'client-3',
        name: 'Rivka Agency',
        businessName: 'Rivka Creative Agency',
        email: 'billing@rivka.co.il',
        phone: '+972-50-000-0003',
        address: '33 Ben Yehuda St, Jerusalem',
        taxId: '515000003',
    },
];
let mockInvoiceCounter = 1042;
const mockInvoices = [
    {
        id: 'inv-1',
        invoiceNumber: '1042',
        client: mockClients[0],
        lineItems: [
            { id: 'li-1', description: 'Brand Identity Design', quantity: 1, unitPrice: 3500, total: 3500 },
            { id: 'li-2', description: 'Logo Refinements', quantity: 2, unitPrice: 350, total: 700 },
        ],
        subtotal: 4200,
        taxAmount: 714,
        taxRate: 0.17,
        total: 4914,
        issueDate: '2026-03-15',
        dueDate: '2026-03-29',
        status: 'paid',
        createdAt: new Date('2026-03-15').toISOString(),
        updatedAt: new Date('2026-03-15').toISOString(),
    },
    {
        id: 'inv-2',
        invoiceNumber: '1041',
        client: mockClients[1],
        lineItems: [
            { id: 'li-3', description: 'Backend API Development', quantity: 40, unitPrice: 175, total: 7000 },
        ],
        subtotal: 7000,
        taxAmount: 1190,
        taxRate: 0.17,
        total: 8190,
        issueDate: '2026-03-10',
        dueDate: '2026-03-24',
        status: 'unpaid',
        createdAt: new Date('2026-03-10').toISOString(),
        updatedAt: new Date('2026-03-10').toISOString(),
    },
    {
        id: 'inv-3',
        invoiceNumber: '1040',
        client: mockClients[2],
        lineItems: [
            { id: 'li-4', description: 'Content Translation - Hebrew', quantity: 1, unitPrice: 1800, total: 1800 },
        ],
        subtotal: 1800,
        taxAmount: 306,
        taxRate: 0.17,
        total: 2106,
        issueDate: '2026-02-28',
        dueDate: '2026-03-14',
        status: 'overdue',
        createdAt: new Date('2026-02-28').toISOString(),
        updatedAt: new Date('2026-02-28').toISOString(),
    },
    {
        id: 'inv-4',
        invoiceNumber: '1039',
        client: mockClients[0],
        lineItems: [
            { id: 'li-5', description: 'Website Redesign - Phase 1', quantity: 1, unitPrice: 8000, total: 8000 },
        ],
        subtotal: 8000,
        taxAmount: 1360,
        taxRate: 0.17,
        total: 9360,
        issueDate: '2026-02-20',
        dueDate: '2026-03-06',
        status: 'paid',
        createdAt: new Date('2026-02-20').toISOString(),
        updatedAt: new Date('2026-02-20').toISOString(),
    },
    {
        id: 'inv-5',
        invoiceNumber: '1038',
        client: mockClients[1],
        lineItems: [
            { id: 'li-6', description: 'Frontend React Development', quantity: 30, unitPrice: 175, total: 5250 },
            { id: 'li-7', description: 'Code Review', quantity: 5, unitPrice: 200, total: 1000 },
        ],
        subtotal: 6250,
        taxAmount: 1062.50,
        taxRate: 0.17,
        total: 7312.50,
        issueDate: '2026-02-15',
        dueDate: '2026-03-01',
        status: 'paid',
        createdAt: new Date('2026-02-15').toISOString(),
        updatedAt: new Date('2026-02-15').toISOString(),
    },
];
class Invoice4uService {
    token;
    useMock;
    constructor(token) {
        this.token = token;
        // Use mock data if token is the dev token or API key is not configured
        this.useMock = token === 'mock-token' || token.startsWith('dev-') || process.env.NODE_ENV === 'test';
    }
    getAxiosClient() {
        return (0, invoice4uClient_1.createAuthenticatedClient)(this.token);
    }
    // ============================================================
    // INVOICES
    // ============================================================
    async getInvoices(params) {
        if (this.useMock) {
            let filtered = [...mockInvoices];
            if (params?.clientId) {
                filtered = filtered.filter(inv => inv.client.id === params.clientId);
            }
            if (params?.status && params.status !== 'all') {
                filtered = filtered.filter(inv => inv.status === params.status);
            }
            if (params?.from) {
                const fromDate = new Date(params.from);
                filtered = filtered.filter(inv => new Date(inv.issueDate) >= fromDate);
            }
            if (params?.to) {
                const toDate = new Date(params.to);
                filtered = filtered.filter(inv => new Date(inv.issueDate) <= toDate);
            }
            const total = filtered.length;
            const page = params?.page || 1;
            const limit = params?.limit || 25;
            const start = (page - 1) * limit;
            const invoices = filtered.slice(start, start + limit);
            return { invoices, total };
        }
        const client = this.getAxiosClient();
        const response = await client.get('/invoices', { params });
        return this.normalizeInvoiceListResponse(response.data);
    }
    async getInvoice(invoiceId) {
        if (this.useMock) {
            const invoice = mockInvoices.find(inv => inv.id === invoiceId);
            if (!invoice) {
                throw { status: 404, code: 'NOT_FOUND', message: 'Invoice not found.' };
            }
            return invoice;
        }
        const client = this.getAxiosClient();
        const response = await client.get(`/invoices/${invoiceId}`);
        return this.normalizeInvoice(response.data);
    }
    async createInvoice(payload) {
        if (this.useMock) {
            mockInvoiceCounter++;
            let client;
            if (payload.clientId) {
                const found = mockClients.find(c => c.id === payload.clientId);
                if (!found)
                    throw { status: 404, code: 'NOT_FOUND', message: 'Client not found.' };
                client = found;
            }
            else if (payload.clientData) {
                client = { id: `client-temp-${Date.now()}`, ...payload.clientData };
            }
            else {
                throw { status: 400, code: 'VALIDATION_ERROR', message: 'Client is required.' };
            }
            const TAX_RATE = 0.17;
            const lineItems = payload.lineItems.map((li, idx) => ({
                id: `li-new-${idx}`,
                description: li.description,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                total: li.quantity * li.unitPrice,
            }));
            const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0);
            const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
            const total = subtotal + taxAmount;
            const newInvoice = {
                id: `inv-new-${Date.now()}`,
                invoiceNumber: String(mockInvoiceCounter),
                client,
                lineItems,
                subtotal,
                taxAmount,
                taxRate: TAX_RATE,
                total,
                issueDate: payload.issueDate,
                dueDate: payload.dueDate,
                status: 'unpaid',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockInvoices.unshift(newInvoice);
            return newInvoice;
        }
        const client = this.getAxiosClient();
        const response = await client.post('/invoices', this.mapCreateInvoiceRequest(payload));
        return this.normalizeInvoice(response.data);
    }
    // ============================================================
    // CLIENTS
    // ============================================================
    async getClients(params) {
        if (this.useMock) {
            let filtered = [...mockClients];
            if (params?.search) {
                const search = params.search.toLowerCase();
                filtered = filtered.filter(c => c.name.toLowerCase().includes(search) ||
                    (c.businessName && c.businessName.toLowerCase().includes(search)));
            }
            const total = filtered.length;
            const page = params?.page || 1;
            const limit = params?.limit || 50;
            const start = (page - 1) * limit;
            const clients = filtered.slice(start, start + limit);
            return { clients, total };
        }
        const client = this.getAxiosClient();
        const response = await client.get('/clients', { params });
        return this.normalizeClientListResponse(response.data);
    }
    async getClient(clientId) {
        if (this.useMock) {
            const found = mockClients.find(c => c.id === clientId);
            if (!found)
                throw { status: 404, code: 'NOT_FOUND', message: 'Client not found.' };
            return found;
        }
        const client = this.getAxiosClient();
        const response = await client.get(`/clients/${clientId}`);
        return this.normalizeClient(response.data);
    }
    async createClient(payload) {
        if (this.useMock) {
            const newClient = {
                id: `client-${Date.now()}`,
                ...payload,
            };
            mockClients.push(newClient);
            return newClient;
        }
        const client = this.getAxiosClient();
        const response = await client.post('/clients', payload);
        return this.normalizeClient(response.data);
    }
    async updateClient(clientId, payload) {
        if (this.useMock) {
            const idx = mockClients.findIndex(c => c.id === clientId);
            if (idx === -1)
                throw { status: 404, code: 'NOT_FOUND', message: 'Client not found.' };
            mockClients[idx] = { ...mockClients[idx], ...payload };
            return mockClients[idx];
        }
        const client = this.getAxiosClient();
        const response = await client.put(`/clients/${clientId}`, payload);
        return this.normalizeClient(response.data);
    }
    async deleteClient(clientId) {
        if (this.useMock) {
            const idx = mockClients.findIndex(c => c.id === clientId);
            if (idx === -1)
                throw { status: 404, code: 'NOT_FOUND', message: 'Client not found.' };
            mockClients.splice(idx, 1);
            return;
        }
        const client = this.getAxiosClient();
        await client.delete(`/clients/${clientId}`);
    }
    // ============================================================
    // AUTH
    // ============================================================
    static async login(email, password) {
        // In dev mode, accept any credentials
        if (process.env.NODE_ENV !== 'production') {
            if (email && password) {
                return { token: 'mock-token', userId: 'user-1' };
            }
        }
        const { invoice4uClient } = await Promise.resolve().then(() => __importStar(require('../lib/invoice4uClient')));
        const response = await invoice4uClient.post('/auth/login', { email, password });
        return {
            token: response.data.token || response.data.access_token,
            userId: response.data.userId || response.data.user_id,
        };
    }
    // ============================================================
    // NORMALIZATION HELPERS
    // ============================================================
    normalizeInvoice(data) {
        // Map invoice4u API fields to our Invoice type
        // This will need to be adjusted based on actual API response shape
        return {
            id: String(data.id || data.Id || ''),
            invoiceNumber: String(data.invoiceNumber || data.InvoiceNumber || data.number || ''),
            client: this.normalizeClient((data.client || data.Client || {})),
            lineItems: (data.lineItems || data.LineItems || data.items || []).map(li => this.normalizeLineItem(li)),
            subtotal: Number(data.subtotal || data.Subtotal || 0),
            taxAmount: Number(data.taxAmount || data.TaxAmount || data.tax || 0),
            taxRate: Number(data.taxRate || data.TaxRate || 0.17),
            total: Number(data.total || data.Total || 0),
            issueDate: String(data.issueDate || data.IssueDate || data.date || ''),
            dueDate: data.dueDate || data.DueDate ? String(data.dueDate || data.DueDate) : undefined,
            status: this.normalizeStatus(String(data.status || data.Status || 'unpaid')),
            createdAt: String(data.createdAt || data.CreatedAt || new Date().toISOString()),
            updatedAt: String(data.updatedAt || data.UpdatedAt || new Date().toISOString()),
        };
    }
    normalizeLineItem(data) {
        return {
            id: String(data.id || data.Id || ''),
            description: String(data.description || data.Description || ''),
            quantity: Number(data.quantity || data.Quantity || 0),
            unitPrice: Number(data.unitPrice || data.UnitPrice || data.price || 0),
            total: Number(data.total || data.Total || data.rowTotal || 0),
        };
    }
    normalizeClient(data) {
        return {
            id: String(data.id || data.Id || ''),
            name: String(data.name || data.Name || ''),
            businessName: data.businessName || data.BusinessName ? String(data.businessName || data.BusinessName) : undefined,
            email: String(data.email || data.Email || ''),
            phone: data.phone || data.Phone ? String(data.phone || data.Phone) : undefined,
            address: data.address || data.Address ? String(data.address || data.Address) : undefined,
            taxId: data.taxId || data.TaxId ? String(data.taxId || data.TaxId) : undefined,
        };
    }
    normalizeStatus(status) {
        const lower = status.toLowerCase();
        if (lower === 'paid' || lower === '1')
            return 'paid';
        if (lower === 'overdue')
            return 'overdue';
        return 'unpaid';
    }
    normalizeInvoiceListResponse(data) {
        const invoices = (data.invoices || data.Invoices || data.data || []).map(inv => this.normalizeInvoice(inv));
        return {
            invoices,
            total: Number(data.total || data.Total || data.count || invoices.length),
        };
    }
    normalizeClientListResponse(data) {
        const clients = (data.clients || data.Clients || data.data || []).map(c => this.normalizeClient(c));
        return {
            clients,
            total: Number(data.total || data.Total || data.count || clients.length),
        };
    }
    mapCreateInvoiceRequest(payload) {
        // Map our request format to invoice4u's expected format
        return {
            clientId: payload.clientId,
            clientData: payload.clientData,
            lineItems: payload.lineItems.map(li => ({
                description: li.description,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
            })),
            issueDate: payload.issueDate,
            dueDate: payload.dueDate,
        };
    }
}
exports.Invoice4uService = Invoice4uService;
//# sourceMappingURL=invoice4u.service.js.map