"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientCacheService = void 0;
const index_1 = require("../db/index");
const drizzle_orm_1 = require("drizzle-orm");
class ClientCacheService {
    async syncClients(userId, clients) {
        try {
            const db = (0, index_1.getDb)();
            for (const client of clients) {
                await db.insert(index_1.schema.clientCache).values({
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
                    target: [index_1.schema.clientCache.userId, index_1.schema.clientCache.invoice4uClientId],
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
        }
        catch (err) {
            // Cache sync failure should not break the main flow
            console.warn('Client cache sync failed:', err);
        }
    }
    async searchClients(userId, search) {
        try {
            const db = (0, index_1.getDb)();
            const conditions = [(0, drizzle_orm_1.eq)(index_1.schema.clientCache.userId, userId)];
            if (search) {
                conditions.push((0, drizzle_orm_1.sql) `to_tsvector('simple', coalesce(${index_1.schema.clientCache.name}, '') || ' ' || coalesce(${index_1.schema.clientCache.businessName}, '')) @@ websearch_to_tsquery('simple', ${search})`);
            }
            const results = await db.select()
                .from(index_1.schema.clientCache)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy(index_1.schema.clientCache.name)
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
        }
        catch (err) {
            console.warn('Client cache search failed:', err);
            return [];
        }
    }
    async invalidateUserCache(userId) {
        try {
            const db = (0, index_1.getDb)();
            await db.delete(index_1.schema.clientCache).where((0, drizzle_orm_1.eq)(index_1.schema.clientCache.userId, userId));
        }
        catch (err) {
            console.warn('Client cache invalidation failed:', err);
        }
    }
}
exports.ClientCacheService = ClientCacheService;
//# sourceMappingURL=clientCache.service.js.map