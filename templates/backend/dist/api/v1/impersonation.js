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
const impersonation_service_1 = require("../../services/impersonation.service");
const logger_1 = require("../../logger");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('ImpersonationAPI');
/**
 * @swagger
 * /api/v1/admin/impersonate/{userId}:
 *   post:
 *     summary: Impersonate a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to impersonate
 *     responses:
 *       200:
 *         description: Successfully started impersonation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - Requires Site Admin role
 *       404:
 *         description: User not found
 */
router.post('/impersonate/:userId', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminUser = req.user;
        const targetUserId = parseInt(req.params.userId);
        if (!adminUser || !adminUser.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Strict Role Check
        if (!adminUser.roles.includes('Site Admin')) {
            logger.warn(`Unauthorized impersonation attempt by user ${adminUser.userId}`);
            return res.status(403).json({ error: 'Requires Site Admin privileges' });
        }
        if (isNaN(targetUserId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const result = yield impersonation_service_1.ImpersonationService.impersonateUser(adminUser.userId, targetUserId);
        return res.json(result);
    }
    catch (error) {
        logger.error('Impersonation API error:', error);
        if (error.message === 'User not found' || error.message === 'Target user not found') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to start impersonation' });
    }
}));
exports.default = router;
