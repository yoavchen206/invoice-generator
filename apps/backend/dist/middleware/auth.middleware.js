"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
function requireAuth(req, res, next) {
    if (!req.session?.invoice4uToken) {
        res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Not authenticated. Please log in.',
            },
        });
        return;
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map