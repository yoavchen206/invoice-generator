"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const envalid_1 = require("envalid");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
exports.env = (0, envalid_1.cleanEnv)(process.env, {
    NODE_ENV: (0, envalid_1.str)({ choices: ['development', 'production', 'test'], default: 'development' }),
    PORT: (0, envalid_1.port)({ default: 3001 }),
    DATABASE_URL: (0, envalid_1.str)({ default: 'postgresql://user:password@localhost:5432/yoavchu_invoices' }),
    SESSION_SECRET: (0, envalid_1.str)({ default: 'dev-secret-key-at-least-32-chars-long-here' }),
    FRONTEND_URL: (0, envalid_1.str)({ default: 'http://localhost:5173' }),
    INVOICE4U_API_BASE_URL: (0, envalid_1.str)({ default: 'https://api.invoice4u.co.il' }),
    INVOICE4U_API_KEY: (0, envalid_1.str)({ default: 'dev-api-key' }),
});
//# sourceMappingURL=config.js.map