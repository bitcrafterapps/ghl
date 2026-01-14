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
const googleapis_1 = require("googleapis");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const auth_1 = require("../../middleware/auth");
const logger_1 = require("../../logger");
const logger = logger_1.LoggerFactory.getLogger('GoogleAPI');
const router = (0, express_1.Router)();
// Store pending OAuth states (in production, use Redis or database)
const pendingOAuthStates = new Map();
// Helper to get OAuth2 client
function getOAuth2Client(redirectUri) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const settings = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        const config = settings[0];
        if (!((_a = config === null || config === void 0 ? void 0 : config.googleOAuth) === null || _a === void 0 ? void 0 : _a.enabled) || !((_b = config === null || config === void 0 ? void 0 : config.googleOAuth) === null || _b === void 0 ? void 0 : _b.clientId) || !((_c = config === null || config === void 0 ? void 0 : config.googleOAuth) === null || _c === void 0 ? void 0 : _c.clientSecret)) {
            throw new Error('Google OAuth is not configured');
        }
        return new googleapis_1.google.auth.OAuth2(config.googleOAuth.clientId, config.googleOAuth.clientSecret, redirectUri);
    });
}
// Check if Google OAuth is configured
router.get('/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const settings = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        const config = settings[0];
        const isConfigured = !!(((_a = config === null || config === void 0 ? void 0 : config.googleOAuth) === null || _a === void 0 ? void 0 : _a.enabled) && ((_b = config === null || config === void 0 ? void 0 : config.googleOAuth) === null || _b === void 0 ? void 0 : _b.clientId) && ((_c = config === null || config === void 0 ? void 0 : config.googleOAuth) === null || _c === void 0 ? void 0 : _c.clientSecret));
        res.json({ configured: isConfigured });
    }
    catch (error) {
        logger.error('Error checking Google OAuth status:', error);
        res.status(500).json({ error: 'Failed to check Google OAuth status' });
    }
}));
// Initiate OAuth flow for Google Docs
router.post('/auth/initiate', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { redirectUrl, prdContent, projectName } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Get the callback URL from request origin
        const origin = req.headers.origin || ((_b = req.headers.referer) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, '')) || '';
        const callbackUrl = `${origin}/api/v1/google/callback`;
        const oauth2Client = yield getOAuth2Client(callbackUrl);
        // Generate a unique state to track this auth request
        const state = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        // Store the state with user info and content
        pendingOAuthStates.set(state, {
            userId,
            redirectUrl: redirectUrl || '/builder',
            prdContent,
            projectName
        });
        // Clean up old states (older than 10 minutes)
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        for (const [key, value] of pendingOAuthStates) {
            const timestamp = parseInt(key.split('-')[1] || '0');
            if (timestamp < tenMinutesAgo) {
                pendingOAuthStates.delete(key);
            }
        }
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/documents',
                'https://www.googleapis.com/auth/drive.file'
            ],
            state,
            prompt: 'consent'
        });
        res.json({ authUrl });
    }
    catch (error) {
        logger.error('Error initiating Google OAuth:', error);
        res.status(500).json({ error: error.message || 'Failed to initiate Google OAuth' });
    }
}));
// OAuth callback - handles the redirect from Google
router.get('/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { code, state, error: oauthError } = req.query;
        if (oauthError) {
            logger.error('OAuth error:', oauthError);
            return res.redirect(`/builder?error=oauth_denied`);
        }
        if (!code || !state) {
            return res.redirect(`/builder?error=invalid_callback`);
        }
        const stateData = pendingOAuthStates.get(state);
        if (!stateData) {
            return res.redirect(`/builder?error=invalid_state`);
        }
        // Remove the used state
        pendingOAuthStates.delete(state);
        // Get the callback URL
        const origin = `${req.protocol}://${req.get('host')}`;
        const callbackUrl = `${origin}/api/v1/google/callback`;
        const oauth2Client = yield getOAuth2Client(callbackUrl);
        // Exchange code for tokens
        const { tokens } = yield oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        // If we have PRD content, create the Google Doc
        if (stateData.prdContent) {
            const docs = googleapis_1.google.docs({ version: 'v1', auth: oauth2Client });
            // Create a new document
            const createResponse = yield docs.documents.create({
                requestBody: {
                    title: ((_a = stateData.prdContent.overview) === null || _a === void 0 ? void 0 : _a.name) || stateData.projectName || 'Product Requirements Document'
                }
            });
            const documentId = createResponse.data.documentId;
            if (documentId) {
                // Build the document content
                const requests = buildDocumentRequests(stateData.prdContent, stateData.projectName);
                // Update the document with content
                yield docs.documents.batchUpdate({
                    documentId,
                    requestBody: { requests }
                });
                // Redirect to the new Google Doc
                const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
                return res.redirect(docUrl);
            }
        }
        // Fallback redirect
        res.redirect(stateData.redirectUrl || '/builder');
    }
    catch (error) {
        logger.error('Error in Google OAuth callback:', error);
        res.redirect(`/builder?error=oauth_failed`);
    }
}));
// Helper function to build Google Docs API requests
function buildDocumentRequests(content, projectName) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const requests = [];
    let index = 1; // Start after the initial newline
    // Helper to insert text and move index
    const insertText = (text, bold = false, fontSize, heading) => {
        requests.push({
            insertText: {
                location: { index },
                text: text + '\n'
            }
        });
        const startIndex = index;
        const endIndex = index + text.length;
        if (bold || fontSize || heading) {
            const textStyle = {};
            if (bold)
                textStyle.bold = true;
            if (fontSize)
                textStyle.fontSize = { magnitude: fontSize, unit: 'PT' };
            if (Object.keys(textStyle).length > 0) {
                requests.push({
                    updateTextStyle: {
                        range: { startIndex, endIndex },
                        textStyle,
                        fields: Object.keys(textStyle).join(',')
                    }
                });
            }
            if (heading) {
                requests.push({
                    updateParagraphStyle: {
                        range: { startIndex, endIndex: endIndex + 1 },
                        paragraphStyle: { namedStyleType: heading },
                        fields: 'namedStyleType'
                    }
                });
            }
        }
        index += text.length + 1; // +1 for newline
    };
    // Title
    const title = ((_a = content.overview) === null || _a === void 0 ? void 0 : _a.name) || projectName || 'Product Requirements Document';
    insertText(title, true, 24, 'TITLE');
    // Description
    if ((_b = content.overview) === null || _b === void 0 ? void 0 : _b.description) {
        insertText('');
        insertText(content.overview.description);
    }
    // Objectives
    if (((_d = (_c = content.overview) === null || _c === void 0 ? void 0 : _c.objectives) === null || _d === void 0 ? void 0 : _d.length) > 0) {
        insertText('');
        insertText('Objectives', true, 18, 'HEADING_1');
        content.overview.objectives.forEach((obj, i) => {
            insertText(`${i + 1}. ${obj}`);
        });
    }
    // Features
    if (((_e = content.features) === null || _e === void 0 ? void 0 : _e.length) > 0) {
        insertText('');
        insertText('Features', true, 18, 'HEADING_1');
        content.features.forEach((feature) => {
            const priority = feature.priority ? ` [${feature.priority.toUpperCase()}]` : '';
            const points = feature.storyPoints ? ` (${feature.storyPoints} pts)` : '';
            insertText(`${feature.name}${priority}${points}`, true, 14, 'HEADING_2');
            if (feature.description) {
                insertText(feature.description);
            }
            if (feature.acceptanceCriteria) {
                insertText('Acceptance Criteria:', true);
                if (Array.isArray(feature.acceptanceCriteria)) {
                    feature.acceptanceCriteria.forEach((ac) => {
                        var _a;
                        insertText(`• ${(_a = ac.text) !== null && _a !== void 0 ? _a : ac}`);
                    });
                }
                else {
                    insertText(feature.acceptanceCriteria);
                }
            }
        });
    }
    // Target Users
    if (((_f = content.targetUsers) === null || _f === void 0 ? void 0 : _f.length) > 0) {
        insertText('');
        insertText('Target Users', true, 18, 'HEADING_1');
        content.targetUsers.forEach((user) => {
            var _a;
            insertText(user.persona, true, 14, 'HEADING_2');
            if (((_a = user.needs) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                user.needs.forEach((need) => {
                    insertText(`• ${need}`);
                });
            }
        });
    }
    // Data Model
    if (((_g = content.dataModel) === null || _g === void 0 ? void 0 : _g.length) > 0) {
        insertText('');
        insertText('Data Model', true, 18, 'HEADING_1');
        content.dataModel.forEach((entity) => {
            var _a;
            insertText(entity.entity, true, 14, 'HEADING_2');
            if (((_a = entity.attributes) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                entity.attributes.forEach((attr) => {
                    const required = attr.required ? ' (required)' : '';
                    insertText(`• ${attr.name}: ${attr.type}${required}`);
                });
            }
        });
    }
    // API Endpoints
    if (((_h = content.apiEndpoints) === null || _h === void 0 ? void 0 : _h.length) > 0) {
        insertText('');
        insertText('API Endpoints', true, 18, 'HEADING_1');
        content.apiEndpoints.forEach((ep) => {
            insertText(`${ep.method} ${ep.path} - ${ep.description || ''}`);
        });
    }
    // Authentication
    if (content.authentication) {
        insertText('');
        insertText('Authentication', true, 18, 'HEADING_1');
        if (((_j = content.authentication.methods) === null || _j === void 0 ? void 0 : _j.length) > 0) {
            insertText('Methods:', true);
            content.authentication.methods.forEach((method) => {
                insertText(`• ${method}`);
            });
        }
        if (((_k = content.authentication.roles) === null || _k === void 0 ? void 0 : _k.length) > 0) {
            insertText('Roles:', true);
            content.authentication.roles.forEach((role) => {
                const perms = Array.isArray(role.permissions) ? role.permissions.join(', ') : role.permissions;
                insertText(`• ${role.name}: ${perms}`);
            });
        }
    }
    // Technical Requirements
    if (content.technicalRequirements) {
        insertText('');
        insertText('Technical Requirements', true, 18, 'HEADING_1');
        if (((_l = content.technicalRequirements.platforms) === null || _l === void 0 ? void 0 : _l.length) > 0) {
            insertText(`Platforms: ${content.technicalRequirements.platforms.join(', ')}`);
        }
        if (((_m = content.technicalRequirements.performance) === null || _m === void 0 ? void 0 : _m.length) > 0) {
            insertText('Performance:', true);
            content.technicalRequirements.performance.forEach((p) => {
                insertText(`• ${p}`);
            });
        }
        if (((_o = content.technicalRequirements.security) === null || _o === void 0 ? void 0 : _o.length) > 0) {
            insertText('Security:', true);
            content.technicalRequirements.security.forEach((s) => {
                insertText(`• ${s}`);
            });
        }
    }
    // Success Metrics
    if (((_p = content.successMetrics) === null || _p === void 0 ? void 0 : _p.length) > 0) {
        insertText('');
        insertText('Success Metrics', true, 18, 'HEADING_1');
        content.successMetrics.forEach((metric) => {
            insertText(`• ${metric}`);
        });
    }
    // Footer
    insertText('');
    insertText(`Generated on ${new Date().toLocaleDateString()}`);
    return requests;
}
exports.default = router;
