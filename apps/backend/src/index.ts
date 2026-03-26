import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from './config';
import { errorHandler } from './middleware/errorHandler.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';

import authRoutes from './routes/auth.routes';
import invoicesRoutes from './routes/invoices.routes';
import clientsRoutes from './routes/clients.routes';
import dashboardRoutes from './routes/dashboard.routes';
import preferencesRoutes from './routes/preferences.routes';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : (env.NODE_ENV === 'test' ? 'silent' : 'debug'),
  transport: (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test') ? {
    target: 'pino-pretty',
    options: { colorize: true },
  } : undefined,
});

const app = express();

// CORS configuration
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP logging
if (env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

// Session configuration
let sessionStore: session.Store | undefined;

// Try to use pg session store if DB is available
async function setupSessionStore() {
  try {
    const connectPg = await import('connect-pg-simple');
    const pgSession = connectPg.default(session);
    const { getPool } = await import('./db/index');
    const pool = getPool();
    sessionStore = new pgSession({
      pool,
      createTableIfMissing: true,
    });
  } catch (err) {
    console.warn('Using in-memory session store (DB not available):', err instanceof Error ? err.message : err);
  }
}

// Session middleware
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// Rate limiting for all API routes
app.use('/api', generalRateLimit);

// Health check (no auth required)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/preferences', preferencesRoutes);

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
app.use(errorHandler);

const PORT = env.PORT;

async function start() {
  await setupSessionStore();

  app.listen(PORT, () => {
    logger.info(`Backend server running on port ${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Frontend URL: ${env.FRONTEND_URL}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  });
}

export default app;
