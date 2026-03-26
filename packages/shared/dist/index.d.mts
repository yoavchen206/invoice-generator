import { z } from 'zod';

type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';
type PeriodFilter = 'this_month' | 'last_month' | 'last_3_months' | 'last_12_months' | 'custom';
interface LineItem {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
interface Client {
    id: string;
    name: string;
    businessName?: string;
    email: string;
    phone?: string;
    address?: string;
    taxId?: string;
}
interface Invoice {
    id: string;
    invoiceNumber: string;
    client: Client;
    lineItems: LineItem[];
    subtotal: number;
    taxAmount: number;
    taxRate: number;
    total: number;
    issueDate: string;
    dueDate?: string;
    status: InvoiceStatus;
    createdAt: string;
    updatedAt: string;
}
interface DashboardMetrics {
    totalEarned: number;
    outstanding: number;
    overdueCount: number;
    invoiceCount: number;
}
interface TrendDataPoint {
    month: string;
    label: string;
    earned: number;
    invoiceCount: number;
}
interface User {
    id: string;
    email: string;
    displayName: string | null;
}
interface UserPreferences {
    defaultPeriod: PeriodFilter;
    sidebarCollapsed: boolean;
}
interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
interface CreateInvoiceRequest {
    clientId?: string;
    clientData?: Omit<Client, 'id'>;
    lineItems: Omit<LineItem, 'id' | 'total'>[];
    issueDate: string;
    dueDate?: string;
}
interface CreateClientRequest {
    name: string;
    businessName?: string;
    email: string;
    phone?: string;
    address?: string;
    taxId?: string;
}
type UpdateClientRequest = Partial<CreateClientRequest>;
interface LoginRequest {
    email: string;
    password: string;
}
interface DashboardQueryParams {
    period?: PeriodFilter;
    clientId?: string;
}
interface InvoiceListQueryParams {
    status?: InvoiceStatus | 'all';
    clientId?: string;
    period?: PeriodFilter;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
interface UpdatePreferencesRequest {
    defaultPeriod?: PeriodFilter;
    sidebarCollapsed?: boolean;
}
interface ApiError {
    code: string;
    message: string;
    fields?: Record<string, string>;
}
interface ApiErrorResponse {
    error: ApiError;
}
interface LoginResponse {
    user: User;
}
interface InvoiceListResponse {
    invoices: Invoice[];
    pagination: Pagination;
}
interface InvoiceResponse {
    invoice: Invoice;
}
interface ClientListResponse {
    clients: Client[];
    pagination: Pagination;
}
interface ClientResponse {
    client: Client;
}
interface DashboardResponse {
    metrics: DashboardMetrics;
    recentInvoices: Invoice[];
    periodLabel: string;
    lastRefreshedAt: string;
}
interface TrendResponse {
    trend: TrendDataPoint[];
}
interface PreferencesResponse {
    preferences: UserPreferences;
}
interface HealthResponse {
    status: 'ok';
    version: string;
    timestamp: string;
}

declare const LineItemSchema: z.ZodObject<{
    description: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    description: string;
    quantity: number;
    unitPrice: number;
}, {
    description: string;
    quantity: number;
    unitPrice: number;
}>;
declare const CreateInvoiceSchema: z.ZodEffects<z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    clientData: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        businessName: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        taxId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        businessName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        taxId?: string | undefined;
    }, {
        name: string;
        email: string;
        businessName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        taxId?: string | undefined;
    }>>;
    lineItems: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unitPrice: number;
    }, {
        description: string;
        quantity: number;
        unitPrice: number;
    }>, "many">;
    issueDate: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    issueDate: string;
    clientId?: string | undefined;
    clientData?: {
        name: string;
        email: string;
        businessName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        taxId?: string | undefined;
    } | undefined;
    dueDate?: string | undefined;
}, {
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    issueDate: string;
    clientId?: string | undefined;
    clientData?: {
        name: string;
        email: string;
        businessName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        taxId?: string | undefined;
    } | undefined;
    dueDate?: string | undefined;
}>, {
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    issueDate: string;
    clientId?: string | undefined;
    clientData?: {
        name: string;
        email: string;
        businessName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        taxId?: string | undefined;
    } | undefined;
    dueDate?: string | undefined;
}, {
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    issueDate: string;
    clientId?: string | undefined;
    clientData?: {
        name: string;
        email: string;
        businessName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        taxId?: string | undefined;
    } | undefined;
    dueDate?: string | undefined;
}>;
declare const CreateClientSchema: z.ZodObject<{
    name: z.ZodString;
    businessName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    businessName?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
}, {
    name: string;
    email: string;
    businessName?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
}>;
declare const UpdateClientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    businessName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    taxId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    businessName?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
}, {
    name?: string | undefined;
    businessName?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
}>;
declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
declare const PeriodFilterSchema: z.ZodEnum<["this_month", "last_month", "last_3_months", "last_12_months", "custom"]>;
declare const UpdatePreferencesSchema: z.ZodObject<{
    defaultPeriod: z.ZodOptional<z.ZodEnum<["this_month", "last_month", "last_3_months", "last_12_months", "custom"]>>;
    sidebarCollapsed: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    defaultPeriod?: "this_month" | "last_month" | "last_3_months" | "last_12_months" | "custom" | undefined;
    sidebarCollapsed?: boolean | undefined;
}, {
    defaultPeriod?: "this_month" | "last_month" | "last_3_months" | "last_12_months" | "custom" | undefined;
    sidebarCollapsed?: boolean | undefined;
}>;
declare const InvoiceListQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["paid", "unpaid", "overdue", "all"]>>;
    clientId: z.ZodOptional<z.ZodString>;
    period: z.ZodOptional<z.ZodEnum<["this_month", "last_month", "last_3_months", "last_12_months", "custom"]>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "paid" | "unpaid" | "overdue" | "all" | undefined;
    clientId?: string | undefined;
    period?: "this_month" | "last_month" | "last_3_months" | "last_12_months" | "custom" | undefined;
    from?: string | undefined;
    to?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}, {
    status?: "paid" | "unpaid" | "overdue" | "all" | undefined;
    clientId?: string | undefined;
    period?: "this_month" | "last_month" | "last_3_months" | "last_12_months" | "custom" | undefined;
    from?: string | undefined;
    to?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
declare const DashboardQuerySchema: z.ZodObject<{
    period: z.ZodOptional<z.ZodEnum<["this_month", "last_month", "last_3_months", "last_12_months", "custom"]>>;
    clientId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    clientId?: string | undefined;
    period?: "this_month" | "last_month" | "last_3_months" | "last_12_months" | "custom" | undefined;
}, {
    clientId?: string | undefined;
    period?: "this_month" | "last_month" | "last_3_months" | "last_12_months" | "custom" | undefined;
}>;

export { type ApiError, type ApiErrorResponse, type Client, type ClientListResponse, type ClientResponse, type CreateClientRequest, CreateClientSchema, type CreateInvoiceRequest, CreateInvoiceSchema, type DashboardMetrics, type DashboardQueryParams, DashboardQuerySchema, type DashboardResponse, type HealthResponse, type Invoice, type InvoiceListQueryParams, InvoiceListQuerySchema, type InvoiceListResponse, type InvoiceResponse, type InvoiceStatus, type LineItem, LineItemSchema, type LoginRequest, type LoginResponse, LoginSchema, type Pagination, type PeriodFilter, PeriodFilterSchema, type PreferencesResponse, type TrendDataPoint, type TrendResponse, type UpdateClientRequest, UpdateClientSchema, type UpdatePreferencesRequest, UpdatePreferencesSchema, type User, type UserPreferences };
