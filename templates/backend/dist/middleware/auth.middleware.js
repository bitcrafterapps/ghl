"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
exports.isPublicRoute = isPublicRoute;
const jwt = __importStar(require("jsonwebtoken"));
const logger_1 = require("../logger");
const public_routes_1 = require("./public.routes");
const logger = new logger_1.Logger('AuthMiddleware');
function isPublicRoute(url) {
    // Use the centralized public routes list
    return public_routes_1.publicRoutes.some(route => url.startsWith(route));
}
const authMiddleware = (req, res, next) => {
    try {
        // Log what path we're processing
        logger.debug('Auth middleware called for path:', req.path);
        // Skip auth for public routes
        if (isPublicRoute(req.originalUrl)) {
            return next();
        }
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: {
                    code: 'NO_AUTH_HEADER',
                    message: 'No authorization header provided'
                }
            });
        }
        // Split the header and check format
        const parts = authHeader.split(' ');
        logger.debug('Auth header parts:', parts.length);
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: {
                    code: 'INVALID_AUTH_FORMAT',
                    message: 'Invalid authorization format'
                }
            });
        }
        const token = parts[1];
        logger.debug('Token found, length:', token.length);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                error: {
                    code: 'SERVER_CONFIG_ERROR',
                    message: 'Server configuration error'
                }
            });
        }
        logger.debug('Verifying token with secret length:', secret.length);
        // Verify JWT token
        const decoded = jwt.verify(token, secret);
        logger.debug('Token decoded successfully');
        const payload = typeof decoded === 'string' ? JSON.parse(decoded) : decoded;
        logger.debug('Token payload:', payload);
        // Create a user object with the necessary information
        const userObj = {
            userId: payload.userId,
            email: payload.email,
            roles: payload.roles || [],
            impersonatorId: payload.impersonatorId
        };
        // Directly attach to the request object
        req.user = userObj;
        logger.debug('User object set on request:', req.user);
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid authentication token'
                }
            });
        }
        return res.status(500).json({
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication error'
            }
        });
    }
};
exports.authMiddleware = authMiddleware;
