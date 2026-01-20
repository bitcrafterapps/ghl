
import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { siteSettings } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { authenticate as authenticateToken } from '../../middleware/auth';
import { isAdmin } from '../../middleware/admin';

const router = Router();

// Public config endpoint (for footer, meta tags etc)
/**
 * @swagger
 * /site-settings/public:
 *   get:
 *     summary: Get public site settings
 *     description: Retrieve public configuration for the site (site name, URL, etc.)
 *     tags: [Site Settings]
 *     responses:
 *       200:
 *         description: Public site settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 siteName:
 *                   type: string
 *                 siteUrl:
 *                   type: string
 *                 contactEmail:
 *                   type: string
 *                 enableRegistration:
 *                   type: boolean
 *                 seo:
 *                   type: object
 */
router.get('/public', async (req: Request, res: Response) => {
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    
    const config = settings[0] || {};
    
    // Whitelist only public fields
    res.json({
      siteName: config.siteName,
      siteUrl: config.siteUrl,
      contactEmail: config.contactEmail,
      enableRegistration: config.enableRegistration,
      seo: config.seo || {},
      // Public flag for Google OAuth availability (not the secrets)
      googleOAuthEnabled: !!(config.googleOAuth?.enabled && config.googleOAuth?.clientId),
      // Public flag for payment processing availability (not the secrets)
      paymentProcessorEnabled: !!(config.paymentProcessor?.enabled && config.paymentProcessor?.provider),
      paymentProcessorProvider: config.paymentProcessor?.enabled ? config.paymentProcessor?.provider : null,
      // Do NOT send LLM keys or secrets
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Admin endpoints
/**
 * @swagger
 * /site-settings:
 *   get:
 *     summary: Get all site settings
 *     description: Retrieve full site configuration. Requires admin privileges.
 *     tags: [Site Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Site settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    // If no settings exist, return default/empty
    res.json(settings[0] || {});
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * @swagger
 * /site-settings:
 *   put:
 *     summary: Update site settings
 *     description: Update site configuration. Requires admin privileges.
 *     tags: [Site Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated site settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const {
      siteName,
      siteUrl,
      contactEmail,
      maxProjectsPerUser,
      enableRegistration,
      requireEmailVerification,
      seo,
      llm,
      gitProvider,
      googleOAuth,
      paymentProcessor
    } = req.body;

    const existing = await db.select().from(siteSettings).limit(1);
    
    if (existing.length === 0) {
        // Create
        const newSettings = await db.insert(siteSettings).values({
            siteName,
            siteUrl,
            contactEmail,
            maxProjectsPerUser,
            enableRegistration,
            requireEmailVerification,
            seo,
            llm,
            gitProvider,
            googleOAuth,
            paymentProcessor
        }).returning();
        res.json(newSettings[0]);
    } else {
        // Update
        const updated = await db.update(siteSettings)
            .set({
                siteName,
                siteUrl,
                contactEmail,
                maxProjectsPerUser,
                enableRegistration,
                requireEmailVerification,
                seo,
                llm,
                gitProvider,
                googleOAuth,
                paymentProcessor,
                updatedAt: new Date()
            })
            .where(eq(siteSettings.id, existing[0].id))
            .returning();
        res.json(updated[0]);
    }

  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
