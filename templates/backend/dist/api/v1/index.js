"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const companies_1 = __importDefault(require("./companies"));
const health_1 = __importDefault(require("./health"));
const dashboard_1 = __importDefault(require("./dashboard"));
const activity_1 = __importDefault(require("./activity"));
const logs_1 = __importDefault(require("./logs"));
const messages_1 = __importDefault(require("./messages"));
const site_settings_1 = __importDefault(require("./site-settings"));
const usage_1 = __importDefault(require("./usage"));
const signup_1 = __importDefault(require("./signup"));
const emails_1 = __importDefault(require("./emails"));
const impersonation_1 = __importDefault(require("./impersonation"));
const google_1 = __importDefault(require("./google"));
const payments_1 = __importDefault(require("./payments"));
const transactions_1 = __importDefault(require("./transactions"));
const gallery_images_1 = __importDefault(require("./gallery-images"));
const reviews_1 = __importDefault(require("./reviews"));
const stats_middleware_1 = require("../../middleware/v1/stats.middleware");
const logger_1 = require("../../logger");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const logger = logger_1.LoggerFactory.getLogger('ApiRouter');
// Use mergeParams to inherit request properties from parent router
const router = (0, express_1.Router)({ mergeParams: true });
// Add API usage tracking middleware
router.use(stats_middleware_1.trackApiUsage);
// Add request logging middleware
router.use((req, res, next) => {
    logger.debug(`API request: ${req.method} ${req.originalUrl}, params: ${JSON.stringify(req.params)}`);
    next();
});
// Mount auth routes before authentication middleware
logger.debug('Mounting auth routes at /auth');
router.use('/auth', auth_1.default);
// Mount signup routes before authentication middleware (public endpoint)
logger.debug('Mounting signup routes at /signup');
router.use('/signup', signup_1.default);
// Mount site settings routes before authentication middleware (handles its own auth)
logger.debug('Mounting site settings routes at /site-settings');
router.use('/site-settings', site_settings_1.default);
// Mount Google routes before authentication middleware (OAuth callback needs to work without auth)
logger.debug('Mounting Google routes at /google');
router.use('/google', google_1.default);
// Mount payments routes before authentication middleware (signup payment flow needs public access)
logger.debug('Mounting payments routes at /payments');
router.use('/payments', payments_1.default);
// Add middleware to ensure user data is preserved across requests
// Skip auth middleware for auth routes
router.use((req, res, next) => {
    logger.debug(`[Middleware] Path check: ${req.path}, OriginalUrl: ${req.originalUrl}`);
    if (req.path.startsWith('/auth') || req.path.startsWith('/signup') || req.originalUrl.includes('/site-settings/public') || req.path.startsWith('/google/callback') || req.path.startsWith('/google/status') || req.path.startsWith('/payments')) {
        return next();
    }
    (0, auth_middleware_1.validateSession)(req, res, next);
});
// Add middleware to load user data
router.use((req, res, next) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/signup') || req.originalUrl.includes('/site-settings/public') || req.path.startsWith('/google/callback') || req.path.startsWith('/google/status') || req.path.startsWith('/payments')) {
        return next();
    }
    (0, auth_middleware_1.loadUserData)(req, res, next);
});
// Add middleware to normalize user object format
router.use((req, res, next) => {
    var _a, _b, _c;
    if (req.user) {
        logger.debug(`Normalizing user object: ${JSON.stringify(req.user)}`);
        // Normalize user object format
        const normalizedUser = {
            userId: req.user.userId || req.user.id || ((_a = req.user.authenticatedUser) === null || _a === void 0 ? void 0 : _a.userId),
            email: req.user.email || ((_b = req.user.authenticatedUser) === null || _b === void 0 ? void 0 : _b.email) || 'unknown',
            roles: Array.isArray(req.user.roles)
                ? req.user.roles
                : (Array.isArray((_c = req.user.authenticatedUser) === null || _c === void 0 ? void 0 : _c.roles)
                    ? req.user.authenticatedUser.roles
                    : [])
        };
        // Set normalized user on request
        req.user = normalizedUser;
        logger.debug(`Normalized user object: ${JSON.stringify(req.user)}`);
    }
    next();
});
// Mount all API routes with logging
logger.info('Mounting API routes');
logger.debug('Mounting users routes at /users');
router.use('/users', users_1.default);
logger.debug('Mounting companies routes at /companies');
router.use('/companies', companies_1.default);
logger.debug('Mounting health routes at /health');
router.use('/health', health_1.default);
logger.debug('Mounting dashboard routes at /dashboard');
router.use('/dashboard', dashboard_1.default);
logger.debug('Mounting activity routes at /activity');
router.use('/activity', activity_1.default);
logger.debug('Mounting logs routes at /logs');
router.use('/logs', logs_1.default);
logger.debug('Mounting impersonation routes at /admin');
router.use('/admin', impersonation_1.default);
logger.debug('Mounting messages routes at /messages');
router.use('/messages', messages_1.default);
// Site settings moved to valid session bypass block
logger.debug('Mounting usage routes at /usage');
router.use('/usage', usage_1.default);
logger.debug('Mounting emails routes at /emails');
router.use('/emails', emails_1.default);
logger.debug('Mounting transactions routes at /transactions');
router.use('/transactions', transactions_1.default);
logger.debug('Mounting gallery-images routes at /gallery-images');
router.use('/gallery-images', gallery_images_1.default);
logger.debug('Mounting reviews routes at /reviews');
router.use('/reviews', reviews_1.default);
// Add API error tracking middleware
router.use(stats_middleware_1.trackApiErrors);
logger.info('All API routes mounted successfully');
exports.default = router;
