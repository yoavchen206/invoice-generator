# OFFICE Builder Agent — Full Application Build

You are building the entire application. Implement ALL modules: database, backend, and frontend.

## Architecture Design
# Yoavchu's Invoices — Architecture Design

**Version:** 1.0 | **Status:** Final | **Date:** 2025-06-30
**Author:** OFFICE Architect Agent
**Based on:** Project Brief · Market Research · Product Strategy · PRD · Design Spec (all v1.0)

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [API Structure](#4-api-structure)
5. [Work Breakdown](#5-work-breakdown)
6. [Shared Type Definitions](#6-shared-type-definitions)
7. [E2B Template Recommendation](#7-e2b-template-recommendation)

---

## 1. Technology Stack

### 1.1 Frontend

| Concern | Choice | Version | Rationale |
|---|---|---|---|
| **Framework** | React | 18.3.x | Mature, massive ecosystem, concurrent features (Suspense, transitions) align with the loading-state requirements in the design spec. React 19 is still RC; 18 is production-safe. |
| **Build Tool** | Vite | 5.x | Fastest dev-server HMR for a SPA, native ESM, excellent TypeScript support. No SSR needed — this is a pure authenticated SPA. |
| **Language** | TypeScript | 5.4.x | End-to-end type safety across frontend + BFF; shared types eliminate contract drift. |
| **Routing** | React Router | 6.x (Data Router) | Declarative nested routing, `loader`/`action` pattern, preserve scroll/filter state via router location state. |
| **UI Component Library** | shadcn/ui (Radix UI primitives) | latest | Headless, accessible Radix primitives with copy-owned components — fully customizable to the dark design system without fighting a pre-styled library. Ships zero runtime overhead for unused components. |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first, pairs perfectly with shadcn/ui, supports CSS variables for the design-token color system, purges unused styles in production. |
| **Global State** | Zustand | 4.x | Minimal boilerplate, no context provider wrapping, perfect for auth session + UI state (active filters, sidebar collapsed). |
| **Server State / Data Fetching** | TanStack Query (React Query) | 5.x | Automatic caching, background refetch, loading/error states, stale-while-revalidate — covers all dashboard and invoice list requirements. |
| **Form Management** | React Hook Form | 7.x | Performant (uncontrolled inputs), integrates with Zod for schema validation, aligns with the real-time total calculation requirement (watch API). |
| **Validation** | Zod | 3.x | Schema-first validation shared with the BFF layer; single source of truth for field rules. |
| **Charts** | Recharts | 2.x | React-native (no D3 peer), responsive container, good dark-theme customization, well-maintained. Used for Phase 2 revenue trend chart. |
| **Animations** | Framer Motion | 11.x | Declarative `AnimatePresence` + `motion` components for page transitions, modal slide-up, success screen animation (Phase 3). `useReducedMotion()` hook built-in for accessibility. |
| **Date Utilities** | date-fns | 3.x | Tree-shakeable, immutable, covers all period-filter date math without pulling in moment.js weight. |
| **Icons** | Lucide React | 0.x (latest) | Clean icon set, tree-shakeable, consistent stroke style matching the design system. |
| **Number Formatting** | Native `Intl.NumberFormat` | — | No dependency; formats ILS currency (₪) natively. Wrapped in a `formatCurrency` util. |

### 1.2 Backend — BFF (Backend for Frontend)

| Concern | Choice | Version | Rationale |
|---|---|---|---|
| **Runtime** | Node.js | 20 LTS | LTS stability, native `fetch`, crypto built-ins. |
| **Framework** | Express | 4.x | Minimal, well-understood, sufficient for a thin proxy layer. No need for Fastify or Hono complexity at this scale. |
| **Language** | TypeScript | 5.4.x | Shared types with the frontend via a `/shared` package. |
| **HTTP Client** | Axios | 1.x | Used inside the BFF to call invoice4u API; interceptors for auth token injection, error normalization. |
| **Session / Auth** | express-session + connect-redis (optional for scale) | 1.x / 0.x | Server-side session stores the invoice4u API token — never exposed to the browser. Cookie-based (`httpOnly`, `secure`, `sameSite: strict`). |
| **Validation Middleware** | zod + custom middleware | — | Request bodies validated with the same Zod schemas shared from `/shared` package. |
| **Env Config** | dotenv + envalid | — | Typed environment variable validation at startup; fails fast on misconfiguration. |
| **CORS** | cors (npm) | 2.x | Restricts BFF to requests from the frontend origin only. |
| **Rate Limiting** | express-rate-limit | 7.x | Protects BFF endpoints from abuse; especially important for the auth endpoint. |
| **Logging** | pino | 8.x | Structured JSON logging; low overhead, Vercel/cloud compatible. |

### 1.3 Database

| Concern | Choice | Rationale |
|---|---|---|
| **Database** | PostgreSQL 16 | Robust relational DB for storing locally-cached client records and app-specific data (user preferences, session metadata). invoice4u is the source of truth for invoices; Postgres stores only what the app owns. |
| **ORM** | Drizzle ORM | Type-safe, SQL-first, lightweight, excellent TypeScript inference, Zod integration via `drizzle-zod`. Avoids the magic of Prisma while maintaining full type safety. |
| **Hosting** | Neon (serverless Postgres) | Serverless branching, free tier, instant provisioning, Vercel integration via connection pooling. |
| **Migrations** | Drizzle Kit | `drizzle-kit generate` + `drizzle-kit migrate` — version-controlled SQL migrations in `/drizzle` directory. |

### 1.4 Authentication

The app authenticates the **user's invoice4u credentials** and creates a server-side session. There is no separate identity provider.

| Concern | Choice | Rationale |
|---|---|---|
| **Session storage** | Server-side HTTP-only cookie | The invoice4u API token is never sent to the browser. The BFF holds it in session. This directly satisfies NFR-SEC-02. |
| **Session store** | In-memory (dev) / Neon Postgres table (prod) | `connect-pg-simple` stores sessions in a `sessions` table in Postgres. Survives BFF restarts. |
| **Token lifecycle** | Express-session with rolling expiry (7 days) | Matches typical freelancer "set and forget" usage pattern. Token refreshed on activity. |

### 1.5 File / Blob Storage

No file storage is required in Phase 1–2. Invoice PDFs are generated and served by the invoice4u API directly. If Phase 3 introduces custom PDF branding, Vercel Blob or Cloudflare R2 would be added. **Not provisioned at launch.**

### 1.6 Background Job Processing

No background jobs are required at launch. All data operations are request-driven. If future phases add scheduled reminders or overdue invoice notifications, BullMQ + Redis (Upstash) would be added. **Not provisioned at launch.**

### 1.7 Hosting / Deployment

| Concern | Choice | Rationale |
|---|---|---|
| **Frontend** | Vercel (static SPA) | Zero-config Vite deploys, global CDN, preview deployments per PR, free tier sufficient for launch. |
| **BFF (Express)** | Vercel Serverless Functions (or Railway.app) | Vercel can serve Express via a single serverless function adapter (`@vercel/node`). If session complexity grows, Railway provides a persistent Node server with simpler session management. Recommend Railway for production if rolling sessions are used. |
| **Database** | Neon (serverless Postgres) | Neon's Vercel integration provides automatic DATABASE_URL injection. |
| **Domain / TLS** | Vercel managed | Automatic HTTPS for custom domain. |
| **Environment Variables** | Vercel Environment Variables UI | Separate values for development, preview, and production. |

### 1.8 Key Third-Party Integrations

| Integration | SDK / Method | Purpose |
|---|---|---|
| **invoice4u API** | REST via Axios (BFF only) | Source of truth for all invoice and client CRUD operations. All calls proxied through BFF to protect API credentials. |
| **Neon Postgres** | `@neondatabase/serverless` + Drizzle | App-owned data: users, sessions, locally cached client preferences. |
| **Vercel Analytics** | `@vercel/analytics` | Lightweight page view and Web Vitals tracking. No PII. |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                                  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              REACT SPA  (Vite build, served from Vercel CDN)    │   │
│  │                                                                   │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │  Router  │  │ Zustand Store│  │  TanStack Query Cache    │  │   │
│  │  │(RR v6)   │  │ (auth+UI)    │  │  (invoices, clients,     │  │   │
│  │  └──────────┘  └──────────────┘  │   dashboard metrics)     │  │   │
│  │                                   └──────────────────────────┘  │   │
│  │  Pages: Login | Dashboard | Invoices | Invoice Detail |          │   │
│  │          Invoice Create | Clients | Client Form | Success        │   │
│  └────────────────────────────┬────────────────────────────────────┘   │
│                                │  HTTPS  (fetch / Axios)                │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │   BFF — Express on Node   │
                    │   (Railway / Vercel Fn)   │
                    │                           │
                    │  ┌─────────────────────┐  │
                    │  │  Auth Middleware     │  │
                    │  │  (session cookie)   │  │
                    │  └──────────┬──────────┘  │
                    │             │              │
                    │  ┌──────────▼──────────┐  │
                    │  │  Route Handlers     │  │
                    │  │  /api/auth          │  │
                    │  │  /api/invoices      │  │
                    │  │  /api/clients       │  │
                    │  │  /api/dashboard     │  │
                    │  └──────────┬──────────┘  │
                    │             │              │
                    │  ┌──────────▼──────────┐  │
                    │  │  invoice4u Service  │  │
                    │  │  (Axios adapter)    │  │
                    │  └──────────┬──────────┘  │
                    └────────────┼──────────────┘
                                 │
              ┌──────────────────┼───────────────────┐
              │                  │                    │
   ┌──────────▼──────┐  ┌───────▼────────┐  ┌───────▼──────────┐
   │  invoice4u API  │  │  Neon Postgres  │  │  Session Store   │
   │  (external,     │  │  (app-owned     │  │  (connect-pg-    │
   │   HTTPS)        │  │   data)         │  │   simple)        │
   └─────────────────┘  └────────────────┘  └──────────────────┘
```

### 2.2 Component Responsibilities & Boundaries

#### React SPA (Frontend)
- **Renders all UI** — pages, forms, charts, modals, navigation.
- **Owns client-side routing** via React Router v6 with nested route layouts.
- **Owns UI state** via Zustand: authentication status, active filter selections, sidebar collapse state, unsaved invoice form data (persisted in store to survive navigation).
- **Owns server-state cache** via TanStack Query: invoice list, dashboard metrics, client list. Query keys encode filter parameters so each unique filter combination has its own cache entry.
- **Never calls invoice4u API directly** — all external data flows through the BFF.
- **Performs all real-time calculations locally** — invoice line item totals, dashboard metric aggregation from cached data, period filtering math.

#### BFF — Backend for Frontend (Express)
- **Single API surface** for the SPA — the browser only knows about `/api/*` routes on the same domain (or CORS-trusted origin).
- **Owns the invoice4u API token** — stores it in the server-side session. The browser cookie contains only a session ID.
- **Proxies and transforms** invoice4u API responses into the app's own response shapes, normalizing field names and error formats.
- **Owns rate limiting and auth guards** — every `/api/*` route except `/api/auth/login` requires a valid session.
- **Owns app-specific DB writes** — user preferences, locally cached client metadata for search/filter UX speed.
- **Aggregates dashboard data** — fetches invoice list from invoice4u, computes metrics (totals, outstanding, overdue) server-side to reduce client-side data transfer and computation for large invoice sets.

#### Neon Postgres (Database)
- **Stores app-owned data only**: user accounts (mapping local user ID → invoice4u credentials reference), saved UI preferences (theme, last-used period filter), and session records.
- **Does NOT store invoices or client financial data** — these remain exclusively in invoice4u. This is a deliberate architectural decision satisfying NFR-SEC-03 and the product's "pure front-end" positioning.
- **Stores a lightweight client cache** (name, email, invoice4u client ID) to power fast autocomplete without an API round-trip on every keystroke. Cache is invalidated on any client write operation.

#### invoice4u API (External)
- **Source of truth** for all invoices and client records.
- Called exclusively by the BFF service layer (`src/services/invoice4u.service.ts`).
- All calls include the `Authorization` header populated from the session-stored token.

### 2.3 Data Flow — Key Scenarios

#### Invoice List Load
```
SPA (TanStack Query)
  → GET /api/invoices?status=unpaid&clientId=42&period=last_3_months
    → BFF auth middleware validates session cookie
    → BFF handler calls invoice4uService.getInvoices({ filters })
      → Axios GET https://api.invoice4u.co.il/invoices?...
        ← invoice4u returns raw invoice array
      ← BFF normalizes shape, applies any local enrichment
    ← BFF returns { invoices: Invoice[], total: number, page: number }
  ← TanStack Query caches result under key ['invoices', filters]
← SPA renders list from cache; stale-while-revalidate refetches in background
```

#### Invoice Creation
```
SPA (React Hook Form submit)
  → POST /api/invoices  { clientId, lineItems, issueDate }
    → BFF validates request body with Zod schema
    → BFF calls invoice4uService.createInvoice(payload)
      → Axios POST https://api.invoice4u.co.il/invoices  { ...mapped payload }
        ← invoice4u returns created invoice { id, invoiceNumber, ... }
    → BFF invalidates any cached invoice list (via response header hint or client re-fetch)
    ← BFF returns { invoice: Invoice }
  ← SPA receives success response
  ← TanStack Query invalidates ['invoices'] cache (queryClient.invalidateQueries)
← SPA navigates to /invoices/success with invoice data in router state
```

#### Dashboard Metrics Load
```
SPA (TanStack Query on Dashboard mount)
  → GET /api/dashboard?period=this_month&clientId=all
    → BFF auth middleware
    → BFF calls invoice4uService.getInvoices({ all: true }) [full list]
    → BFF aggregates server-side:
        totalEarned   = sum(paid invoices in period)
        outstanding   = sum(unpaid invoices in period)
        overdueCount  = count(unpaid AND dueDate < today)
        recentInvoices = last 10 sorted by date
    ← BFF returns { metrics: DashboardMetrics, recentInvoices: Invoice[] }
  ← TanStack Query caches under ['dashboard', period, clientId]
← SPA renders metric cards and recent list from cache
```

### 2.4 Authentication & Authorization Flow

```
1. User visits app → SPA checks Zustand auth state
   a. Not authenticated → navigate to /login

2. User submits login form (email + password)
   → POST /api/auth/login  { email, password }
   → BFF sends credentials to invoice4u auth endpoint
   ← invoice4u returns API token (e.g., Bearer token)
   → BFF stores token in req.session.invoice4uToken
   → BFF stores user identity in req.session.user { email, name }
   ← BFF responds 200 { user: { email, name } }  (NO token in body)
   → express-session sets httpOnly + secure cookie on response
   ← SPA stores { user } in Zustand, navigates to /dashboard

3. Every subsequent API call
   → Browser sends session cookie automatically (same-origin or CORS with credentials)
   → BFF session middleware hydrates req.session
   → Auth guard middleware checks req.session.invoice4uToken
     — Missing/expired → 401 response → SPA clears Zustand auth → redirect /login
     — Valid → handler proceeds, attaches token to outbound invoice4u request

4. Logout
   → POST /api/auth/logout
   → BFF calls req.session.destroy()
   → BFF clears cookie (Set-Cookie: maxAge=0)
   ← 200 OK
   → SPA clears Zustand store, navigates to /login
   → Browser back button after logout: SPA detects no auth state → redirects /login
```

### 2.5 Real-Time / Async Patterns

| Pattern | Where Used | Implementation |
|---|---|---|
| **Optimistic UI** | Client save/delete | Zustand local state updated immediately; TanStack Query mutation reverts on error |
| **Stale-while-revalidate** | Invoice list, dashboard | TanStack Query default: show cached data immediately, refetch in background on window focus |
| **Real-time total calculation** | Invoice creation form | `useWatch` from React Hook Form triggers a `useMemo` that recalculates subtotal/tax/total on every line item change — pure client-side, <100ms per NFR-PERF-04 |
| **Pull-to-refresh** | Mobile invoice list | `useInfiniteQuery` with manual refetch bound to `onTouchMove` threshold |
| **Tab focus refetch** | All data queries | `refetchOnWindowFocus: true` (TanStack Query default) |
| **Session expiry detection** | All API calls | Axios response interceptor in BFF client checks 401 from invoice4u; BFF returns 401 to SPA; SPA global error handler triggers logout flow |

---

## 3. Database Schema

### 3.1 Design Principles

The Postgres database stores **only app-owned data**. Invoice4u is the canonical store for invoices and client financial records. The database's role is:
1. Session persistence (survive BFF restarts)
2. User account mapping (local user ID ↔ invoice4u identity)
3. Client autocomplete cache (fast search without API round-trips)
4. User preferences (period filter defaults, sidebar state)

### 3.2 Complete SQL Schema

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()


-- ============================================================
-- TABLE: users
-- Maps a local app user to their invoice4u identity.
-- One row per registered user of this app.
-- ============================================================
CREATE TABLE users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT        NOT NULL UNIQUE,
  display_name      TEXT,
  -- The invoice4u API token is NOT stored here.
  -- It lives only in the session table for the duration of a session.
  -- We store the invoice4u user_id (from their API) for reference.
  invoice4u_user_id TEXT        UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);


-- ============================================================
-- TABLE: sessions
-- express-session store via connect-pg-simple.
-- Managed automatically by the session library.
-- ============================================================
CREATE TABLE sessions (
  sid     TEXT        NOT NULL PRIMARY KEY,
  sess    JSONB       NOT NULL,
  expire  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_expire ON sessions (expire);


-- ============================================================
-- TABLE: client_cache
-- A local cache of invoice4u client records for each user.
-- Populated/updated on every client list fetch from invoice4u.
-- Used to power fast autocomplete in the invoice creation form.
-- Does NOT store financial data — only identity/contact info.
-- ============================================================
CREATE TABLE client_cache (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice4u_client_id TEXT        NOT NULL,  -- invoice4u's own client identifier
  name                TEXT        NOT NULL,
  business_name       TEXT,
  email               TEXT,
  phone               TEXT,
  address             TEXT,
  tax_id              TEXT,
  cached_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, invoice4u_client_id)
);

CREATE INDEX idx_client_cache_user_id ON client_cache (user_id);
CREATE INDEX idx_client_cache_name    ON client_cache (user_id, name);  -- for autocomplete ORDER BY name
-- GIN index for full-text search on name + business_name
CREATE INDEX idx_client_cache_search  ON client_cache
  USING gin(to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(business_name, '')));


-- ============================================================
-- TABLE: user_preferences
-- Stores lightweight UI state persisted server-side.
-- One row per user (upserted).
-- ============================================================
CREATE TABLE user_preferences (
  user_id              UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_period       TEXT        NOT NULL DEFAULT 'this_month',
  -- Valid values: 'this_month' | 'last_month' | 'last_3_months' | 'last_12_months'
  sidebar_collapsed    BOOLEAN     NOT NULL DEFAULT FALSE,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- FUNCTION + TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.3 Index Strategy

| Index | Table | Column(s) | Type | Reason |
|---|---|---|---|---|
| `idx_users_email` | `users` | `email` | B-tree | Login lookup — called on every session creation |
| `idx_sessions_expire` | `sessions` | `expire` | B-tree | connect-pg-simple purges expired sessions via this index |
| `idx_client_cache_user_id` | `client_cache` | `user_id` | B-tree | All client queries are scoped to a user; this is the primary filter |
| `idx_client_cache_name` | `client_cache` | `(user_id, name)` | B-tree | Autocomplete `ORDER BY name` within a user scope |
| `idx_client_cache_search` | `client_cache` | `tsvector(name, business_name)` | GIN | Full-text search for client autocomplete (`websearch_to_tsquery`) |

### 3.4 Relationship Diagram

```
users (1) ─────────────────── (1) user_preferences
  │
  │ (1)
  │
  └── (many) client_cache
        [invoice4u_client_id links to invoice4u's system]

sessions [standalone — managed by connect-pg-simple]
```

**Key relationship notes:**
- `users` → `client_cache`: One user has many cached clients. `ON DELETE CASCADE` ensures client cache is cleaned up when a user account is removed.
- `users` → `user_preferences`: One-to-one, implemented as a separate table (not columns on `users`) to keep the users table clean and allow the preferences row to be lazily created on first preference save.
- `sessions` has no FK to `users` — session data (including `user_id`) is stored in the `sess` JSONB column. This is the connect-pg-simple convention.
- There are **no invoice tables**. Invoices live exclusively in invoice4u.

### 3.5 Migration Strategy

All migrations are managed by **Drizzle Kit** and stored as versioned SQL files in `/drizzle/migrations/`.

```
drizzle/
  migrations/
    0001_create_users.sql
    0002_create_sessions.sql
    0003_create_client_cache.sql
    0004_create_user_preferences.sql
    0005_add_client_cache_search_index.sql
  schema.ts          ← Drizzle schema definitions (TypeScript)
```

**Migration workflow:**
1. Developer modifies `drizzle/schema.ts`
2. `drizzle-kit generate` produces a new numbered SQL migration file
3. Migration committed to git alongside code changes
4. `drizzle-kit migrate` runs automatically in CI/CD on deployment to Neon
5. Neon branching used for staging: each PR gets its own DB branch to test migrations in isolation before merging

**Rollback strategy:** Each migration file is manually reviewed to be reversible where possible. For destructive changes (DROP TABLE, DROP COLUMN), a separate down-migration file is authored alongside the up-migration.

---

## 4. API Structure

### 4.1 Overview

The BFF exposes a REST API under the `/api` prefix. All endpoints return `application/json`. Authentication is via session cookie — the browser sends it automatically. There are no API keys or tokens in request headers from the SPA.

**Base URL (production):** `https://app.yoavchu-invoices.com/api`
**Base URL (development):** `http://localhost:3001/api`

### 4.2 Authentication Headers & Middleware

```
All protected endpoints require:
  Cookie: connect.sid=<session_id>   (set automatically by browser)

The BFF auth middleware:
  1. Reads req.session.invoice4uToken
  2. If missing or session expired → responds 401 { error: 'UNAUTHORIZED' }
  3. If valid → attaches token to invoice4u outbound requests and calls next()

Public endpoints (no session required):
  POST /api/auth/login
  GET  /api/health
```

### 4.3 Error Response Format

All errors use a consistent envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description of what went wrong.",
    "fields": {
      "email": "Please enter a valid email address.",
      "lineItems[0].unitPrice": "Unit price must be greater than 0."
    }
  }
}
```

**Standard error codes:**

| HTTP Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body failed Zod schema validation |
| 401 | `UNAUTHORIZED` | No session / expired session |
| 403 | `FORBIDDEN` | Session valid but resource belongs to another user |
| 404 | `NOT_FOUND` | Resource does not exist in invoice4u |
| 409 | `CONFLICT` | Duplicate resource (e.g., client already exists) |
| 422 | `INVOICE4U_ERROR` | invoice4u API returned a business-logic error (forwarded with details) |
| 429 | `RATE_LIMITED` | Too many requests from this client |
| 500 | `INTERNAL_ERROR` | Unexpected server error (details logged, not returned) |
| 503 | `UPSTREAM_UNAVAILABLE` | invoice4u API unreachable or 5xx |

### 4.4 Rate Limiting Strategy

| Route Group | Limit | Window | Rationale |
|---|---|---|---|
| `POST /api/auth/login` | 10 requests | 15 minutes per IP | Brute-force protection on credentials |
| `POST /api/invoices` | 30 requests | 1 minute per session | Prevents accidental invoice duplication spam |
| All other `/api/*` | 200 requests | 1 minute per session | General abuse protection |

Rate limit responses use HTTP 429 with `Retry-After` header.

### 4.5 REST Endpoints

#### Auth

**POST /api/auth/login**
```
Request:
  { "email": "string", "password": "string" }

Response 200:
  { "user": { "id": "uuid", "email": "string", "displayName": "string | null" } }

Response 401:
  { "error": { "code": "UNAUTHORIZED", "message": "Incorrect email or password." } }
```

**POST /api/auth/logout**
```
Request: (empty body, session cookie required)

Response 200:
  { "ok": true }
```

**GET /api/auth/me**
```
Response 200:
  { "user": { "id": "uuid", "email": "string", "displayName": "string | null" } }

Response 401:
  { "error": { "code": "UNAUTHORIZED", "message": "Not authenticated." } }
```

---

#### Invoices

**GET /api/invoices**
```
Query params:
  status?:   "paid" | "unpaid" | "overdue" | "all"   (default: "all")
  clientId?: string                                    (invoice4u client ID)
  period?:   "this_month" | "last_month" | "last_3_months" | "last_12_months" | "custom"
  from?:     ISO date string  (required if period=custom)
  to?:       ISO date string  (required if period=custom)
  page?:     number           (default: 1)
  limit?:    number           (default: 25, max: 100)

Response 200:
  {
    "invoices": Invoice[],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
```

**GET /api/invoices/:invoiceId**
```
Response 200:
  { "invoice": Invoice }

Response 404:
  { "error": { "code": "NOT_FOUND", "message": "Invoice not found." } }
```

**POST /api/invoices**
```
Request:
  {
    "clientId": "string",          // invoice4u client ID (saved client)
    "clientData"?: {               // alternative: inline client (not saved)
      "name": "string",
      "businessName"?: "string",
      "email": "string",
      "phone"?: "string",
      "address"?: "string",
      "taxId"?: "string"
    },
    "lineItems": [
      {
        "description": "string",
        "quantity": number,
        "unitPrice": number
      }
    ],
    "issueDate": "ISO date string",
    "dueDate"?: "ISO date string"
  }

  Constraint: exactly one of clientId or clientData must be provided.

Response 201:
  { "invoice": Invoice }

Response 400:
  { "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { ... } } }

Response 422:
  { "error": { "code": "INVOICE4U_ERROR", "message": "invoice4u rejected the invoice: ..." } }
```

---

#### Clients

**GET /api/clients**
```
Query params:
  search?: string   (full-text search against name / business_name)
  page?:   number   (default: 1)
  limit?:  number   (default: 50, max: 200)

Response 200:
  {
    "clients": Client[],
    "pagination": { "total": number, "page": number, "limit": number, "totalPages": number }
  }
```

**GET /api/clients/:clientId**
```
Response 200:
  { "client": Client }
```

**POST /api/clients**
```
Request:
  {
    "name": "string",           // required
    "businessName"?: "string",
    "email": "string",          // required
    "phone"?: "string",
    "address"?: "string",
    "taxId"?: "string"
  }

Response 201:
  { "client": Client }
```

**PUT /api/clients/:clientId**
```
Request: (same shape as POST, all fields optional for partial update)

Response 200:
  { "client": Client }
```

**DELETE /api/clients/:clientId**
```
Response 200:
  { "ok": true }

Response 404:
  { "error": { "code": "NOT_FOUND", "message": "Client not found." } }
```

---

#### Dashboard

**GET /api/dashboard**
```
Query params:
  period?:   "this_month" | "last_month" | "last_3_months" | "last_12_months"  (default: "this_month")
  clientId?: string   (filter all metrics to one client)

Response 200:
  {
    "metrics": {
      "totalEarned":      number,   // sum of paid invoice amounts in period
      "outstanding":      number,   // sum of unpaid invoice amounts in period
      "overdueCount":     number,   // count of unpaid invoices past due date
      "invoiceCount":     number    // total invoices in period
    },
    "recentInvoices": Invoice[],    // last 10, sorted by issueDate desc
    "periodLabel": string,          // e.g. "June 2025" or "Last 3 Months"
    "lastRefreshedAt": "ISO datetime string"
  }
```

**GET /api/dashboard/trend**
```
Phase 2 endpoint.
Returns monthly revenue totals for the trailing 12 months.

Query params:
  clientId?: string

Response 200:
  {
    "trend": [
      { "month": "2024-07", "label": "Jul 2024", "earned": number, "invoiceCount": number },
      ...  // 12 entries
    ]
  }
```

---

#### User Preferences

**GET /api/preferences**
```
Response 200:
  {
    "preferences": {
      "defaultPeriod": "this_month" | "last_month" | "last_3_months" | "last_12_months",
      "sidebarCollapsed": boolean
    }
  }
```

**PATCH /api/preferences**
```
Request: (partial update — any subset of preference fields)
  {
    "defaultPeriod"?:    "this_month" | "last_month" | "last_3_months" | "last_12_months",
    "sidebarCollapsed"?: boolean
  }

Response 200:
  { "preferences": { ... } }
```

---

#### Health

**GET /api/health**
```
Response 200:
  {
    "status": "ok",
    "version": "1.0.0",
    "timestamp": "ISO datetime string"
  }
```

---

## 5. Work Breakdown

### 5.1 Module Map

```
yoavchu-invoices/
├── packages/
│   └── shared/                  # Shared TypeScript types & Zod schemas
│       ├── src/
│       │   ├── types.ts
│       │   ├── schemas.ts
│       │   └── index.ts
│       └── package.json
│
├── apps/
│   ├── frontend/                # React SPA
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── router.tsx
│   │   │   ├── store/           # Zustand stores
│   │   │   │   ├── auth.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   ├── api/             # TanStack Query hooks + API client
│   │   │   │   ├── client.ts    # Axios instance (BFF base URL)
│   │   │   │   ├── invoices.ts
│   │   │   │   ├── clients.ts
│   │   │   │   └── dashboard.ts
│   │   │   ├── pages/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── InvoiceList.tsx
│   │   │   │   ├── InvoiceDetail.tsx
│   │   │   │   ├── InvoiceCreate.tsx
│   │   │   │   ├── InvoiceSuccess.tsx
│   │   │   │   ├── ClientList.tsx
│   │   │   │   └── ClientForm.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/          # shadcn/ui components (Button, Input, etc.)
│   │   │   │   ├── layout/      # AppShell, BottomNav, Sidebar
│   │   │   │   ├── invoice/     # InvoiceCard, LineItemRow, TotalsPanel
│   │   │   │   ├── client/      # ClientCard, ClientSelector
│   │   │   │   ├── dashboard/   # MetricCard, RevenueChart, RecentInvoices
│   │   │   │   └── shared/      # StatusBadge, Skeleton, EmptyState, FilterChips
│   │   │   ├── hooks/
│   │   │   │   ├── useInvoiceForm.ts
│   │   │   │   ├── useInvoiceTotals.ts
│   │   │   │   └── useFilterState.ts
│   │   │   └── lib/
│   │   │       ├── formatCurrency.ts
│   │   │       ├── formatDate.ts
│   │   │       └── cn.ts         # clsx + twMerge utility
│   │   └── ...config files
│   │
│   └── backend/                 # Express BFF
│       ├── src/
│       │   ├── index.ts          # App bootstrap
│       │   ├── config.ts         # envalid env validation
│       │   ├── db/
│       │   │   ├── index.ts      # Drizzle client
│       │   │   └── schema.ts     # Drizzle schema (mirrors SQL above)
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rateLimit.middleware.ts
│       │   │   └── errorHandler.middleware.ts
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── invoices.routes.ts
│       │   │   ├── clients.routes.ts
│       │   │   ├── dashboard.routes.ts
│       │   │   └── preferences.routes.ts
│       │   ├── services/
│       │   │   ├── invoice4u.service.ts   # All invoice4u API calls
│       │   │   ├── dashboard.service.ts   # Metric aggregation logic
│       │   │   └── clientCache.service.ts # Postgres client cache sync
│       │   └── lib/
│       │       ├── invoice4uClient.ts    # Configured Axios instance
│       │       └── dateUtils.ts          # Period → date range helpers
│       └── ...config files
│
└── drizzle/
    ├── schema.ts
    └── migrations/
```

### 5.2 Developer Agent Assignments

| Agent | Module | Files Owned |
|---|---|---|
| **DB Agent** | `db-layer` | `drizzle/schema.ts`, all migration SQL files, `backend/src/db/` |
| **Auth Agent** | `auth-layer` | `backend/src/routes/auth.routes.ts`, `backend/src/middleware/auth.middleware.ts`, `frontend/src/store/auth.store.ts`, `frontend/src/pages/Login.tsx` |
| **API Agent** | `api-layer` | All `backend/src/routes/`, all `backend/src/services/`, `backend/src/middleware/rateLimit + errorHandler`, `backend/src/lib/` |
| **Frontend Core Agent** | `frontend-shell` | `frontend/src/router.tsx`, `frontend/src/components/layout/`, `frontend/src/components/shared/`, `frontend/src/lib/` |
| **Frontend Pages Agent** | `frontend-pages` | All `frontend/src/pages/`, `frontend/src/hooks/`, `frontend/src/components/invoice/`, `frontend/src/components/client/` |
| **Dashboard Agent** | `frontend-dashboard` | `frontend/src/pages/Dashboard.tsx`, `frontend/src/components/dashboard/`, `frontend/src/api/dashboard.ts` |
| **Shared Types Agent** | `shared-package` | `packages/shared/src/` |

### 5.3 Build Order & Dependencies

```
Phase 1 — Foundation (no dependencies, can start in parallel)
  [A] Shared Types Agent  →  packages/shared  (types, Zod schemas)
  [B] DB Agent            →  drizzle schema + migrations

Phase 2 — Backend (depends on A + B)
  [C] Auth Agent (backend half) →  auth routes + middleware  (needs shared schemas)
  [D] API Agent                 →  invoice/client/dashboard routes + services

Phase 3 — Frontend Shell (depends on A)
  [E] Frontend Core Agent  →  router, layout, design system components, lib utils

Phase 4 — Frontend Features (depends on C + D + E)
  [F] Auth Agent (frontend half)  →  Login page + auth store  (needs C for API)
  [G] Frontend Pages Agent        →  Invoice + Client pages    (needs D + E)
  [H] Dashboard Agent             →  Dashboard page + charts   (needs D + E)

Phase 5 — Integration & Polish (depends on F + G + H)
  [I] All agents  →  Integration testing, error states, empty states, animations
```

### 5.4 Complexity Estimates

| Module | Complexity | Notes |
|---|---|---|
| `shared-package` | 🟢 Low | Pure TypeScript interfaces and Zod schemas. No logic. |
| `db-layer` | 🟢 Low | 4 tables, straightforward schema. Drizzle setup is boilerplate-light. |
| `auth-layer` | 🟡 Medium | Session management, cookie security config, 401 handling across layers. |
| `api-layer` | 🟠 High | invoice4u API integration, response normalization, error mapping, dashboard aggregation math, rate limiting. |
| `frontend-shell` | 🟡 Medium | Design system setup, responsive layout, routing with auth guards, skeleton/empty state components. |
| `frontend-pages` | 🟠 High | Invoice creation form (real-time totals, multi line items, validation, unsaved changes), client management CRUD, filter state. |
| `frontend-dashboard` | 🟡 Medium | Metric cards, period/client filters, Recharts integration. Phase 2 chart is the main complexity. |

---

## 6. Shared Type Definitions

All types in `packages/shared/src/types.ts` are imported by both `apps/frontend` and `apps/backend`.

```typescript
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
  id?: string;           // invoice4u line item ID (present on fetched invoices)
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;         // quantity * unitPrice — computed, not user-editable
}

export interface Client {
  id: string;            // invoice4u client ID
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface Invoice {
  id: string;                  // invoice4u invoice ID
  invoiceNumber: string;       // e.g. "1042" — display number
  client: Client;
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;             // e.g. 0.17 for 17% Israeli VAT
  total: number;
  issueDate: string;           // ISO date string "YYYY-MM-DD"
  dueDate?: string;
  status: InvoiceStatus;
  createdAt: string;           // ISO datetime
  updatedAt: string;
}

export interface DashboardMetrics {
  totalEarned: number;
  outstanding: number;
  overdueCount: number;
  invoiceCount: number;
}

export interface TrendDataPoint {
  month: string;         // "YYYY-MM"
  label: string;         // "Jul 2024"
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


// ============================================================
// ZOD SCHEMAS (in packages/shared/src/schemas.ts)
// ============================================================
// Illustrative — actual file uses z.object(), z.string(), etc.

/*
import { z } from 'zod';

export const LineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity:    z.number().positive('Quantity must be greater than 0'),
  unitPrice:   z.number().positive('Unit price must be greater than 0'),
});

export const CreateInvoiceSchema = z.object({
  clientId:   z.string().optional(),
  clientData: z.object({
    name:         z.string().min(1),
    businessName: z.string().optional(),
    email:        z.string().email(),
    phone:        z.string().optional(),
    address:      z.string().optional(),
    taxId:        z.string().optional(),
  }).optional(),
  lineItems: z.array(LineItemSchema).min(1, 'At least one line item is required'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  dueDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(
  (data) => !!(data.clientId || data.clientData),
  { message: 'Either clientId or clientData must be provided' }
);

export const CreateClientSchema = z.object({
  name:         z.string().min(1, 'Name is required'),
  businessName: z.string().optional(),
  email:        z.string().email('Please enter a valid email address'),
  phone:        z.string().optional(),
  address:      z.string().optional(),
  taxId:        z.string().optional(),
});

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const PeriodFilterSchema = z.enum([
  'this_month', 'last_month', 'last_3_months', 'last_12_months', 'custom'
]);
*/
```

---

## 7. E2B Template Recommendation

### Recommended Template: **`node`**

**Rationale:**

The entire application — both the React SPA (built by Vite) and the Express BFF — runs in Node.js. The `node` E2B sandbox template is the correct choice because:

1. **Single runtime**: Both `apps/frontend` (Vite dev server) and `apps/backend` (Express) run under Node.js 20. No Python, no separate runtimes.
2. **Package manager**: The monorepo uses `pnpm` workspaces. The `node` template supports installing pnpm globally via `npm install -g pnpm`.
3. **Build tooling**: Vite, TypeScript compiler (`tsc`), Drizzle Kit all run as Node processes.
4. **Database**: Neon Postgres is accessed over HTTPS from within Node — no local Postgres process needed in the sandbox.

### Pre-installed Dependencies Needed

The following should be pre-installed or installed in the sandbox bootstrap script:

```bash
# System
node --version   # 20.x LTS required
npm install -g pnpm@9

# From root (monorepo bootstrap)
pnpm install

# Environment variables (injected as E2B secrets)
INVOICE4U_API_BASE_URL=https://api.invoice4u.co.il
INVOICE4U_API_KEY=<from_secrets>
DATABASE_URL=<neon_connection_string>
SESSION_SECRET=<random_32_char_string>
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### Development Server Commands

```bash
# In the sandbox, run both servers concurrently:
pnpm --filter backend dev   # → Express on :3001
pnpm --filter frontend dev  # → Vite on :5173

# Or from root with concurrently:
pnpm dev
```

### E2B Exposed Ports

| Port | Service |
|---|---|
| `5173` | Vite dev server (React SPA) |
| `3001` | Express BFF |

The frontend Vite config proxies `/api` to `http://localhost:3001` in development, so the browser only needs port `5173` exposed to the user.

---

*Architecture Design prepared by the OFFICE Architect Agent. Proceed to developer agent quest assignment.*



## Design Specification
# Yoavchu's Invoices — Design Specification

**Version:** 1.0 | **Status:** Draft | **Date:** 2025-06-30
**Author:** OFFICE UX/Design Agent
**Based on:** Project Brief v1.0 · Product Strategy v1.0 · PRD v1.0

---

## Table of Contents

1. [UI Approach](#1-ui-approach)
2. [Page Structure](#2-page-structure)
3. [Design System](#3-design-system)
4. [Wireframe Descriptions](#4-wireframe-descriptions)
5. [Interaction Patterns](#5-interaction-patterns)

---

## 1. UI Approach

### 1.1 Design Philosophy

Yoavchu's Invoices is a **premium, focused, dark-first product** for solo freelancers. The design philosophy is anchored in three words: **fast, beautiful, confident**. Every screen should feel like it was designed by someone who invoices for a living — not by an enterprise software team. The aesthetic is inspired by Fitonist's polished interaction quality: dark surfaces, vivid accent pops, smooth transitions, and generous whitespace that signals "this tool respects your time."

The UI is **not** minimal in the sparse/barren sense — it is *purposefully lean*. Every element earns its place. Forms show only necessary fields. Dashboards answer exactly three questions. Navigation never requires more than two taps to reach any critical action.

Design is positioned in the **high design quality + solo-focused** quadrant deliberately. The dark theme, rounded cards, and vibrant green-teal accents are not decoration — they are the brand differentiator and the primary reason a design-sensitive freelancer (Yael) would choose this tool over invoice4u's default UI.

### 1.2 Layout Strategy

- **Single-Page Application (SPA)** with client-side routing. No full page reloads between screens; transitions feel native and instantaneous.
- **Bottom navigation bar** on mobile (≤ 768px) — thumb-reachable, persistent, 4 core destinations.
- **Left sidebar navigation** on desktop (≥ 1024px) — compact icon+label sidebar, collapsible.
- **Card-based content areas** throughout. Data is chunked into digestible cards with clear hierarchy: headline metric → supporting detail → action.
- **Full-screen modal flows** for Invoice Creation and Client forms — focused context with no ambient navigation distractions.
- **Sticky totals panel** within the invoice creation flow ensures the running total is always visible without scrolling.

### 1.3 Responsive Approach

**Mobile-first.** Every layout begins at 320px and scales up. Breakpoints:

| Breakpoint | Width | Layout Behavior |
|---|---|---|
| **xs** | 320px–374px | Single-column, full-width cards, compact padding |
| **sm** | 375px–767px | Single-column, standard mobile layout (primary design target) |
| **md** | 768px–1023px | Tablet: two-column dashboard metrics, expanded list rows |
| **lg** | 1024px–1439px | Desktop: sidebar nav, multi-column dashboard, wider forms |
| **xl** | 1440px+ | Max-width container (1280px centered), generous side margins |

Touch targets meet the PRD-required minimum of **44×44px** on all interactive elements. Forms use large input heights (52px on mobile) to prevent mis-taps. All critical actions (Send Invoice, Save Client, Log Out) are reachable with one thumb on a standard iPhone screen.

### 1.4 Persona-Driven Design Decisions

| Persona | Design Priority | Design Response |
|---|---|---|
| **Yael** (designer, mobile-first) | Aesthetic quality + speed on iPhone | Premium dark theme, micro-animations, <60s invoice flow, bottom nav for thumb reach |
| **Amir** (developer, desktop, accuracy) | Reliability + data density on desktop | Sidebar nav on desktop, client-filtered dashboard, confirmation modal before send, keyboard nav support |
| **Noa** (translator, medium tech comfort) | Guided flow + status clarity | Prominent field labels, inline validation, clear paid/unpaid badges, empty states with CTAs |

---

## 2. Page Structure

### 2.1 Overview — All Pages/Screens

| # | Screen | Phase | Primary Persona |
|---|---|---|---|
| 1 | Login | MVP | All |
| 2 | Dashboard | MVP | Yael, Amir |
| 3 | Invoice History | MVP | Noa, Amir |
| 4 | Invoice Detail | MVP | All |
| 5 | Invoice Creation | MVP | Yael, Noa |
| 6 | Invoice Success | MVP | Yael |
| 7 | Client List | MVP | All |
| 8 | Client Create/Edit | MVP | All |
| 9 | Send Confirmation Modal | Phase 2 | Amir |
| 10 | Invoice Duplication (pre-fill) | Phase 2 | Yael |
| 11 | Settings / Profile | Phase 3 | All |

---

### 2.2 Page-by-Page Breakdown

---

#### Page 1 — Login

**Purpose:** Authenticate the user against the invoice4u API and establish a session.

**Key Components:**
- App logo / wordmark (centered, top third)
- Email input field
- Password input field
- "Log In" primary CTA button (full-width)
- Inline error message zone (appears on failed auth: "Incorrect email or password. Please try again.")
- Subtle footer: "Your data is stored securely on invoice4u"

**Navigation Flow:**
- **Arrival:** First visit or session expiry; also redirected here after logout.
- **On success:** Redirect → Dashboard (Page 2).
- **On failure:** Stays on Login; error message rendered below the form.
- **No "Sign Up" link** — users must already have an invoice4u account (per PRD out-of-scope).

---

#### Page 2 — Dashboard

**Purpose:** The default landing screen after login. Provides an "at a glance" financial pulse: how much earned, what's outstanding, any overdue invoices.

**Key Components:**
- **Header bar:** App name/logo (left), avatar/initials + logout (right)
- **Period selector:** Horizontal chip group — "This Month / Last Month / Last 3 Months / Last 12 Months" (sticky below header)
- **Client filter:** Collapsible dropdown — "All Clients" default; filters all metrics when a client is selected
- **Metric cards (3, stacked on mobile / row on desktop):**
  - Total Earned (paid invoices for period) — primary card, most prominent
  - Outstanding Balance (unpaid invoices) — tappable; navigates to History filtered to Unpaid
  - Overdue Count (unpaid + past due date) — tappable; navigates to History filtered to Overdue
- **Recent Invoices list:** Last 5–10 invoices with status badges; each row tappable → Invoice Detail
- **"New Invoice" FAB (Floating Action Button):** Fixed bottom-right on mobile; prominent button in header on desktop
- **Revenue Trend Chart** (Phase 2): Bar chart, trailing 12 months, below the recent invoices list
- **Empty state** (zero invoices): Illustration + "No invoices yet. Create your first one in 60 seconds." + CTA

**Navigation Flow:**
- **Arrival:** Default after login; accessible via bottom nav "Home" tab.
- **Metric card tap (Outstanding):** → Invoice History (pre-filtered: Unpaid)
- **Recent invoice row tap:** → Invoice Detail
- **FAB / "New Invoice" tap:** → Invoice Creation flow
- **Period/client filter change:** In-place data refresh (no navigation)

---

#### Page 3 — Invoice History

**Purpose:** Full browsable list of all invoices. Supports filtering by status, client, and time period for tax prep and follow-up workflows.

**Key Components:**
- **Page header:** "Invoices" title, "Export CSV" action (Phase 3, top right)
- **Filter bar (sticky):**
  - Status filter chips: All · Paid · Unpaid · Overdue
  - Client dropdown filter
  - Period dropdown filter (This Month / Last Month / Last 3 Months / Last 12 Months / Custom Range)
  - "Clear Filters" link (appears when any filter is active)
- **Results count:** "Showing 24 invoices" — updates with filters
- **Invoice list rows** (each row):
  - Invoice # (muted, small)
  - Client name (prominent)
  - Issue date
  - Total amount (right-aligned, bold)
  - Status badge: Paid (green) / Unpaid (neutral/gray) / Overdue (amber)
- **Pagination** or infinite scroll at 25 items/page (for 500+ invoice performance)
- **Empty state (no results after filter):** "No invoices match your filters." + "Clear Filters" CTA
- **Empty state (no invoices ever):** Illustration + "No invoices yet." + "Create Invoice" CTA
- **Pull-to-refresh** on mobile

**Navigation Flow:**
- **Arrival:** Bottom nav "Invoices" tab, or tapped metric card on Dashboard.
- **Invoice row tap:** → Invoice Detail (Page 4)
- **Back from Detail:** Returns here with filters preserved.

---

#### Page 4 — Invoice Detail

**Purpose:** Full read-only view of a single invoice — all fields, line items, totals, and status.

**Key Components:**
- **Back button:** "← Invoices" (preserves filter state)
- **Invoice header card:**
  - Invoice # (large, prominent)
  - Status badge (Paid / Unpaid / Overdue)
  - Issue date + Due date
- **Client info card:** Client name, business name, email, address
- **Line items table:** Description · Qty · Unit Price · Row Total (for each item)
- **Totals summary:** Subtotal / Tax / **Grand Total** (bold, large)
- **Action bar (bottom / top-right on desktop):**
  - "Duplicate Invoice" (Phase 2) — pre-fills creation form
  - (Phase 3) "Preview PDF" button

**Navigation Flow:**
- **Arrival:** Tapped from Invoice History list or Dashboard recent invoices.
- **"Duplicate Invoice" tap:** → Invoice Creation (pre-filled)
- **Back button:** → Invoice History (filters preserved) or Dashboard (if arrived from there)

---

#### Page 5 — Invoice Creation

**Purpose:** The core product flow. Create and submit an invoice to invoice4u in under 60 seconds. Full-screen focused experience.

**Key Components:**
- **Header:** "New Invoice" title, × close button (triggers unsaved-changes warning if form has data)
- **Client selector (top of form):**
  - Autocomplete search input: "Select a client…"
  - Dropdown list of saved clients (filterable by name as typed)
  - "＋ New Client" option at the bottom of the dropdown (inline toggle to manual entry fields)
- **Client detail section** (auto-fills on saved client selection; editable fields if new client):
  - Name, Business Name, Email, Address, Tax ID
- **Line Items section:**
  - Column headers: Description · Qty · Unit Price · Total
  - Line item rows (one by default): each row has 3 inputs + calculated row total
  - Remove row button (× icon, right side of row)
  - "＋ Add Line Item" button below the rows
- **Sticky totals panel** (bottom of screen on mobile / fixed right panel on desktop):
  - Subtotal
  - Tax
  - **Total** (large, bold, green accent)
- **Issue Date picker** (defaults to today)
- **"Send Invoice" primary CTA** (full-width on mobile, right-aligned on desktop)
- **(Phase 2) "Review First" secondary link** — opens Send Confirmation Modal
- **Inline validation errors** on each field (shown on blur or on submit attempt)
- **API error banner** (top of form, appears on failed submission; form data preserved)

**Navigation Flow:**
- **Arrival:** FAB/button tap from Dashboard or bottom nav "+" action.
- **On submit success:** → Invoice Success Screen (Page 6)
- **On submit failure:** Stays on form; error banner shown; all data preserved.
- **× close (with data):** Confirmation dialog "Discard invoice?" → Yes discards, No returns to form.
- **× close (empty form):** Navigates back to Dashboard silently.

---

#### Page 6 — Invoice Success

**Purpose:** Deliver a satisfying, confident confirmation that the invoice was sent. Resolves the flow and offers clear next actions.

**Key Components:**
- **Success icon / animation:** Large checkmark or send icon — animated on entry (Phase 3: celebratory micro-animation; Phase 1: static checkmark with fade-in)
- **Headline:** "Invoice Sent!" (large, green accent)
- **Summary block:**
  - Invoice # (e.g., "Invoice #1042")
  - Client name (e.g., "To: Startup Studio Ltd.")
  - Total amount (e.g., "₪4,200")
- **Action buttons (two):**
  - Primary: "Create Another Invoice" → Invoice Creation (cleared form)
  - Secondary: "Back to Dashboard" → Dashboard
- **No navigation bar** visible — this is a focused terminal screen.

**Navigation Flow:**
- **Arrival:** Only from successful invoice4u API submission.
- **"Create Another Invoice":** → Invoice Creation (fresh form)
- **"Back to Dashboard":** → Dashboard

---

#### Page 7 — Client List

**Purpose:** View, search, and manage all saved clients.

**Key Components:**
- **Page header:** "Clients" title + "＋ New Client" button (top right)
- **Search input:** "Search clients…" — filters the list in real time
- **Client cards / rows** (each entry):
  - Client name (bold)
  - Business name (secondary text)
  - Email (muted)
  - Edit icon button (right)
  - Delete icon button (right, with confirmation dialog)
- **Empty state:** Illustration + "No clients yet. Add your first client to speed up invoicing." + "Add Client" CTA

**Navigation Flow:**
- **Arrival:** Bottom nav "Clients" tab.
- **"＋ New Client" / "Add Client" CTA:** → Client Create/Edit form (Page 8, create mode)
- **Edit icon tap:** → Client Create/Edit form (Page 8, edit mode, pre-filled)
- **Delete icon tap:** Confirmation dialog inline — "Delete [Name]? This cannot be undone." → Confirm deletes; Cancel dismisses.

---

#### Page 8 — Client Create / Edit

**Purpose:** Collect or update all client fields required by the invoice4u API.

**Key Components:**
- **Header:** "New Client" or "Edit Client" title, back/cancel button (left)
- **Form fields** (full-width stacked on mobile):
  - Full Name (required)
  - Business Name
  - Email (required, validated format)
  - Phone
  - Address (multi-line)
  - Tax ID / Business Registration Number
- **Inline validation errors** (shown on blur, re-checked on submit)
- **"Save Client" / "Save Changes" CTA** (full-width, bottom)
- **"Cancel" link** (discards changes, returns to Client List)

**Navigation Flow:**
- **Arrival:** From Client List "New Client" or "Edit" action.
- **On save success:** → Client List (new/updated client visible at top)
- **On save failure:** Stays on form; API error displayed.
- **Cancel:** → Client List (no changes made)

---

#### Page 9 — Send Confirmation Modal (Phase 2)

**Purpose:** A summary screen before final submission — lets the user catch errors before the invoice is sent. Addresses Amir's accuracy-first persona.

**Key Components:**
- **Modal overlay** (full-screen on mobile, centered card on desktop)
- **Header:** "Review Your Invoice"
- **Read-only summary:**
  - Client name and email
  - Line items list (description, qty, unit price, row total)
  - Subtotal / Tax / **Grand Total**
  - Issue date
- **Action buttons:**
  - Primary: "Confirm & Send" — triggers API call
  - Secondary: "Edit Invoice" — closes modal, returns to form with all data intact
- **Tap-outside-to-close** behavior: treated as "Edit Invoice" (never auto-submits)

**Navigation Flow:**
- **Arrival:** "Review First" tap from Invoice Creation form.
- **"Confirm & Send":** → Invoice Success Screen (Page 6)
- **"Edit Invoice" / tap outside:** → Invoice Creation (form state preserved)

---

#### Page 10 — Invoice Duplication (Phase 2)

**Purpose:** Not a unique screen — this is the Invoice Creation form (Page 5) loaded in a pre-filled state. Reduces recurring invoice creation to ~10 seconds.

**Pre-fill Behavior:**
- Client selector pre-set to the original invoice's client
- All line items from the original invoice loaded (editable)
- Issue date defaulted to today (not original's date)
- All fields remain editable before submission

---

#### Page 11 — Settings / Profile (Phase 3)

**Purpose:** Light preferences page for theme toggle and session management.

**Key Components:**
- **User info:** Name, email (from invoice4u session)
- **Theme toggle:** Dark / Light (Phase 3)
- **"Log Out" button** (destructive, clears session)
- **App version / attribution**

**Navigation Flow:**
- **Arrival:** Avatar/initials tap in header (all pages).
- **Log Out:** Clears session → Login screen.

---

## 3. Design System

### 3.1 Color Palette

The palette is anchored by a **deep near-black background** with a **vibrant green-teal accent spectrum**. All colors must meet WCAG 2.1 AA contrast ratios (4.5:1 for body text, 3:1 for large text/UI components) against their respective backgrounds.

#### Background & Surface Layers

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-base` | `#0D0F12` | Page/app background — deepest layer |
| `--color-bg-surface` | `#161A1F` | Cards, panels, modals — one level above base |
| `--color-bg-elevated` | `#1E2329` | Dropdowns, popovers, hover states on cards |
| `--color-bg-input` | `#1A1F25` | Form input backgrounds |
| `--color-border` | `#2A3040` | Subtle borders between surface elements |
| `--color-border-focus` | `#3DD68C` | Input focus ring (green accent) |

#### Green-Teal Accent Spectrum (Brand Colors)

| Token | Hex | Usage |
|---|---|---|
| `--color-accent-primary` | `#3DD68C` | Primary CTA buttons, active nav, success states, grand total |
| `--color-accent-secondary` | `#2CB67D` | Hover state of primary accent, secondary highlights |
| `--color-accent-teal` | `#2EBDB8` | Charts, data visualizations, alternate highlights |
| `--color-accent-yellow-green` | `#A3E635` | Milestone celebrations, special callouts (Phase 3) |
| `--color-accent-muted` | `#1F4A35` | Accent backgrounds (e.g., paid badge background) |

#### Semantic / Status Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-paid` | `#3DD68C` | Paid status badge text |
| `--color-paid-bg` | `#1A3D2B` | Paid status badge background |
| `--color-unpaid` | `#8A9BB0` | Unpaid status badge text |
| `--color-unpaid-bg` | `#1E2530` | Unpaid status badge background |
| `--color-overdue` | `#F59E0B` | Overdue status badge text |
| `--color-overdue-bg` | `#3A2A0E` | Overdue status badge background |
| `--color-error` | `#F87171` | Inline validation errors, error banners |
| `--color-error-bg` | `#3A1A1A` | Error banner background |

#### Typography Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#F0F4F8` | Headings, primary body text |
| `--color-text-secondary` | `#8A9BB0` | Supporting labels, metadata, captions |
| `--color-text-muted` | `#4A5568` | Placeholder text, disabled states |
| `--color-text-inverse` | `#0D0F12` | Text on accent-colored buttons |

---

### 3.2 Typography

**Primary font:** `Inter` (Google Fonts / self-hosted). Excellent legibility at all sizes, wide OS/browser support, optimized for UI use, and carries the modern-professional tone appropriate for a financial tool. Fallback stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

**Numeric / data font:** `Inter` with `font-variant-numeric: tabular-nums` applied to all monetary amounts, invoice numbers, and dates. This ensures columns align perfectly in lists and tables.

#### Type Scale

| Level | Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| **Display** | `--text-display` | 32px / 2rem | 700 | 1.2 | Success screen headline, milestone celebrations |
| **H1** | `--text-h1` | 24px / 1.5rem | 700 | 1.3 | Page titles, dashboard metric values |
| **H2** | `--text-h2` | 20px / 1.25rem | 600 | 1.35 | Card headings, section titles |
| **H3** | `--text-h3` | 16px / 1rem | 600 | 1.4 | Form section labels, list group headers |
| **Body** | `--text-body` | 15px / 0.9375rem | 400 | 1.6 | Primary body copy, form values, list content |
| **Body Small** | `--text-body-sm` | 13px / 0.8125rem | 400 | 1.5 | Captions, metadata, secondary info |
| **Label** | `--text-label` | 12px / 0.75rem | 500 | 1.4 | Form field labels (uppercase, letter-spaced) |
| **Caption** | `--text-caption` | 11px / 0.6875rem | 400 | 1.4 | Timestamps, version info, fine print |

**Label style:** Form labels use `font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-text-secondary)`. This creates clear visual separation between the label and its input below.

---

### 3.3 Spacing System

**Base unit: 4px.** All spacing values are multiples of 4px for mathematical consistency. Components primarily use the 8px grid (2× base unit).

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Icon-to-label gaps, tight internal spacing |
| `--space-2` | 8px | Between related elements (label → input) |
| `--space-3` | 12px | List item internal padding (compact) |
| `--space-4` | 16px | Standard card padding (mobile minimum per PRD) |
| `--space-5` | 20px | Between form fields |
| `--space-6` | 24px | Section gaps within a card |
| `--space-8` | 32px | Between cards/sections |
| `--space-10` | 40px | Major page sections |
| `--space-12` | 48px | Page-level top/bottom padding |

**Component padding conventions:**
- Cards: `padding: 20px` (mobile), `padding: 24px` (desktop)
- Form inputs: `padding: 14px 16px` (gives 52px height with 16px font + 2px border)
- Buttons (large/primary): `padding: 16px 24px`
- Buttons (medium): `padding: 12px 20px`
- Status badges: `padding: 4px 10px`
- Bottom navigation bar: `padding: 10px 0 20px` (accounts for iOS safe area)

**Border radius:**
- Cards, modals, dropdowns: `16px`
- Inputs, buttons: `12px`
- Badges/chips: `100px` (pill)
- Icons in containers: `10px`

---

### 3.4 Component Patterns

#### Buttons

| Variant | Background | Text Color | Border | Usage |
|---|---|---|---|---|
| **Primary** | `--color-accent-primary` | `--color-text-inverse` | None | Single primary action per screen (Send Invoice, Save Client, Log In) |
| **Secondary** | `--color-bg-elevated` | `--color-text-primary` | `1px solid --color-border` | Secondary actions (Cancel, Edit, Duplicate) |
| **Ghost** | Transparent | `--color-accent-primary` | None | Tertiary text actions (Clear Filters, Back links) |
| **Destructive** | `--color-error-bg` | `--color-error` | `1px solid --color-error` | Delete confirmations only |

All buttons: `border-radius: 12px; font-weight: 600; min-height: 44px; min-width: 44px`. Primary buttons are full-width on mobile. Disabled state: `opacity: 0.4; cursor: not-allowed`.

#### Cards

Standard card: `background: var(--color-bg-surface); border-radius: 16px; border: 1px solid var(--color-border); padding: 20px`. No drop shadows by default — elevation is communicated through background color layering, not shadows. Interactive cards (list rows, metric cards) get a subtle border color shift on hover: `border-color: var(--color-border-focus)`.

**Metric cards** (Dashboard): Feature an oversized value (`--text-h1`, `--color-accent-primary` for earned / `--color-text-primary` for others), a small label above it, and a trend indicator below (e.g., "↑ 12% from last month" in secondary text, Phase 2).

#### Forms

- All inputs: `background: var(--color-bg-input); border: 1px solid var(--color-border); border-radius: 12px; height: 52px; font-size: 15px; color: var(--color-text-primary)`.
- Focus state: `border-color: var(--color-border-focus); box-shadow: 0 0 0 3px rgba(61, 214, 140, 0.15)`.
- Error state: `border-color: var(--color-error); box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15)`.
- Error message: Appears directly below the field, `font-size: 13px; color: var(--color-error)`, prefixed with a small ⚠ icon.
- Labels: Always visible above the input (no floating/placeholder-only labels) per WCAG and Noa's guided-flow requirement.
- Textareas (e.g., address): `min-height: 80px; resize: vertical`.

#### Tables / Line Item Rows

Used in Invoice Creation and Invoice Detail. On mobile: stacked layout (description full-width, qty/price/total on one line below). On desktop: traditional column layout. Row background: transparent; hover: `background: var(--color-bg-elevated)`. Borders: horizontal rules only (`border-bottom: 1px solid var(--color-border)`).

#### Status Badges

Pill-shaped, color-coded. `font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 100px`.

- **Paid:** Green text on dark green background
- **Unpaid:** Gray text on dark gray background
- **Overdue:** Amber text on dark amber background

#### Modals

Full-screen on mobile (slide up from bottom, like a bottom sheet). Centered card on desktop (max-width 560px, with darkened backdrop overlay at 60% opacity). Always include a close/dismiss mechanism. Animation: slide-up on mobile (300ms ease-out), fade+scale on desktop (200ms ease-out).

#### Filter Chips

Horizontal scrollable row on mobile. `background: --color-bg-elevated; border: 1px solid --color-border; border-radius: 100px; padding: 8px 16px; font-size: 13px; font-weight: 500`. Active/selected state: `background: --color-accent-muted; border-color: --color-accent-primary; color: --color-accent-primary`.

#### Floating Action Button (FAB)

Mobile dashboard: fixed bottom-right, `56px × 56px`, `background: --color-accent-primary`, `border-radius: 16px`, "＋" icon. Shadow: `0 4px 24px rgba(61, 214, 140, 0.35)` (green glow effect). Position: `bottom: 88px; right: 16px` (above bottom nav bar).

#### Skeleton Screens

Used for all async data loads (dashboard metrics, invoice list, client list). Skeleton elements match the exact shape and size of the content they replace: `background: linear-gradient(90deg, #1E2329 25%, #252C35 50%, #1E2329 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite`. Replaces spinners for better perceived performance.

#### Empty States

Each empty state includes: a simple line-art illustration (monochrome, using `--color-text-muted`), a headline, a brief supportive sentence, and a single CTA button. Never a blank screen. Illustrations are minimal so they don't compete with content once populated.

---

## 4. Wireframe Descriptions

### 4.1 Login Screen

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│           [App Logo / Wordmark]         │  ← centered, top third, ~80px tall
│         Yoavchu's Invoices              │
│                                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ EMAIL                           │   │  ← label above, 52px input
│  │ [your@email.com              ]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ PASSWORD                        │   │
│  │ [••••••••                 👁  ]  │   │  ← show/hide toggle
│  └─────────────────────────────────┘   │
│                                         │
│  ⚠ Incorrect email or password.        │  ← error zone (hidden unless error)
│                                         │
│  ┌─────────────────────────────────┐   │
│  │          Log In                 │   │  ← primary button, full-width, green
│  └─────────────────────────────────┘   │
│                                         │
│                                         │
│    Your data is stored on invoice4u     │  ← muted caption, bottom
└─────────────────────────────────────────┘
```

**Layout:** Single-column, vertically centered on screen. Background: `--color-bg-base`. Logo area takes top ~30% of viewport; form takes middle ~50%; caption takes bottom ~10%. No navigation chrome.

---

### 4.2 Dashboard (Mobile, 375px)

```
┌─────────────────────────────────────────┐
│  Yoavchu's Invoices          [👤 Logout] │  ← header bar, 56px
├─────────────────────────────────────────┤
│  [This Month] [Last Month] [Last 3M] … │  ← filter chips, horizontally scrollable
│  [All Clients ▼]                        │  ← client filter dropdown
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ TOTAL EARNED                    │   │  ← primary metric card
│  │ ₪18,400                         │   │    large green number
│  └─────────────────────────────────┘   │
│                                         │
│  ┌──────────────┐ ┌──────────────┐     │
│  │ OUTSTANDING  │ │ OVERDUE      │     │  ← 2 smaller metric cards, side by side
│  │ ₪3,200       │ │ 2 invoices   │     │
│  └──────────────┘ └──────────────┘     │
│                                         │
│  Recent Invoices                        │  ← section heading
│  ┌─────────────────────────────────┐   │
│  │ #1042  Startup Studio  ₪4,200   │   │
│  │ Jun 28                 [PAID]   │   │
│  ├─────────────────────────────────┤   │
│  │ #1041  Amir Cohen      ₪7,000   │   │
│  │ Jun 25                [UNPAID]  │   │
│  ├─────────────────────────────────┤   │
│  │ #1040  Rivka Agency    ₪1,800   │   │
│  │ Jun 20               [OVERDUE]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│                        [＋ New Invoice] │  ← FAB, fixed bottom-right
├─────────────────────────────────────────┤
│  [🏠 Home] [📄 Invoices] [＋] [👥 Clients] [⚙]│  ← bottom nav, 56px
└─────────────────────────────────────────┘
```

**Notes:** Total Earned card spans full width. Outstanding and Overdue share a row (50/50). Recent Invoices list is a card with divided rows. FAB floats above bottom nav. Metric cards are tappable — Outstanding → History(Unpaid), Overdue → History(Overdue).

---

### 4.3 Dashboard (Desktop, 1280px)

```
┌──────────┬──────────────────────────────────────────────────────────┐
│          │  Dashboard                    [All Clients ▼]            │
│  🏠 Home │                                                           │
│          │  [This Month] [Last Month] [Last 3 Months] [Last Year]   │
│ 📄 Invoices                                                          │
│          │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ 👥Clients│  │ TOTAL EARNED │ │ OUTSTANDING  │ │ OVERDUE      │     │
│          │  │ ₪18,400      │ │ ₪3,200       │ │ 2 invoices   │     │
│  ⚙ Settings  └──────────────┘ └──────────────┘ └──────────────┘   │
│          │                                                           │
│          │  Recent Invoices              [View All →]               │
│          │  ┌──────────────────────────────────────────────────┐   │
│          │  │ # 1042 · Startup Studio · Jun 28 · ₪4,200 [PAID] │   │
│          │  │ # 1041 · Amir Cohen    · Jun 25 · ₪7,000 [UNPD]  │   │
│          │  │ # 1040 · Rivka Agency  · Jun 20 · ₪1,800 [OVRD]  │   │
│          │  └──────────────────────────────────────────────────┘   │
│  [＋ New  │                                                           │
│  Invoice]│  [Phase 2: Revenue Trend Bar Chart — 12 months]          │
│          │                                                           │
└──────────┴──────────────────────────────────────────────────────────┘
  ← 220px →  ← main content area, max-width 1060px centered →
```

**Notes:** Left sidebar is 220px fixed, collapsible to 64px (icon-only). "＋ New Invoice" button lives at the bottom of the sidebar and in the top-right of the main area. Three metric cards in a horizontal row. Charts render below recent invoices.

---

### 4.4 Invoice History (Mobile)

```
┌─────────────────────────────────────────┐
│ ← Invoices                    [Export]  │  ← header
├─────────────────────────────────────────┤
│ [All ●] [Paid] [Unpaid] [Overdue]       │  ← status filter chips (scrollable)
│ [Client: All ▼] [Period: This Month ▼]  │  ← secondary filters
│ Showing 12 invoices  [Clear Filters ×]  │  ← results count + clear
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ #1042  Startup Studio               │ │
│ │ Jun 28, 2025            ₪4,200 [PAID]│ │
│ ├─────────────────────────────────────┤ │
│ │ #1041  Amir Cohen                   │ │
│ │ Jun 25, 2025           ₪7,000 [UNPD]│ │
│ ├─────────────────────────────────────┤ │
│ │ #1040  Rivka Agency                 │ │
│ │ Jun 20, 2025           ₪1,800 [OVRD]│ │
│ ├─────────────────────────────────────┤ │
│ │  … more rows …                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│         [ Load More / Page 1 of 3 ]     │  ← pagination
├─────────────────────────────────────────┤
│  [🏠 Home] [📄 Invoices●] [＋] [👥] [⚙] │  ← bottom nav
└─────────────────────────────────────────┘
```

---

### 4.5 Invoice Detail (Mobile)

```
┌─────────────────────────────────────────┐
│ ← Invoices                              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Invoice #1042              [PAID ✓] │ │  ← invoice header card
│ │ Issued: Jun 28, 2025                │ │
│ │ Due:    Jul 12, 2025                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CLIENT                              │ │  ← client info card
│ │ Startup Studio Ltd.                 │ │
│ │ contact@startupstudio.io            │ │
│ │ 12 Rothschild Blvd, Tel Aviv        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ LINE ITEMS                          │ │  ← line items card
│ │ Brand Identity Design    1 × ₪3,500 │ │
│ │ Logo Refinements         2 × ₪350   │ │
│ ├─────────────────────────────────────┤ │
│ │ Subtotal                    ₪4,200  │ │
│ │ Tax (17%)                     ₪714  │ │
│ │ Total                       ₪4,914  │ │  ← total in green
│ └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [📋 Duplicate Invoice]          │   │  ← Phase 2 action (secondary button)
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  [🏠 Home] [📄 Invoices●] [＋] [👥] [⚙] │
└─────────────────────────────────────────┘
```

---

### 4.6 Invoice Creation (Mobile)

```
┌─────────────────────────────────────────┐
│ New Invoice                          [×] │  ← header + close button
├─────────────────────────────────────────┤
│ CLIENT                                  │
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Select a client…              ▼  │ │  ← autocomplete selector
│ │   Startup Studio Ltd.               │ │  ← dropdown option
│ │   Amir Cohen                        │ │
│ │   Rivka Agency                      │ │
│ │   ─────────────────────────────     │ │
│ │   ＋ New Client                     │ │
│ └─────────────────────────────────────┘ │
│ (client fields auto-fill after select)  │
│                                         │
│ LINE ITEMS                              │
│ ┌──────────────────────────────────┐   │
│ │ Description                      │   │
│ │ [Brand Identity Design         ] │   │
│ │ Qty [1    ] Unit Price [3500  ]  │   │
│ │ Row Total: ₪3,500           [×] │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ Description                      │   │
│ │ [Logo Refinements              ] │   │
│ │ Qty [2    ] Unit Price [350   ]  │   │
│ │ Row Total: ₪700             [×] │   │
│ └──────────────────────────────────┘   │
│  ＋ Add Line Item                       │
│                                         │
│ ISSUE DATE                              │
│ ┌────────────────────────────────────┐ │
│ │ Jun 28, 2025                  📅   │ │
│ └────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│  Subtotal          ₪4,200               │  ← sticky totals panel
│  Tax (17%)           ₪714               │
│  Total             ₪4,914               │  ← green, bold
│  ┌─────────────────────────────────┐   │
│  │         Send Invoice            │   │  ← primary CTA
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Notes:** The form scrolls; the totals panel + CTA button are sticky at the bottom. The × close button triggers an unsaved-changes warning if any field has been filled. Dropdown opens inline as a list overlay. "New Client" option at the bottom of the dropdown expands inline form fields.

---

### 4.7 Invoice Success Screen

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│            ✅ (large, animated)          │  ← success icon, 96px, green
│                                         │
│           Invoice Sent!                 │  ← display headline, green
│                                         │
│         Invoice #1042                   │  ← invoice number
│         Startup Studio Ltd.             │  ← client name
│         ₪4,914                          │  ← total, bold
│                                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    Create Another Invoice       │   │  ← primary button
│  └─────────────────────────────────┘   │
│                                         │
│       Back to Dashboard                 │  ← ghost/secondary link
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Notes:** No navigation chrome on this screen — it is a terminal, celebratory moment. Full-screen centered layout. Phase 3: checkmark draws itself with a path animation (200ms); confetti or particle burst follows (500ms total). Respects `prefers-reduced-motion` with a static checkmark fallback.

---

### 4.8 Client List (Mobile)

```
┌─────────────────────────────────────────┐
│ Clients                   [＋ New Client]│
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Search clients…                  │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Startup Studio Ltd.         ✏  🗑   │ │
│ │ contact@startupstudio.io            │ │
│ ├─────────────────────────────────────┤ │
│ │ Amir Cohen                  ✏  🗑   │ │
│ │ amir@cohendev.io                    │ │
│ ├─────────────────────────────────────┤ │
│ │ Rivka Agency                ✏  🗑   │ │
│ │ billing@rivka.co.il                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│  [🏠 Home] [📄 Invoices] [＋] [👥●] [⚙] │
└─────────────────────────────────────────┘
```

**Delete confirmation** (inline dialog, not navigation):
```
│ ┌──────────────────────────────────────┐│
│ │ Delete Startup Studio Ltd.?          ││
│ │ This cannot be undone.               ││
│ │   [Cancel]        [Delete]           ││  ← destructive red
│ └──────────────────────────────────────┘│
```

---

### 4.9 Client Create / Edit (Mobile)

```
┌─────────────────────────────────────────┐
│ ← Clients       New Client              │
├─────────────────────────────────────────┤
│ FULL NAME *                             │
│ ┌────────────────────────────────────┐ │
│ │ [Tali Ben David                  ] │ │
│ └────────────────────────────────────┘ │
│ BUSINESS NAME                          │
│ ┌────────────────────────────────────┐ │
│ │ [Tali Design Studio              ] │ │
│ └────────────────────────────────────┘ │
│ EMAIL *                                │
│ ┌────────────────────────────────────┐ │
│ │ [tali@talidesign.io              ] │ │
│ └────────────────────────────────────┘ │
│ PHONE                                  │
│ ┌────────────────────────────────────┐ │
│ │ [+972 50-000-0000                ] │ │
│ └────────────────────────────────────┘ │
│ ADDRESS                                │
│ ┌────────────────────────────────────┐ │
│ │ [14 Ben Yehuda St, Tel Aviv      ] │ │
│ └────────────────────────────────────┘ │
│ TAX ID / BUSINESS NUMBER               │
│ ┌────────────────────────────────────┐ │
│ │ [515XXXXXXX                      ] │ │
│ └────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Save Client             │   │  ← primary CTA
│  └─────────────────────────────────┘   │
│            Cancel                       │  ← ghost link
└─────────────────────────────────────────┘
```

---

## 5. Interaction Patterns

### 5.1 Transitions & Animations

**Page/Screen Transitions (SPA routing):**
- **Standard navigation** (e.g., Dashboard → Invoice History): Fade transition, 150ms ease-in-out. Feels instant without being jarring.
- **Forward drill-down** (e.g., Invoice List → Invoice Detail): Slide-in from right (mobile), 250ms ease-out. Mirrors native iOS/Android navigation conventions, reducing cognitive load.
- **Back navigation:** Slide-out to right, 200ms ease-in. The "back" direction is always visually opposite to the "forward" direction.
- **Modal/bottom sheet open:** Slide up from bottom (mobile), 300ms cubic-bezier(0.32, 0.72, 0, 1) — springy feel. Backdrop fades in simultaneously to 60% opacity.
- **Modal close:** Slide down, 200ms ease-in. Backdrop fades out.
- **Full-screen flow (Invoice Creation):** Slide up from bottom, covers the full screen. Reinforces that the user has entered a focused sub-context.

**Micro-animations:**
- **Status badges on load:** Fade in with a subtle scale (1.0 → 1.0, opacity 0 → 1), 200ms, staggered 50ms between list items. Creates a sense of data "arriving."
- **Real-time total update (Invoice Creation):** Numeric value cross-fades with a brief color flash (green pulse, 300ms) when the total updates. Communicates the change without being distracting.
- **Filter chip selection:** Background and border color transition, 150ms. No layout shift.
- **FAB press:** Scale down to 0.95 on press, back to 1.0 on release, 100ms. Tactile press feedback.
- **Success screen checkmark (Phase 1):** Simple fade-in of the icon and text, 400ms, staggered. Clean and confident.
- **Success screen (Phase 3):** SVG checkmark path draws itself (stroke-dashoffset animation) over 400ms. Green particle burst radiates from the checkmark over 600ms. Both wrapped in `@media (prefers-reduced-motion: no-preference)` — static fallback for reduced motion users.
- **Skeleton shimmer:** Horizontal shimmer gradient traverses the placeholder from left to right over 1.5s, looping.
- **Milestone celebration (Phase 3):** Full-screen confetti burst + bold overlay message ("You've invoiced ₪100K! 🎉"), 2s, dismissible by tap.

**Hover States (desktop):**
- Cards and list rows: `border-color` shifts to `--color-border-focus` (green tint), `background` lightens one step. 150ms transition.
- Buttons (primary): `filter: brightness(1.1)` on hover, scale(1.02) on active. 100ms.
- Navigation links: Left border accent appears (`border-left: 2px solid --color-accent-primary`) for sidebar; bottom border for tab-style nav.
- Icon buttons: Background circle appears (36px, `--color-bg-elevated`), 150ms.

---

### 5.2 Feedback Mechanisms

**Loading States:**
- **Initial dashboard/list load:** Skeleton screens for all content areas. Metric card skeletons match card shape; list row skeletons match row height. Shown immediately on mount, replaced with real data when API responds.
- **Button submission loading:** Primary button transitions to a loading state: text hidden, circular spinner (16px, white) centered in the button. Button remains full-width, remains disabled. Prevents double-submission.
- **Pull-to-refresh (mobile):** Standard pull-to-refresh pattern with a spinner at the top of the list. Fires a fresh API fetch.
- **Inline data refresh (filter changes):** Previous list content fades to 40% opacity while new data loads (200ms), then snaps to full opacity when data arrives. Avoids full skeleton re-render for filter interactions.

**Success States:**
- **Invoice Created:** Full-screen Success Screen (Page 6) — most prominent feedback in the app, befitting the primary user action.
- **Client Saved:** Toast notification slides in from the bottom: "✓ Client saved." with the client's name. 3s auto-dismiss, tap to dismiss early. Green accent background.
- **Client Updated:** Same toast pattern: "✓ [Name] updated."
- **Client Deleted:** Toast: "Client deleted." with an "Undo" action (5s window before finalization, if API supports).

**Error States:**
- **Form validation errors (client-side):** Inline error message appears directly below the offending field on blur (not on every keystroke). Field border turns red. Error text is plain language, no jargon (e.g., "Please enter a valid email address" not "Invalid format").
- **Form validation on submit:** If the user tries to submit with empty required fields, all error messages appear simultaneously, and the page scrolls to the first error. A summary error banner at the top of the form: "Please fix the errors below before sending."
- **API error on invoice submission:** Error banner at the top of the Invoice Creation form: human-readable message (e.g., "We couldn't submit your invoice. Check your connection and try again."). Form data fully preserved. "Try Again" button offered. The form does not reset or navigate away.
- **API error on data load (history/dashboard):** In-place error state within the content area: a brief error message + "Retry" button. No full-page error screen. Other parts of the UI remain functional.
- **Session expiry:** If an API call returns 401, a toast appears ("Your session expired. Please log in again.") and the user is redirected to Login after 1.5s. Any form data in progress is lost (this is an edge case; session persistence per FR-AUTH-02 minimizes frequency).
- **Network offline:** A persistent banner at the top of the app appears when the browser goes offline: "No internet connection." It auto-dismisses when connectivity is restored.
- **Unsaved changes warning:** Before navigating away from a partially filled Invoice Creation form, a browser-native `beforeunload` dialog (or custom modal on in-app navigation): "Discard invoice? Your changes will be lost." with "Discard" (destructive) and "Keep Editing" (default/cancel).

**Empty States:**
All empty states replace a blank screen with an illustration, a brief explanation, and a single clear CTA:
- **Dashboard (no invoices):** "No invoices yet. Create your first one in 60 seconds." → "Create Invoice" (primary button)
- **Invoice History (no invoices):** "Your invoice history will appear here." → "Create Invoice"
- **Invoice History (no filter results):** "No invoices match your current filters." → "Clear Filters" (ghost button)
- **Client List (no clients):** "Save a client once, select them in seconds on every future invoice." → "Add Your First Client" (primary button)

---

### 5.3 Navigation Patterns

**Mobile — Bottom Navigation Bar:**
Fixed at the bottom, always visible, 56px height + safe-area inset. Four primary destinations:
1. 🏠 **Home** — Dashboard
2. 📄 **Invoices** — Invoice History
3. **＋** — Invoice Creation (center, slightly elevated FAB-style button, accent green)
4. 👥 **Clients** — Client List

The "＋" center button is the primary action shortcut and is visually emphasized (green background, larger touch target: 52×52px). Active tab indicated by accent color on icon + label.

**Desktop — Left Sidebar:**
Fixed left sidebar, 220px wide. Logo/wordmark at top. Navigation links with icon + label. Active state: accent left border + background highlight. "＋ New Invoice" as a button at the bottom of the sidebar. Collapsible to 64px (icon-only) for more content space.

**Back Navigation:**
- Always a "← [Parent Screen Name]" text link in the top-left of any drill-down screen.
- Browser back button is also functional and produces identical behavior.
- Filters and scroll position in list views are preserved when returning from detail views (via router state or in-memory cache).

**Breadcrumbs:**
Not used on mobile (too small, redundant with back button). On desktop, a simple inline breadcrumb in the page header for drill-down contexts: `Invoices › Invoice #1042`.

**Tabs:**
Not used as primary navigation. Used within screens where appropriate (e.g., if a future Client detail screen has an "Info" tab and "Invoice History" tab). Tab style: underline-only, not pill/box.

**Steppers:**
Not used for Phase 1 (Invoice Creation is a single long-scroll form, not a multi-step wizard). Phase 2 confirmation modal introduces a lightweight 2-step implied flow (Create → Review → Send), communicated by the modal overlay rather than an explicit stepper component. This keeps the flow fast for Yael while adding accuracy for Amir.

**Scroll Behavior:**
- Smooth scrolling (`scroll-behavior: smooth`) globally.
- Long pages (Invoice Creation with many line items) scroll freely; only the totals panel + CTA are sticky.
- Invoice History and Client List use either pagination (25 items/page with "Load More" button) or virtual scrolling to handle 500+ items without DOM performance degradation. Pagination preferred for mobile (predictable scroll position); virtual scroll preferred for desktop.

**Keyboard Navigation (Desktop, Phase 1):**
- All interactive elements are in the natural tab order.
- Modals trap focus within themselves when open.
- Escape key closes modals and dropdowns.
- Enter key submits forms (when focused within a form).
- Phase 3: Global keyboard shortcuts (e.g., `N` for New Invoice, `C` for Clients).

**Filter State Persistence:**
Filter selections (status, client, period) in Invoice History are preserved during the session — navigating to Invoice Detail and back returns the user to the same filtered list. This directly addresses Noa's use case of narrowing down to "Unpaid" and then reviewing individual invoices one by one without losing context.

---

*Document prepared by the OFFICE UX/Design Agent. Ready for engineering implementation and quest planning.*


## Product Requirements Document
# Yoavchu's Invoices — Product Requirements Document (PRD)

**Version:** 1.0 | **Status:** Draft | **Date:** 2025-06-30
**Author:** OFFICE PM Agent
**Based on:** Project Brief v1.0 + Product Strategy v1.0

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [User Personas Reference](#4-user-personas-reference)
5. [User Stories & Acceptance Criteria](#5-user-stories--acceptance-criteria)
6. [Feature Specifications](#6-feature-specifications)
7. [Success Metrics](#7-success-metrics)
8. [Out of Scope](#8-out-of-scope)

---

## 1. Product Overview

### 1.1 Purpose

Yoavchu's Invoices is a mobile-first, dark-theme invoicing webapp that serves as a beautifully designed front-end for the invoice4u API. It replaces invoice4u's dated default UI with a fast, delightful, and intuitive experience purpose-built for solo freelancers who invoice on a weekly-to-monthly cadence.

### 1.2 Core Value Proposition

> **Turn the chore of invoicing into the highlight of your workday.**
> Create an invoice in under 60 seconds. Know exactly who owes you money and how much you've earned — all without touching invoice4u's default UI.

### 1.3 API Dependency

All data operations (invoice creation, invoice retrieval, client management) are executed exclusively through the **invoice4u API** (`https://invoice4uapi.docs.apiary.io/#`). This product is a pure front-end; it does not maintain its own database of financial documents.

### 1.4 Phased Delivery

| Phase | Scope | Priority Level |
|---|---|---|
| **Phase 1 — MVP** | Invoice Creation, Client Management, Invoice History, Paid/Unpaid Status, Dark UI, Mobile Layout, Basic Dashboard | Must-Have |
| **Phase 2 — Growth** | Client/Period Filtering, Data Visualizations, Invoice Duplication, Overdue Highlighting, Send Confirmation | Should-Have |
| **Phase 3 — Delight** | Animations, PDF Preview, Milestones, Theme Toggle, Keyboard Shortcuts, CSV Export | Nice-to-Have |

---

## 2. Functional Requirements

### 2.1 Authentication & Session

| ID | Requirement |
|---|---|
| FR-AUTH-01 | The system must authenticate users against the invoice4u API using valid credentials (API token or user login as supported by the API). |
| FR-AUTH-02 | The system must persist an authenticated session across page reloads without requiring re-login (token storage in localStorage or equivalent). |
| FR-AUTH-03 | The system must gracefully handle expired or invalid tokens by prompting re-authentication without data loss. |
| FR-AUTH-04 | The system must provide a logout mechanism that clears all stored session data. |

### 2.2 Invoice Creation

| ID | Requirement |
|---|---|
| FR-INV-01 | The system must allow a user to create a new invoice via the invoice4u API, supplying at minimum: client, line items (description + quantity + unit price), and issue date. |
| FR-INV-02 | The system must support selecting a saved client from a dropdown/autocomplete to pre-fill all client fields. |
| FR-INV-03 | The system must support adding multiple line items to a single invoice. |
| FR-INV-04 | The system must automatically calculate and display the invoice subtotal, applicable tax, and grand total in real time as line items are entered. |
| FR-INV-05 | The system must submit the completed invoice to the invoice4u API and surface any API-level validation errors clearly to the user. |
| FR-INV-06 | The system must confirm successful invoice creation with a visual confirmation state (animation or success screen). |
| FR-INV-07 | The entire invoice creation flow — from landing on the creation screen to submitting — must be completable in under 60 seconds for a returning user with saved clients. |

### 2.3 Client Management

| ID | Requirement |
|---|---|
| FR-CLI-01 | The system must allow users to create a new saved client with relevant fields (name, business name, email, address, tax ID as supported by the invoice4u API). |
| FR-CLI-02 | The system must display a list of all saved clients. |
| FR-CLI-03 | The system must allow users to edit an existing saved client's details. |
| FR-CLI-04 | The system must allow users to delete a saved client, with a confirmation prompt to prevent accidental deletion. |
| FR-CLI-05 | Saved clients must be immediately available for selection during invoice creation. |

### 2.4 Invoice History

| ID | Requirement |
|---|---|
| FR-HIS-01 | The system must fetch and display a list of all invoices from the invoice4u API, sorted by creation date descending by default. |
| FR-HIS-02 | Each invoice list item must display: invoice number, client name, issue date, total amount, and paid/unpaid status. |
| FR-HIS-03 | The system must allow users to tap/click an invoice to view its full details. |
| FR-HIS-04 | The system must support filtering the invoice list by paid/unpaid status. |
| FR-HIS-05 | The system must support filtering the invoice list by client. |
| FR-HIS-06 | The system must support filtering the invoice list by time period (current month, last month, last 3 months, last 12 months, custom range). |

### 2.5 Dashboard

| ID | Requirement |
|---|---|
| FR-DASH-01 | The dashboard must display total revenue earned (sum of all paid invoices) for the selected time period. |
| FR-DASH-02 | The dashboard must display the total outstanding balance (sum of all unpaid invoices). |
| FR-DASH-03 | The dashboard must display a list of the most recent invoices (minimum 5) with status indicators. |
| FR-DASH-04 | The dashboard must display the number of overdue invoices (past due date and unpaid). |
| FR-DASH-05 | The dashboard must support filtering all metrics by time period (this month, last month, last quarter, last year). |
| FR-DASH-06 | The dashboard must support filtering all metrics by client. |
| FR-DASH-07 | The dashboard must display a revenue trend chart (bar or line) showing earnings over time (Phase 2). |

### 2.6 Invoice Duplication (Phase 2)

| ID | Requirement |
|---|---|
| FR-DUP-01 | The system must allow users to duplicate any existing invoice, pre-filling the creation form with the original invoice's client and line items. |
| FR-DUP-02 | The duplicated invoice must default to today's date and leave the user able to edit all fields before submission. |

### 2.7 Send Confirmation Flow (Phase 2)

| ID | Requirement |
|---|---|
| FR-CONF-01 | Before final invoice submission, the system must display a summary confirmation modal/screen showing all invoice details. |
| FR-CONF-02 | The user must take an explicit confirmation action (e.g., "Send Invoice" button) from the summary screen to trigger the API call. |
| FR-CONF-03 | The user must be able to return from the confirmation screen to edit the invoice without data loss. |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement |
|---|---|
| NFR-PERF-01 | Initial page load (Time to Interactive) must be **≤ 3 seconds** on a standard 4G mobile connection. |
| NFR-PERF-02 | Invoice creation form must be fully interactive within **≤ 1 second** of navigation. |
| NFR-PERF-03 | Invoice list and dashboard data must render within **≤ 2 seconds** of page load (API response permitting). |
| NFR-PERF-04 | Real-time invoice total calculation must update with **≤ 100ms latency** after user input. |
| NFR-PERF-05 | The end-to-end invoice creation flow (user action → API submission → success confirmation) must complete in **≤ 60 seconds** for a user with saved clients. |

### 3.2 Responsiveness & Compatibility

| ID | Requirement |
|---|---|
| NFR-RESP-01 | The application must be **mobile-first** and fully functional at viewport widths from 320px to 2560px+. |
| NFR-RESP-02 | All interactive elements (buttons, inputs, cards) must meet a minimum touch target size of **44×44px** on mobile. |
| NFR-RESP-03 | The application must render correctly and be fully usable on the latest two major versions of Chrome, Safari, Firefox, and Edge. |
| NFR-RESP-04 | The application must be fully functional on iOS Safari (iPhone) and Chrome for Android without native app installation. |

### 3.3 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | All communication with the invoice4u API must occur over **HTTPS/TLS**. |
| NFR-SEC-02 | API tokens/credentials must never be exposed in client-side JavaScript source or URLs. |
| NFR-SEC-03 | The application must not store sensitive financial data (invoice amounts, client tax IDs) in browser storage beyond what is required for session continuity. |
| NFR-SEC-04 | Logout must fully clear all tokens and cached user data from the browser. |

### 3.4 Reliability & Error Handling

| ID | Requirement |
|---|---|
| NFR-REL-01 | All API calls must implement error handling; network failures or API errors must surface a clear, human-readable message — never a raw error code. |
| NFR-REL-02 | Failed invoice submissions must preserve all entered form data so users can retry without re-entering information. |
| NFR-REL-03 | The dashboard and invoice list must handle empty states gracefully (zero invoices, zero clients) with guiding UI rather than blank screens. |
| NFR-REL-04 | The application must implement loading states (skeleton screens or spinners) for all async data fetches to prevent perceived freezes. |

### 3.5 Accessibility

| ID | Requirement |
|---|---|
| NFR-A11Y-01 | The application must meet **WCAG 2.1 AA** standards for color contrast, particularly within the dark theme. |
| NFR-A11Y-02 | All form inputs must have visible labels and descriptive placeholder text. |
| NFR-A11Y-03 | The application must be navigable by keyboard for all critical flows (create invoice, view history, navigate dashboard). |

### 3.6 Scalability

| ID | Requirement |
|---|---|
| NFR-SCALE-01 | The invoice history view must handle rendering lists of **500+ invoices** without performance degradation (implement pagination or virtual scrolling). |
| NFR-SCALE-02 | The client list must handle **100+ saved clients** with a functional search/filter mechanism. |

---

## 4. User Personas Reference

| Persona | Description | Primary Use Case | Critical Feature |
|---|---|---|---|
| **Yael** (29, Designer, Tel Aviv) | 8–12 invoices/month, high design sensitivity, invoices from iPhone | Fast mobile invoice creation; premium aesthetic | Saved clients + mobile-first UX |
| **Amir** (35, Developer, Haifa) | 2–4 invoices/month, reliability-focused, client-profitability tracking | Accurate invoice creation; per-client revenue analysis | Client-filtered dashboard |
| **Noa** (42, Translator, Jerusalem) | 4–8 invoices/month, medium tech comfort, tax-prep aware | Guided form flow; paid/unpaid tracking for follow-up | Paid/unpaid status + period filtering |

---

## 5. User Stories & Acceptance Criteria

### Epic 1: Authentication

---

**US-01 — Log in to the application**
> As a **solo freelancer**, I want to log in with my invoice4u credentials, so that I can access my invoices and financial data securely.

**Acceptance Criteria:**
- [ ] A login screen is displayed on first visit or after session expiry.
- [ ] The user can enter their invoice4u API credentials and submit the form.
- [ ] On successful authentication, the user is redirected to the dashboard.
- [ ] On failed authentication, a clear, non-technical error message is displayed (e.g., "Incorrect email or password. Please try again.").
- [ ] The user remains logged in across page refreshes for the duration of a valid token.
- [ ] A "Log Out" option is accessible from the main navigation.

---

**US-02 — Log out of the application**
> As a **solo freelancer**, I want to log out of the app, so that my financial data is not accessible to others on a shared device.

**Acceptance Criteria:**
- [ ] Tapping "Log Out" immediately clears all session tokens and cached user data.
- [ ] The user is redirected to the login screen after logout.
- [ ] Navigating back (browser back button) after logout does not expose authenticated content.

---

### Epic 2: Invoice Creation

---

**US-03 — Create an invoice with a saved client**
> As **Yael**, I want to create an invoice by selecting a saved client, so that I don't have to re-enter their details every time.

**Acceptance Criteria:**
- [ ] The invoice creation screen includes a client selector field (dropdown or autocomplete).
- [ ] Selecting a saved client auto-fills all relevant client fields on the form.
- [ ] The user can add at least one line item (description, quantity, unit price).
- [ ] The system calculates and displays subtotal, tax, and total in real time.
- [ ] Submitting the form calls the invoice4u API and creates the invoice.
- [ ] On success, a confirmation screen or animation is shown.
- [ ] The entire flow (select client → add line item → submit) is completable in ≤ 60 seconds.

---

**US-04 — Create an invoice with a new (unsaved) client**
> As a **solo freelancer**, I want to create an invoice for a one-time or new client without saving them, so that I can invoice flexibly without cluttering my client list.

**Acceptance Criteria:**
- [ ] The user can toggle or navigate to a "New Client" form within the invoice creation flow.
- [ ] All required client fields per the invoice4u API are available for entry.
- [ ] The invoice is created successfully for the new client without requiring a save-client step.
- [ ] Optionally, the user is prompted (not forced) to save the new client after invoice creation.

---

**US-05 — Add multiple line items to an invoice**
> As **Amir**, I want to add multiple line items to one invoice, so that I can itemize different services or milestones in a single document.

**Acceptance Criteria:**
- [ ] An "Add Line Item" button/action is available on the invoice creation form.
- [ ] Each line item has fields for: description, quantity, and unit price.
- [ ] Each line item's row total (quantity × unit price) is calculated and displayed inline.
- [ ] Individual line items can be removed via a delete/remove action on each row.
- [ ] The invoice grand total updates immediately when any line item value changes.
- [ ] The form supports at minimum 10 line items without layout degradation.

---

**US-06 — See real-time invoice total during creation**
> As **Noa**, I want to see the invoice total update as I enter line items, so that I can confirm the amount is correct before sending.

**Acceptance Criteria:**
- [ ] The total amount section is always visible (sticky or clearly positioned) during line item entry.
- [ ] Subtotal, tax amount, and grand total update within 100ms of any input change.
- [ ] If tax rate changes or multiple line items are present, all totals recalculate correctly.
- [ ] The total section clearly labels each component (Subtotal / Tax / Total).

---

**US-07 — Receive confirmation after sending an invoice**
> As **Yael**, I want a satisfying confirmation when my invoice is sent, so that I feel confident it was delivered and I can move on with my day.

**Acceptance Criteria:**
- [ ] On successful API submission, a visually distinct success state is shown (not just a silent redirect).
- [ ] The confirmation displays the invoice number, client name, and total amount.
- [ ] A clear next-action path is offered (e.g., "Create Another Invoice" / "Back to Dashboard").
- [ ] (Phase 3) A micro-animation plays on the success screen.

---

### Epic 3: Client Management

---

**US-08 — Save a new client**
> As a **solo freelancer**, I want to save a client's details once, so that future invoices to them can be created in seconds.

**Acceptance Criteria:**
- [ ] A "Clients" section is accessible from the main navigation.
- [ ] A "New Client" form collects all fields required by the invoice4u API (name, email, address, tax ID, etc.).
- [ ] All required fields are validated before submission; errors are shown inline next to the relevant field.
- [ ] On successful save, the client appears immediately in the client list and invoice creation selector.

---

**US-09 — Edit a saved client**
> As a **solo freelancer**, I want to edit a client's details, so that I can keep information current when a client's address or contact details change.

**Acceptance Criteria:**
- [ ] Each client in the client list has an accessible "Edit" action.
- [ ] The edit form pre-fills with all existing client data.
- [ ] Changes are saved via the invoice4u API and reflected immediately in the list.
- [ ] Cancelling edit discards all changes and returns to the client list without modification.

---

**US-10 — Delete a saved client**
> As a **solo freelancer**, I want to delete a client I no longer work with, so that my client list stays clean and manageable.

**Acceptance Criteria:**
- [ ] Each client has an accessible "Delete" action.
- [ ] A confirmation prompt ("Are you sure you want to delete [Client Name]?") is shown before deletion.
- [ ] Confirming deletion removes the client from the list.
- [ ] Cancelling the confirmation takes no action.
- [ ] A deleted client no longer appears in the invoice creation selector.

---

### Epic 4: Invoice History

---

**US-11 — View all past invoices**
> As **Noa**, I want to see a list of all my past invoices, so that I can track what I've sent and review historical work.

**Acceptance Criteria:**
- [ ] An "Invoices" or "History" section lists all invoices fetched from the invoice4u API.
- [ ] Invoices are sorted by date, most recent first by default.
- [ ] Each list item shows: invoice number, client name, date, total, and paid/unpaid status.
- [ ] Paid invoices are visually distinguished from unpaid ones (color badge or icon).
- [ ] An empty state message is shown when no invoices exist.
- [ ] Lists with 500+ invoices remain performant via pagination or virtual scroll.

---

**US-12 — Filter invoices by payment status**
> As **Noa**, I want to filter my invoices by paid/unpaid status, so that I can quickly identify which clients still owe me money.

**Acceptance Criteria:**
- [ ] A status filter (All / Paid / Unpaid) is accessible on the invoice history view.
- [ ] Selecting "Unpaid" shows only invoices without a payment confirmation.
- [ ] Selecting "Paid" shows only invoices marked as paid.
- [ ] Filter state is maintained during the session (not reset on page navigation).
- [ ] Filter can be cleared to return to the full "All" view.

---

**US-13 — Filter invoices by client**
> As **Amir**, I want to filter invoices by client, so that I can review the full billing history for a specific engagement.

**Acceptance Criteria:**
- [ ] A client filter (dropdown or search) is available on the invoice history view.
- [ ] Selecting a client shows only invoices associated with that client.
- [ ] Client filter works in combination with the status filter (e.g., Unpaid + specific client).
- [ ] Clearing the client filter returns to the unfiltered list.

---

**US-14 — Filter invoices by time period**
> As **Noa**, I want to filter my invoice history by time period (e.g., this year), so that I can prepare for taxes without manually sorting through everything.

**Acceptance Criteria:**
- [ ] A time-period filter is available: This Month / Last Month / Last 3 Months / Last 12 Months / Custom Range.
- [ ] Custom range allows the user to select a start date and end date.
- [ ] The filtered list only shows invoices with an issue date within the selected range.
- [ ] Time-period filter composes with status and client filters.

---

**US-15 — View full invoice details**
> As a **solo freelancer**, I want to tap on an invoice to see its full details, so that I can review exactly what was billed.

**Acceptance Criteria:**
- [ ] Tapping/clicking an invoice in the list navigates to or expands a detail view.
- [ ] The detail view shows: invoice number, client details, all line items, issue date, due date, and total.
- [ ] A "Back" action returns the user to the invoice list with filters preserved.

---

### Epic 5: Dashboard

---

**US-16 — See my revenue at a glance**
> As **Yael**, I want to open the app and immediately see how much I've earned this month, so that I have an instant pulse on my business without any digging.

**Acceptance Criteria:**
- [ ] The dashboard is the default landing screen after login.
- [ ] A prominent metric card shows total paid revenue for the current month.
- [ ] A metric card shows the total outstanding (unpaid) balance.
- [ ] A metric card or indicator shows the number of overdue invoices.
- [ ] All three metrics are visible above the fold on a standard mobile screen (375px width).
- [ ] Data loads within 2 seconds of the dashboard rendering.

---

**US-17 — Filter dashboard by time period**
> As **Amir**, I want to switch the dashboard view between this month, last quarter, and this year, so that I can understand my revenue across different timeframes.

**Acceptance Criteria:**
- [ ] A time-period selector is available on the dashboard (e.g., segmented control or dropdown).
- [ ] Changing the period recalculates all dashboard metrics for the selected timeframe.
- [ ] The selected period is clearly labeled so the user knows what they're looking at.
- [ ] Period options include: This Month, Last Month, Last 3 Months, Last 12 Months.

---

**US-18 — Filter dashboard by client**
> As **Amir**, I want to filter the dashboard by a specific client, so that I can evaluate how much revenue that client represents before renegotiating rates.

**Acceptance Criteria:**
- [ ] A client filter is available on the dashboard.
- [ ] When a client is selected, all metrics (revenue, outstanding, recent invoices) reflect only that client's data.
- [ ] The filter is clearly labeled with the selected client's name.
- [ ] Client filter composes with the time-period filter.
- [ ] Clearing the client filter returns to the full dashboard view.

---

**US-19 — See a revenue trend chart (Phase 2)**
> As **Amir**, I want to see a chart of my monthly revenue over time, so that I can identify growth trends and slow periods without exporting data.

**Acceptance Criteria:**
- [ ] A bar or line chart displays monthly revenue for the trailing 12 months.
- [ ] The chart is rendered using a premium visualization library consistent with the dark theme.
- [ ] Each bar/point is tappable/hoverable to show the exact revenue for that month.
- [ ] The chart reacts to the active client filter (shows per-client trend if a client is selected).
- [ ] The chart handles months with zero revenue gracefully (zero-height bar or gap).

---

### Epic 6: Invoice Duplication (Phase 2)

---

**US-20 — Duplicate an existing invoice**
> As **Yael**, I want to duplicate a past invoice for the same client, so that recurring invoices take 10 seconds instead of 60.

**Acceptance Criteria:**
- [ ] A "Duplicate" action is available on each invoice detail view and/or invoice list item.
- [ ] Tapping "Duplicate" opens the invoice creation form pre-filled with the original invoice's client and all line items.
- [ ] The date defaults to today; no other field defaults to the original's date.
- [ ] The user can freely edit any field before submitting.
- [ ] The duplicated invoice is a new document — the original is not modified.

---

### Epic 7: Phase 3 Delight Features

---

**US-21 — Animated send confirmation (Phase 3)**
> As **Yael**, I want a satisfying animation when I send an invoice, so that the experience feels premium and rewarding.

**Acceptance Criteria:**
- [ ] A micro-animation plays on the invoice send success screen.
- [ ] The animation completes within 2 seconds and does not block next actions.
- [ ] The animation respects `prefers-reduced-motion` system setting (static fallback provided).

---

**US-22 — Preview invoice PDF before sending (Phase 3)**
> As **Amir**, I want to preview the generated PDF before sending, so that I can confirm it looks correct and professional.

**Acceptance Criteria:**
- [ ] A "Preview" action is available in the invoice creation flow (before submission).
- [ ] The preview renders the invoice as it will appear to the recipient (PDF format or high-fidelity render).
- [ ] The user can navigate back from the preview to edit the invoice.
- [ ] Preview is non-blocking — the user is not forced to preview before sending.

---

**US-23 — Export invoice data to CSV (Phase 3)**
> As **Noa**, I want to export my invoice history to a CSV file, so that I can give it to my accountant at tax time.

**Acceptance Criteria:**
- [ ] An "Export" action is available on the invoice history view.
- [ ] The export respects any active filters (period, client, status) — exports exactly what the user sees.
- [ ] The downloaded file is a valid `.csv` with column headers: Invoice #, Client, Date, Amount, Status.
- [ ] The export works on both desktop and mobile (triggers a download or share sheet).

---

## 6. Feature Specifications

### 6.1 Invoice Creation Flow

**Priority:** Must-Have (Phase 1)

**User Flow:**
1. User taps "New Invoice" from the dashboard or navigation.
2. Invoice creation screen loads with a client selector at the top.
3. User selects a saved client from dropdown (autocomplete filters by name as typed) OR taps "New Client" to enter manually.
4. Client fields auto-fill (if saved client selected). User confirms or adjusts.
5. User taps "Add Line Item" — a row appears with fields: Description, Qty, Unit Price.
6. User fills in line item details; row total and invoice total update in real time.
7. User adds additional line items as needed via "Add Line Item".
8. User reviews the calculated totals (Subtotal / Tax / Total) in the summary section.
9. (Phase 2) User taps "Review" to see the Send Confirmation modal/screen.
10. User taps "Send Invoice" — API call is made.
11. Loading state (spinner/skeleton) is displayed.
12. On success: animated confirmation screen with invoice number, client, and total.
13. On failure: inline error message preserving all form data; retry option offered.

**Edge Cases & Error Handling:**
- **No saved clients:** Client selector shows an empty state with a prominent "Save your first client" CTA. Invoice creation still possible by entering client details inline.
- **API validation error on submit:** Map invoice4u API error codes to human-readable messages. Display them at the top of the form and highlight affected fields.
- **Network timeout:** Show a "Connection lost" error. Do not re-submit automatically (prevent duplicate invoices). Prompt user to retry explicitly.
- **Accidental navigation away:** Show an unsaved changes warning if the user attempts to leave with a partially filled form.
- **Zero-value line item:** Validate that quantity and unit price are > 0 before allowing submission. Show inline validation errors.
- **Duplicate invoice number:** If invoice4u returns a duplicate number error, surface it clearly and suggest the user check recent invoices.

---

### 6.2 Saved Client Management

**Priority:** Must-Have (Phase 1)

**User Flow (Create):**
1. User navigates to "Clients" from the main navigation.
2. Taps "Add New Client."
3. Form fields render: Full Name, Business Name, Email, Phone, Address, Tax ID (fields per invoice4u API schema).
4. User fills in required fields; inline validation shows errors on blur.
5. User taps "Save Client."
6. API call creates the client. On success, the client appears at the top of the client list.

**User Flow (Edit):**
1. User taps a client in the client list to open their detail card.
2. Taps "Edit."
3. Pre-filled form renders with existing data.
4. User modifies fields and taps "Save Changes."
5. Updated data reflects immediately in the list and in the invoice creation selector.

**User Flow (Delete):**
1. User taps a client → taps "Delete."
2. Confirmation dialog: "Delete [Client Name]? This cannot be undone."
3. User confirms → client removed from list and selector.

**Edge Cases & Error Handling:**
- **Duplicate client:** If the invoice4u API returns a duplicate-client error, surface it and suggest finding the existing client.
- **Client with existing invoices deleted:** The delete action only removes the client record. Existing invoices remain in history and remain accessible; they display the client name as a static string rather than a linked record.
- **Empty client list:** Show an empty state illustration with "No clients yet. Add your first client to speed up invoicing."
- **Long client names:** Truncate in list view with ellipsis; show full name in detail/edit views.

---

### 6.3 Invoice History View

**Priority:** Must-Have (Phase 1)

**User Flow:**
1. User navigates to "Invoices" or "History" from the main navigation.
2. List renders with most recent invoices first; each row shows: invoice #, client name, date, total, status badge (Paid / Unpaid / Overdue).
3. User can apply filters (status, client, time period) via filter controls at the top of the list.
4. Filtered list updates immediately (no page reload).
5. User taps an invoice row → full detail view expands or navigates.
6. From detail view, user can: (Phase 2) Duplicate the invoice; navigate back to the list.

**Edge Cases & Error Handling:**
- **Large invoice lists (500+):** Implement pagination (e.g., 25 per page) or infinite scroll. Clearly indicate total count and current page.
- **API load failure:** Show a "Could not load invoices" error with a "Retry" button. Do not show stale data without a stale-data indicator.
- **No results after filtering:** Show "No invoices match your filters" with a "Clear Filters" CTA.
- **Invoice status sync:** Status (paid/unpaid) comes from the invoice4u API. If status changes externally (payment recorded in invoice4u), the next data refresh should reflect it. A manual "Refresh" affordance is acceptable.

---

### 6.4 Dashboard

**Priority:** Must-Have — Core KPIs; Should-Have — Charts (Phase 2)

**User Flow:**
1. User logs in; dashboard is the default screen.
2. Three metric cards render above the fold: Total Earned (selected period), Outstanding Balance, Overdue Count.
3. A time-period selector (chips: This Month / Last Month / Last Quarter / Last Year) filters all metrics.
4. A client filter (optional) further scopes metrics to one client.
5. Below the metric cards: a "Recent Invoices" list showing the latest 5–10 invoices with status badges.
6. (Phase 2) Below recent invoices: a Revenue Trend chart (bar, trailing 12 months).
7. Tapping any recent invoice navigates to its detail view.
8. Tapping an outstanding balance metric navigates to the invoice history pre-filtered to "Unpaid."

**Edge Cases & Error Handling:**
- **First-time user with zero invoices:** Show a welcoming empty state: "No invoices yet. Create your first one in 60 seconds." with a prominent "Create Invoice" CTA.
- **All invoices paid (zero outstanding):** Outstanding balance card shows ₪0 with a positive indicator (e.g., green checkmark). Do not omit the card.
- **Dashboard data stale:** Show last-refreshed timestamp. Auto-refresh on tab focus. Manual pull-to-refresh on mobile.
- **Long loading time:** Skeleton screen placeholders for metric cards and list to prevent perceived blank screen.

---

### 6.5 Dark Theme UI System

**Priority:** Must-Have (Phase 1)

**User Flow:**
- The dark theme is the default and primary theme. No user action is required to activate it.
- (Phase 3) A dark/light toggle may be provided in Settings.

**Visual Specification:**
- **Background:** Deep near-black (e.g., `#0D0F12` or similar)
- **Card surfaces:** Slightly elevated dark (e.g., `#161A1F`)
- **Accent colors:** Vibrant green-scale spectrum — greens, teals, yellow-greens
- **Typography:** Clean modern sans-serif (e.g., Inter, DM Sans, or equivalent)
- **Status colors:** Paid = green accent; Unpaid = muted/neutral; Overdue = amber/red
- **Spacing:** Generous padding; 16px minimum card padding on mobile
- **Border radius:** Rounded corners on cards (e.g., 12–16px)

**Edge Cases & Error Handling:**
- **WCAG AA contrast compliance:** All text must meet 4.5:1 contrast ratio against backgrounds on the dark theme.
- **Images/logos in dark mode:** Ensure any client-uploaded assets (if applicable) are rendered with appropriate background treatment.

---

### 6.6 Invoice Duplication (Phase 2)

**Priority:** Should-Have (Phase 2)

**User Flow:**
1. User views an existing invoice in the detail view.
2. Taps "Duplicate Invoice."
3. Invoice creation form opens pre-filled: same client, same line items, today's date.
4. User reviews and adjusts as needed.
5. User submits — a new, distinct invoice is created in the invoice4u API.

**Edge Cases & Error Handling:**
- **Original client deleted:** If the client referenced in the duplicated invoice no longer exists in saved clients, the client fields pre-fill as editable text (not a selector reference) so the user can still proceed.
- **Line item schema changes:** If invoice4u API changes line item fields between the original invoice and duplication, handle missing fields gracefully with empty defaults rather than errors.

---

### 6.7 Send Confirmation Flow (Phase 2)

**Priority:** Should-Have (Phase 2)

**User Flow:**
1. User completes the invoice creation form and taps "Review."
2. A confirmation modal/screen renders a read-only summary: client name, all line items with totals, issue date, and grand total.
3. User reviews for accuracy.
4. User taps "Confirm & Send" → API submission proceeds.
5. User taps "Edit" or "Back" → returns to creation form with all data intact.

**Edge Cases & Error Handling:**
- **Back navigation:** All form state must be preserved on back navigation; no data loss.
- **Modal dismissed accidentally (tap outside):** Treat as "Edit" — return to form, do not submit.

---

## 7. Success Metrics

### 7.1 Invoice Creation

| Metric | Target | Measurement Method |
|---|---|---|
| **Time-to-Invoice (saved client)** | ≤ 60 seconds (median) | Timestamp: "New Invoice" tap → success confirmation screen |
| **Invoice creation success rate** | ≥ 95% of initiated flows | (Successful submissions / Initiated form opens) × 100 |
| **Form error rate** | ≤ 15% of submissions trigger validation errors | Count of submissions rejected by client-side validation |
| **API error rate on submission** | ≤ 2% | Count of invoice4u API errors on submit / total submissions |

### 7.2 Client Management

| Metric | Target | Measurement Method |
|---|---|---|
| **Client save success rate** | ≥ 98% | Successful saves / attempted saves |
| **Saved client usage rate** | ≥ 70% of invoices use a saved client | Invoices created with saved client / total invoices created |
| **Avg. clients saved per user** | ≥ 3 within first 2 weeks | Client count per user at 14-day mark |

### 7.3 Invoice History

| Metric | Target | Measurement Method |
|---|---|---|
| **Invoice list load time** | ≤ 2 seconds (p75) | Time from page navigation → list render complete |
| **Filter usage rate** | ≥ 40% of history view sessions use at least one filter | Sessions with filter interaction / total history sessions |
| **History view retention** | ≥ 60% of weekly active users visit History at least once/week | Weekly unique visits to history view / WAU |

### 7.4 Dashboard

| Metric | Target | Measurement Method |
|---|---|---|
| **Dashboard load time** | ≤ 2 seconds (p75) | Time from app open → dashboard fully rendered |
| **Dashboard as session entry point** | ≥ 80% of sessions start on dashboard | Sessions opening dashboard first / total sessions |
| **Period filter engagement** | ≥ 30% of dashboard sessions change time period | Sessions with period filter change / dashboard sessions |
| **Dashboard → Invoice creation** | ≥ 20% of dashboard sessions proceed to create invoice | Sessions with invoice creation initiated from dashboard / dashboard sessions |

### 7.5 Overall Product Health

| Metric | 30-Day Target | 60-Day Target | 90-Day Target |
|---|---|---|---|
| **Beta users onboarded** | 20 | 75 | 200 |
| **Total invoices created via app** | 50 | 300 | 1,000 |
| **Avg. time-to-invoice** | < 90s | < 75s | < 60s |
| **Weekly active user retention** | 60% | 65% | 70% |
| **NPS score** | > 40 | > 50 | > 60 |
| **Beta user completes first invoice without assistance** | > 80% | > 85% | > 90% |

### 7.6 Phase 2 Feature Metrics

| Feature | Success Metric | Target |
|---|---|---|
| **Invoice Duplication** | % of power users (3+ invoices/month) using duplication | ≥ 40% within 30 days of launch |
| **Revenue Trend Chart** | % of dashboard sessions that interact with the chart | ≥ 35% |
| **Time-Period Filtering** | % of sessions using period filter on dashboard or history | ≥ 40% |
| **Overdue Highlighting** | Avg. outstanding invoice age (days) — reduction from baseline | 10% reduction within 60 days |

---

## 8. Out of Scope

The following items are explicitly **not** in scope for any phase of this product:

| Item | Reason |
|---|---|
| **Invoice4u account registration** | Users must have an existing invoice4u account; this app is a front-end only. |
| **Payment processing / collection** | This product tracks invoice status; it does not process payments directly. |
| **Full accounting / bookkeeping** | Expense tracking, P&L reports, and accounting ledgers are outside the target scope. |
| **Multi-user / team accounts** | The product is built exclusively for solo freelancers. |
| **Native iOS/Android apps** | Phase 1–3 scope is web only (PWA-quality web experience). |
| **Custom invoice PDF branding** | Invoice PDF generation is handled by invoice4u's infrastructure. |
| **Email deliverability management** | Invoice sending is delegated to invoice4u. This app does not manage email infrastructure. |
| **Third-party integrations** (Slack, Zapier, etc.) | Out of scope for all current phases. |

---

*Document prepared by the OFFICE PM Agent. Ready for engineering review and quest planning.*



## Build Workflow

### Phase 1: Database & Models
- Set up the database schema, models, and migrations
- Create seed data if appropriate

### Phase 2: Backend API
- Implement all API routes and middleware
- Follow the API specification exactly
- Ensure all endpoints are functional

### Phase 3: Frontend UI
- Implement all pages and components
- Connect to the backend API
- Follow the design specification for layout and styling

### Phase 4: Integration & Testing
- Run the full build (fix any TypeScript/compilation errors)
- Write and run tests for critical paths
- Fix any failing tests

### Phase 5: Finalize
- Write a test/QA report to /home/user/workspace/qa-report.json in this JSON format:
```json
{
  "summary": "Overall assessment in 1-2 sentences",
  "bugs": [
    {
      "severity": "critical|major|minor",
      "file": "path/to/file.ts",
      "description": "What is wrong",
      "expected": "What should happen",
      "actual": "What actually happens"
    }
  ],
  "testResults": { "total": 0, "passing": 0, "failing": 0 },
  "recommendation": "pass|fix-required"
}
```
- Commit all changes: git add -A && git commit -m "feat: implement full application" && git push origin HEAD

IMPORTANT: You MUST write /home/user/workspace/qa-report.json AND push to git before finishing.

