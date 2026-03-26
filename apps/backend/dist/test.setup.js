"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.beforeAll)(() => {
    process.env.NODE_ENV = 'test';
    process.env.SESSION_SECRET = 'test-secret-key-at-least-32-chars-long';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/test';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.INVOICE4U_API_BASE_URL = 'https://api.invoice4u.co.il';
    process.env.INVOICE4U_API_KEY = 'test-key';
    process.env.PORT = '3001';
});
//# sourceMappingURL=test.setup.js.map