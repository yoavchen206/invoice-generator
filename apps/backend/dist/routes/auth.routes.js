"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@yoavchu/shared");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const invoice4u_service_1 = require("../services/invoice4u.service");
const index_1 = require("../db/index");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', rateLimit_middleware_1.authRateLimit, async (req, res, next) => {
    try {
        const { email, password } = shared_1.LoginSchema.parse(req.body);
        const { token, userId } = await invoice4u_service_1.Invoice4uService.login(email, password);
        // Find or create user in our DB
        let user;
        try {
            const db = (0, index_1.getDb)();
            const existing = await db.select().from(index_1.schema.users).where((0, drizzle_orm_1.eq)(index_1.schema.users.email, email)).limit(1);
            if (existing.length > 0) {
                user = existing[0];
                // Update invoice4u user id if changed
                if (userId && user.invoice4uUserId !== userId) {
                    await db.update(index_1.schema.users)
                        .set({ invoice4uUserId: userId, updatedAt: new Date() })
                        .where((0, drizzle_orm_1.eq)(index_1.schema.users.id, user.id));
                }
            }
            else {
                const [newUser] = await db.insert(index_1.schema.users).values({
                    email,
                    displayName: email.split('@')[0],
                    invoice4uUserId: userId,
                }).returning();
                user = newUser;
            }
        }
        catch (dbErr) {
            // DB not available in dev - use mock user
            console.warn('DB not available, using mock user:', dbErr);
            user = {
                id: 'mock-user-id',
                email,
                displayName: email.split('@')[0],
                invoice4uUserId: userId,
            };
        }
        // Store session
        req.session.invoice4uToken = token;
        req.session.user = {
            id: user.id,
            email: user.email,
            displayName: user.displayName || null,
        };
        res.json({
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName || null,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
        });
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/auth/me
router.get('/me', auth_middleware_1.requireAuth, (req, res) => {
    res.json({ user: req.session.user });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map