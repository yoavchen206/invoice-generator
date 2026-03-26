"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoice4uClient = void 0;
exports.createAuthenticatedClient = createAuthenticatedClient;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
exports.invoice4uClient = axios_1.default.create({
    baseURL: config_1.env.INVOICE4U_API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});
// Request interceptor to add auth token
exports.invoice4uClient.interceptors.request.use((config) => {
    return config;
});
// Response interceptor for error normalization
exports.invoice4uClient.interceptors.response.use((response) => response, (error) => {
    if (error.response) {
        // API responded with error status
        const status = error.response.status;
        const data = error.response.data;
        const normalizedError = {
            status,
            code: data?.code || 'INVOICE4U_ERROR',
            message: data?.message || 'An error occurred with the invoice4u API',
            data: data,
        };
        return Promise.reject(normalizedError);
    }
    else if (error.request) {
        // Request was made but no response
        return Promise.reject({
            status: 503,
            code: 'UPSTREAM_UNAVAILABLE',
            message: 'Invoice4u API is currently unavailable',
        });
    }
    return Promise.reject({
        status: 500,
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal error',
    });
});
function createAuthenticatedClient(token) {
    const client = axios_1.default.create({
        baseURL: config_1.env.INVOICE4U_API_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    client.interceptors.response.use((response) => response, (error) => {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            return Promise.reject({
                status,
                code: data?.code || 'INVOICE4U_ERROR',
                message: data?.message || 'An error occurred with the invoice4u API',
                data: data,
            });
        }
        else if (error.request) {
            return Promise.reject({
                status: 503,
                code: 'UPSTREAM_UNAVAILABLE',
                message: 'Invoice4u API is currently unavailable',
            });
        }
        return Promise.reject({
            status: 500,
            code: 'INTERNAL_ERROR',
            message: error.message || 'Internal error',
        });
    });
    return client;
}
//# sourceMappingURL=invoice4uClient.js.map