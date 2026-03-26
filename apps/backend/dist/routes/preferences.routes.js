"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@yoavchu/shared");
const auth_middleware_1 = require("../middleware/auth.middleware");
const index_1 = require("../db/index");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// GET /api/preferences
router.get('/', async (req, res, next) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } });
            return;
        }
        try {
            const db = (0, index_1.getDb)();
            const [prefs] = await db.select()
                .from(index_1.schema.userPreferences)
                .where((0, drizzle_orm_1.eq)(index_1.schema.userPreferences.userId, userId))
                .limit(1);
            if (prefs) {
                res.json({
                    preferences: {
                        defaultPeriod: prefs.defaultPeriod,
                        sidebarCollapsed: prefs.sidebarCollapsed,
                    },
                });
            }
            else {
                res.json({
                    preferences: {
                        defaultPeriod: 'this_month',
                        sidebarCollapsed: false,
                    },
                });
            }
        }
        catch {
            // Return defaults if DB unavailable
            res.json({
                preferences: {
                    defaultPeriod: 'this_month',
                    sidebarCollapsed: false,
                },
            });
        }
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/preferences
router.patch('/', async (req, res, next) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } });
            return;
        }
        const payload = shared_1.UpdatePreferencesSchema.parse(req.body);
        try {
            const db = (0, index_1.getDb)();
            await db.insert(index_1.schema.userPreferences).values({
                userId,
                defaultPeriod: payload.defaultPeriod || 'this_month',
                sidebarCollapsed: payload.sidebarCollapsed ?? false,
                updatedAt: new Date(),
            }).onConflictDoUpdate({
                target: index_1.schema.userPreferences.userId,
                set: {
                    ...(payload.defaultPeriod ? { defaultPeriod: payload.defaultPeriod } : {}),
                    ...(payload.sidebarCollapsed !== undefined ? { sidebarCollapsed: payload.sidebarCollapsed } : {}),
                    updatedAt: new Date(),
                },
            });
            const [updated] = await db.select()
                .from(index_1.schema.userPreferences)
                .where((0, drizzle_orm_1.eq)(index_1.schema.userPreferences.userId, userId))
                .limit(1);
            res.json({
                preferences: {
                    defaultPeriod: updated?.defaultPeriod || 'this_month',
                    sidebarCollapsed: updated?.sidebarCollapsed ?? false,
                },
            });
        }
        catch {
            res.json({
                preferences: {
                    defaultPeriod: payload.defaultPeriod || 'this_month',
                    sidebarCollapsed: payload.sidebarCollapsed ?? false,
                },
            });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=preferences.routes.js.map