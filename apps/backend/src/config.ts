import { cleanEnv, str, port, url } from 'envalid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 3001 }),
  DATABASE_URL: str({ default: 'postgresql://user:password@localhost:5432/yoavchu_invoices' }),
  SESSION_SECRET: str({ default: 'dev-secret-key-at-least-32-chars-long-here' }),
  FRONTEND_URL: str({ default: 'http://localhost:5173' }),
  INVOICE4U_API_BASE_URL: str({ default: 'https://api.invoice4u.co.il' }),
  INVOICE4U_API_KEY: str({ default: 'dev-api-key' }),
});
