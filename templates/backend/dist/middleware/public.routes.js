"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRoutes = void 0;
exports.publicRoutes = [
    // Health checks
    '/api/health',
    '/api/health/ping',
    '/api/v1/health',
    '/api/v1/health/ping',
    '/api/v1/health/db',
    '/api/v1/health/redis',
    '/api/v1/health/warmup',
    // Documentation
    '/api-docs',
    '/swagger.json',
    // Authentication - Legacy
    '/api/users/login',
    // Authentication - v1
    '/api/v1/auth/login'
];
