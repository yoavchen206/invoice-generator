"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalRateLimit = exports.invoiceCreateRateLimit = exports.authRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please try again in 15 minutes.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.invoiceCreateRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again shortly.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    message: {
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again shortly.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.middleware.js.map