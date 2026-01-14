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
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../../middleware/auth");
const admin_1 = require("../../middleware/admin");
const router = (0, express_1.Router)();
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
router.get('/public', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const settings = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        const config = settings[0] || {};
        // Whitelist only public fields
        res.json({
            siteName: config.siteName,
            siteUrl: config.siteUrl,
            contactEmail: config.contactEmail,
            enableRegistration: config.enableRegistration,
            seo: config.seo || {},
            // Public flag for Google OAuth availability (not the secrets)
            googleOAuthEnabled: !!(((_a = config.googleOAuth) === null || _a === void 0 ? void 0 : _a.enabled) && ((_b = config.googleOAuth) === null || _b === void 0 ? void 0 : _b.clientId)),
            // Public flag for payment processing availability (not the secrets)
            paymentProcessorEnabled: !!(((_c = config.paymentProcessor) === null || _c === void 0 ? void 0 : _c.enabled) && ((_d = config.paymentProcessor) === null || _d === void 0 ? void 0 : _d.provider)),
            paymentProcessorProvider: ((_e = config.paymentProcessor) === null || _e === void 0 ? void 0 : _e.enabled) ? (_f = config.paymentProcessor) === null || _f === void 0 ? void 0 : _f.provider : null,
            // Do NOT send LLM keys or secrets
        });
    }
    catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
}));
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
router.get('/', auth_1.authenticate, admin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        // If no settings exist, return default/empty
        res.json(settings[0] || {});
    }
    catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
}));
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
router.put('/', auth_1.authenticate, admin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { siteName, siteUrl, contactEmail, maxProjectsPerUser, enableRegistration, requireEmailVerification, seo, llm, gitProvider, googleOAuth, paymentProcessor } = req.body;
        const existing = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        if (existing.length === 0) {
            // Create
            const newSettings = yield db_1.db.insert(schema_1.siteSettings).values({
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
        }
        else {
            // Update
            const updated = yield db_1.db.update(schema_1.siteSettings)
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
                .where((0, drizzle_orm_1.eq)(schema_1.siteSettings.id, existing[0].id))
                .returning();
            res.json(updated[0]);
        }
    }
    catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
}));
exports.default = router;
