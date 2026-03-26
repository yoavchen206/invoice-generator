"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPreferences = exports.clientCache = exports.sessions = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    displayName: (0, pg_core_1.text)('display_name'),
    invoice4uUserId: (0, pg_core_1.text)('invoice4u_user_id').unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    emailIdx: (0, pg_core_1.index)('idx_users_email').on(table.email),
}));
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    sid: (0, pg_core_1.text)('sid').primaryKey(),
    sess: (0, pg_core_1.jsonb)('sess').notNull(),
    expire: (0, pg_core_1.timestamp)('expire', { withTimezone: true }).notNull(),
}, (table) => ({
    expireIdx: (0, pg_core_1.index)('idx_sessions_expire').on(table.expire),
}));
exports.clientCache = (0, pg_core_1.pgTable)('client_cache', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    invoice4uClientId: (0, pg_core_1.text)('invoice4u_client_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    businessName: (0, pg_core_1.text)('business_name'),
    email: (0, pg_core_1.text)('email'),
    phone: (0, pg_core_1.text)('phone'),
    address: (0, pg_core_1.text)('address'),
    taxId: (0, pg_core_1.text)('tax_id'),
    cachedAt: (0, pg_core_1.timestamp)('cached_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)('idx_client_cache_user_id').on(table.userId),
    nameIdx: (0, pg_core_1.index)('idx_client_cache_name').on(table.userId, table.name),
    uniqueUserClient: (0, pg_core_1.unique)().on(table.userId, table.invoice4uClientId),
}));
exports.userPreferences = (0, pg_core_1.pgTable)('user_preferences', {
    userId: (0, pg_core_1.uuid)('user_id').primaryKey().references(() => exports.users.id, { onDelete: 'cascade' }),
    defaultPeriod: (0, pg_core_1.text)('default_period').notNull().default('this_month'),
    sidebarCollapsed: (0, pg_core_1.boolean)('sidebar_collapsed').notNull().default(false),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=schema.js.map