import type { Client } from '@yoavchu/shared';
import { getDb, schema } from '../db/index';
import { eq, and, like, sql } from 'drizzle-orm';

export class ClientCacheService {
  async syncClients(userId: string, clients: Client[]): Promise<void> {
    try {
      const db = getDb();
      for (const client of clients) {
        await db.insert(schema.clientCache).values({
          userId,
          invoice4uClientId: client.id,
          name: client.name,
          businessName: client.businessName || null,
          email: client.email || null,
          phone: client.phone || null,
          address: client.address || null,
          taxId: client.taxId || null,
          cachedAt: new Date(),
        }).onConflictDoUpdate({
          target: [schema.clientCache.userId, schema.clientCache.invoice4uClientId],
          set: {
            name: client.name,
            businessName: client.businessName || null,
            email: client.email || null,
            phone: client.phone || null,
            address: client.address || null,
            taxId: client.taxId || null,
            cachedAt: new Date(),
          },
        });
      }
    } catch (err) {
      // Cache sync failure should not break the main flow
      console.warn('Client cache sync failed:', err);
    }
  }

  async searchClients(userId: string, search?: string): Promise<Client[]> {
    try {
      const db = getDb();
      const conditions = [eq(schema.clientCache.userId, userId)];

      if (search) {
        conditions.push(
          sql`to_tsvector('simple', coalesce(${schema.clientCache.name}, '') || ' ' || coalesce(${schema.clientCache.businessName}, '')) @@ websearch_to_tsquery('simple', ${search})`
        );
      }

      const results = await db.select()
        .from(schema.clientCache)
        .where(and(...conditions))
        .orderBy(schema.clientCache.name)
        .limit(200);

      return results.map(row => ({
        id: row.invoice4uClientId,
        name: row.name,
        businessName: row.businessName || undefined,
        email: row.email || '',
        phone: row.phone || undefined,
        address: row.address || undefined,
        taxId: row.taxId || undefined,
      }));
    } catch (err) {
      console.warn('Client cache search failed:', err);
      return [];
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    try {
      const db = getDb();
      await db.delete(schema.clientCache).where(eq(schema.clientCache.userId, userId));
    } catch (err) {
      console.warn('Client cache invalidation failed:', err);
    }
  }
}
