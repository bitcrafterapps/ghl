"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.loadUserData = exports.validateSession = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const logger = logger_1.LoggerFactory.getLogger('AuthMiddleware');
/**
 * Authentication middleware for v1 API
 * Verifies JWT token and adds user info to request
 */
const authenticate = (req, res, next) => {
    try {
        logger.debug('V1 Auth middleware called for path:', req.path);
        logger.debug('Full URL:', req.originalUrl);
        // Check if user is already authenticated by another middleware
        if (req.user) {
            logger.debug('User already authenticated by another middleware:', req.user);
            // Ensure the user object has the correct format
            const userObj = {
                userId: req.user.userId || req.user.id,
                email: req.user.email || 'unknown',
                roles: Array.isArray(req.user.roles) ? req.user.roles : []
            };
            // Set user object on request in all possible locations
            req.user = userObj;
            req._authenticatedUser = userObj;
            req.authenticatedUser = userObj;
            logger.debug('User object normalized and set on request:', userObj);
            return next();
        }
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger.debug('No authorization header');
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_MISSING_TOKEN', 'Authentication token is required'));
        }
        // Check Bearer token format
        const parts = authHeader.split(' ');
        logger.debug('Auth header parts:', parts.length);
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            logger.debug('Invalid authorization format');
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_INVALID_FORMAT', 'Invalid authorization format'));
        }
        const token = parts[1];
        logger.debug('Token found, length:', token.length);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger.error('JWT_SECRET not configured');
            return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_CONFIG_ERROR', 'Server configuration error'));
        }
        // Verify JWT token
        logger.debug('Verifying token with secret length:', secret.length);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            logger.debug('Token decoded successfully');
            const payload = typeof decoded === 'string' ? JSON.parse(decoded) : decoded;
            // Log the payload for debugging
            logger.debug('Token payload:', JSON.stringify(payload));
            // Ensure userId exists and is a valid number
            if (!payload.userId && payload.userId !== 0) {
                logger.error('Missing user ID in token payload');
                return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_MISSING_ID', 'Missing user ID in authentication token'));
            }
            // Ensure userId is a number
            const userId = Number(payload.userId);
            if (isNaN(userId) || userId <= 0) {
                logger.error(`Invalid user ID in token: ${payload.userId}, type: ${typeof payload.userId}`);
                return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_INVALID_ID', 'Invalid user ID in authentication token'));
            }
            // Create user object
            const userObject = {
                userId,
                email: payload.email || 'unknown',
                roles: Array.isArray(payload.roles) ? payload.roles : []
            };
            // Log the user object for debugging
            logger.debug('User object created from token:', JSON.stringify(userObject));
            // Set user object on request in all possible locations
            req.user = userObject;
            req._authenticatedUser = userObject;
            req.authenticatedUser = userObject;
            // Also set it directly on req.user for compatibility
            req.user = userObject;
            logger.debug('Authenticated user:', userObject.email);
            logger.debug('User object set on request:', req.user);
            next();
        }
        catch (jwtError) {
            logger.error('Token verification failed:', jwtError);
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_INVALID_TOKEN', 'Invalid or expired authentication token'));
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Internal server error during authentication'));
    }
};
exports.authenticate = authenticate;
/**
 * Validates that the user session is active and valid
 */
const validateSession = (req, res, next) => {
    // In a real implementation, this might check if the user's session is still valid
    // For now, we'll just pass through since the JWT validation is sufficient
    logger.debug('validateSession: Checking for _authenticatedUser');
    const authReq = req;
    if (authReq._authenticatedUser) {
        logger.debug('validateSession: Found _authenticatedUser:', authReq._authenticatedUser);
        // Ensure user is also set in the standard location
        authReq.user = authReq._authenticatedUser;
    }
    next();
};
exports.validateSession = validateSession;
/**
 * Loads additional user data if needed
 */
const loadUserData = (req, res, next) => {
    // In a real implementation, this might load additional user data from the database
    // For now, we'll just pass through since the JWT contains basic user info
    logger.debug('loadUserData: Checking for _authenticatedUser');
    const authReq = req;
    if (authReq._authenticatedUser) {
        logger.debug('loadUserData: Found _authenticatedUser:', authReq._authenticatedUser);
        // Ensure user is also set in the standard location
        authReq.user = authReq._authenticatedUser;
    }
    next();
};
exports.loadUserData = loadUserData;
/**
 * Middleware to require specific roles
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_REQUIRED', 'Authentication required'));
        }
        const hasRole = user.roles.some(role => allowedRoles.includes(role));
        if (!hasRole) {
            logger.warn(`User ${user.userId} attempted to access protected resource. Required roles: ${allowedRoles}, User roles: ${user.roles}`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('AUTH_FORBIDDEN', 'Insufficient permissions'));
        }
        next();
    };
};
exports.requireRole = requireRole;
