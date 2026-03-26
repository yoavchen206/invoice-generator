// ============================================================
// ENUMS
// ============================================================

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';

export type PeriodFilter =
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_12_months'
  | 'custom';


// ============================================================
// CORE DOMAIN TYPES
// ============================================================

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface Invoice {
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

export interface DashboardMetrics {
  totalEarned: number;
  outstanding: number;
  overdueCount: number;
  invoiceCount: number;
}

export interface TrendDataPoint {
  month: string;
  label: string;
  earned: number;
  invoiceCount: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
}

export interface UserPreferences {
  defaultPeriod: PeriodFilter;
  sidebarCollapsed: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


// ============================================================
// API REQUEST TYPES
// ============================================================

export interface CreateInvoiceRequest {
  clientId?: string;
  clientData?: Omit<Client, 'id'>;
  lineItems: Omit<LineItem, 'id' | 'total'>[];
  issueDate: string;
  dueDate?: string;
}

export interface CreateClientRequest {
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export type UpdateClientRequest = Partial<CreateClientRequest>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DashboardQueryParams {
  period?: PeriodFilter;
  clientId?: string;
}

export interface InvoiceListQueryParams {
  status?: InvoiceStatus | 'all';
  clientId?: string;
  period?: PeriodFilter;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface UpdatePreferencesRequest {
  defaultPeriod?: PeriodFilter;
  sidebarCollapsed?: boolean;
}


// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface LoginResponse {
  user: User;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  pagination: Pagination;
}

export interface InvoiceResponse {
  invoice: Invoice;
}

export interface ClientListResponse {
  clients: Client[];
  pagination: Pagination;
}

export interface ClientResponse {
  client: Client;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  recentInvoices: Invoice[];
  periodLabel: string;
  lastRefreshedAt: string;
}

export interface TrendResponse {
  trend: TrendDataPoint[];
}

export interface PreferencesResponse {
  preferences: UserPreferences;
}

export interface HealthResponse {
  status: 'ok';
  version: string;
  timestamp: string;
}
