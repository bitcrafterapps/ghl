"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../logger");
const authenticate = (req, res, next) => {
    var _a;
    const logger = logger_1.LoggerFactory.getLogger('AuthMiddleware');
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Set both authenticatedUser and user properties for compatibility
        req.authenticatedUser = decoded;
        req.user = decoded;
        // Also set directly on req.user for maximum compatibility
        req.user = decoded;
        logger.debug('Auth middleware: User object set on request:', req.user);
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
