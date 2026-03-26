import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config';
import * as schema from './schema';

let pool: Pool;
let db: ReturnType<typeof drizzle<typeof schema>>;

export function getDb() {
  if (!db) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    db = drizzle(pool, { schema });
  }
  return db;
}

export function getPool() {
  if (!pool) {
    getDb();
  }
  return pool;
}

export { schema };
