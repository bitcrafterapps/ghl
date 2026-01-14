"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = require("crypto");
const bcrypt_1 = require("bcrypt");
const user_service_1 = require("../../services/user.service");
const email_service_1 = require("../../services/email.service");
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('AuthAPI');
const APP_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
// Middleware to log auth endpoint requests
router.use((req, _res, next) => {
    logger.debug(`Auth endpoint accessed: ${req.method} ${req.path}`);
    next();
});
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug('Login attempt - Headers:', JSON.stringify(req.headers));
        logger.debug('Login attempt for:', req.body.email);
        logger.debug('Request body:', JSON.stringify(req.body));
        const loginResponse = yield user_service_1.UserService.login(req.body);
        logger.debug('Login successful for:', req.body.email);
        logger.debug('Token generated with length:', loginResponse.token.length);
        res.json((0, response_types_1.createSuccessResponse)({
            token: loginResponse.token,
            user: loginResponse.user
        }));
    }
    catch (error) {
        logger.error('Login failed for user:', req.body.email);
        logger.error('Login error details:', error);
        res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_FAILED', error instanceof Error ? error.message : 'Login failed'));
    }
}));
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 */
router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Email is required'));
        }
        logger.info(`Password reset requested for: ${email}`);
        // Find user by email
        const [user] = yield db_1.db.select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email.toLowerCase()));
        // Always return success for security (don't reveal if email exists)
        if (!user) {
            logger.debug(`Password reset requested for non-existent email: ${email}`);
            return res.json((0, response_types_1.createSuccessResponse)({
                message: 'If an account with that email exists, a password reset link has been sent.'
            }));
        }
        // Generate secure reset token
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Save token to database
        yield db_1.db.update(schema_1.users)
            .set({
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        // Send email
        const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
        yield email_service_1.EmailService.send({
            to: user.email,
            templateKey: 'forgot_password',
            variables: {
                firstName: user.firstName || 'User',
                resetLink,
                appUrl: APP_URL
            },
            userId: user.id
        });
        logger.info(`Password reset email sent to: ${email}`);
        return res.json((0, response_types_1.createSuccessResponse)({
            message: 'If an account with that email exists, a password reset link has been sent.'
        }));
    }
    catch (error) {
        logger.error('Error in forgot-password:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to process password reset request'));
    }
}));
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Token and password are required'));
        }
        if (password.length < 8) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Password must be at least 8 characters'));
        }
        // Find user with valid token
        const [user] = yield db_1.db.select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.resetPasswordToken, token), (0, drizzle_orm_1.gt)(schema_1.users.resetPasswordExpires, new Date())));
        if (!user) {
            logger.warn(`Invalid or expired reset token attempted`);
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_TOKEN', 'Invalid or expired reset token'));
        }
        // Hash new password
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        // Update password and clear reset token
        yield db_1.db.update(schema_1.users)
            .set({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        logger.info(`Password reset successful for user: ${user.email}`);
        return res.json((0, response_types_1.createSuccessResponse)({
            message: 'Password has been reset successfully. You can now log in with your new password.'
        }));
    }
    catch (error) {
        logger.error('Error in reset-password:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to reset password'));
    }
}));
logger.info('All auth routes mounted successfully');
exports.default = router;
