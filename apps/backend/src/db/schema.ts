import { pgTable, text, uuid, boolean, timestamp, jsonb, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  invoice4uUserId: text('invoice4u_user_id').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}));

export const sessions = pgTable('sessions', {
  sid: text('sid').primaryKey(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire', { withTimezone: true }).notNull(),
}, (table) => ({
  expireIdx: index('idx_sessions_expire').on(table.expire),
}));

export const clientCache = pgTable('client_cache', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invoice4uClientId: text('invoice4u_client_id').notNull(),
  name: text('name').notNull(),
  businessName: text('business_name'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('tax_id'),
  cachedAt: timestamp('cached_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_client_cache_user_id').on(table.userId),
  nameIdx: index('idx_client_cache_name').on(table.userId, table.name),
  uniqueUserClient: unique().on(table.userId, table.invoice4uClientId),
}));

export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  defaultPeriod: text('default_period').notNull().default('this_month'),
  sidebarCollapsed: boolean('sidebar_collapsed').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ClientCacheEntry = typeof clientCache.$inferSelect;
export type NewClientCacheEntry = typeof clientCache.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
