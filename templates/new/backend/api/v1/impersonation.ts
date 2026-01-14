import { Router, Request, Response } from 'express';
import { ImpersonationService } from '../../services/impersonation.service';
import { LoggerFactory } from '../../logger';
import { authenticate } from '../../middleware/v1/auth.middleware';

const router = Router();
const logger = LoggerFactory.getLogger('ImpersonationAPI');

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
router.post('/impersonate/:userId', authenticate, async (req: Request, res: Response) => {
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

        const result = await ImpersonationService.impersonateUser(adminUser.userId, targetUserId);
        
        return res.json(result);

    } catch (error: any) {
        logger.error('Impersonation API error:', error);
        if (error.message === 'User not found' || error.message === 'Target user not found') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to start impersonation' });
    }
});

export default router;
