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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const config_1 = require("./config");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const invoices_routes_1 = __importDefault(require("./routes/invoices.routes"));
const clients_routes_1 = __importDefault(require("./routes/clients.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const preferences_routes_1 = __importDefault(require("./routes/preferences.routes"));
exports.logger = (0, pino_1.default)({
    level: config_1.env.NODE_ENV === 'production' ? 'info' : (config_1.env.NODE_ENV === 'test' ? 'silent' : 'debug'),
    transport: (config_1.env.NODE_ENV !== 'production' && config_1.env.NODE_ENV !== 'test') ? {
        target: 'pino-pretty',
        options: { colorize: true },
    } : undefined,
});
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parsing
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// HTTP logging
if (config_1.env.NODE_ENV !== 'test') {
    app.use((0, pino_http_1.default)({ logger: exports.logger }));
}
// Session configuration
let sessionStore;
// Try to use pg session store if DB is available
async function setupSessionStore() {
    try {
        const connectPg = await Promise.resolve().then(() => __importStar(require('connect-pg-simple')));
        const pgSession = connectPg.default(express_session_1.default);
        const { getPool } = await Promise.resolve().then(() => __importStar(require('./db/index')));
        const pool = getPool();
        sessionStore = new pgSession({
            pool,
            createTableIfMissing: true,
        });
    }
    catch (err) {
        console.warn('Using in-memory session store (DB not available):', err instanceof Error ? err.message : err);
    }
}
// Session middleware
app.use((0, express_session_1.default)({
    secret: config_1.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        secure: config_1.env.NODE_ENV === 'production',
        sameSite: config_1.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
}));
// Rate limiting for all API routes
app.use('/api', rateLimit_middleware_1.generalRateLimit);
// Health check (no auth required)
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/invoices', invoices_routes_1.default);
app.use('/api/clients', clients_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/preferences', preferences_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found.',
        },
    });
});
// Error handler (must be last)
app.use(errorHandler_middleware_1.errorHandler);
const PORT = config_1.env.PORT;
async function start() {
    await setupSessionStore();
    app.listen(PORT, () => {
        exports.logger.info(`Backend server running on port ${PORT}`);
        exports.logger.info(`Environment: ${config_1.env.NODE_ENV}`);
        exports.logger.info(`Frontend URL: ${config_1.env.FRONTEND_URL}`);
    });
}
if (process.env.NODE_ENV !== 'test') {
    start().catch((err) => {
        exports.logger.error(err, 'Failed to start server');
        process.exit(1);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map