"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, req, res, _next) {
    // Handle Zod validation errors (check by name too for cross-module instances)
    if (err instanceof zod_1.ZodError || (err instanceof Error && err.name === 'ZodError')) {
        const zodErr = err;
        const fields = {};
        if (zodErr.issues) {
            for (const issue of zodErr.issues) {
                const path = issue.path.join('.');
                fields[path] = issue.message;
            }
        }
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed.',
                fields,
            },
        });
        return;
    }
    // Handle known API errors
    if (typeof err === 'object' && err !== null && 'code' in err && 'status' in err) {
        const apiErr = err;
        res.status(apiErr.status || 500).json({
            error: {
                code: apiErr.code || 'INTERNAL_ERROR',
                message: apiErr.message || 'An error occurred.',
            },
        });
        return;
    }
    // Handle standard errors
    if (err instanceof Error) {
        console.error('Unhandled error:', err);
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred.',
            },
        });
        return;
    }
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
        },
    });
}
//# sourceMappingURL=errorHandler.middleware.js.map