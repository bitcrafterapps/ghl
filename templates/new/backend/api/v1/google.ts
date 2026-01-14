import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { db } from '../../db';
import { siteSettings } from '../../db/schema';
import { authenticate as authenticateToken } from '../../middleware/auth';
import { LoggerFactory } from '../../logger';

const logger = LoggerFactory.getLogger('GoogleAPI');
const router = Router();

// Store pending OAuth states (in production, use Redis or database)
const pendingOAuthStates = new Map<string, { userId: number; redirectUrl: string; prdContent?: any; projectName?: string }>();

// Helper to get OAuth2 client
async function getOAuth2Client(redirectUri: string) {
  const settings = await db.select().from(siteSettings).limit(1);
  const config = settings[0];

  if (!config?.googleOAuth?.enabled || !config?.googleOAuth?.clientId || !config?.googleOAuth?.clientSecret) {
    throw new Error('Google OAuth is not configured');
  }

  return new google.auth.OAuth2(
    config.googleOAuth.clientId,
    config.googleOAuth.clientSecret,
    redirectUri
  );
}

// Check if Google OAuth is configured
router.get('/status', async (req: Request, res: Response) => {
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    const config = settings[0];

    const isConfigured = !!(config?.googleOAuth?.enabled && config?.googleOAuth?.clientId && config?.googleOAuth?.clientSecret);

    res.json({ configured: isConfigured });
  } catch (error) {
    logger.error('Error checking Google OAuth status:', error);
    res.status(500).json({ error: 'Failed to check Google OAuth status' });
  }
});

// Initiate OAuth flow for Google Docs
router.post('/auth/initiate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { redirectUrl, prdContent, projectName } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the callback URL from request origin
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || '';
    const callbackUrl = `${origin}/api/v1/google/callback`;

    const oauth2Client = await getOAuth2Client(callbackUrl);

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
  } catch (error: any) {
    logger.error('Error initiating Google OAuth:', error);
    res.status(500).json({ error: error.message || 'Failed to initiate Google OAuth' });
  }
});

// OAuth callback - handles the redirect from Google
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      logger.error('OAuth error:', oauthError);
      return res.redirect(`/builder?error=oauth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`/builder?error=invalid_callback`);
    }

    const stateData = pendingOAuthStates.get(state as string);
    if (!stateData) {
      return res.redirect(`/builder?error=invalid_state`);
    }

    // Remove the used state
    pendingOAuthStates.delete(state as string);

    // Get the callback URL
    const origin = `${req.protocol}://${req.get('host')}`;
    const callbackUrl = `${origin}/api/v1/google/callback`;

    const oauth2Client = await getOAuth2Client(callbackUrl);

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // If we have PRD content, create the Google Doc
    if (stateData.prdContent) {
      const docs = google.docs({ version: 'v1', auth: oauth2Client });

      // Create a new document
      const createResponse = await docs.documents.create({
        requestBody: {
          title: stateData.prdContent.overview?.name || stateData.projectName || 'Product Requirements Document'
        }
      });

      const documentId = createResponse.data.documentId;

      if (documentId) {
        // Build the document content
        const requests = buildDocumentRequests(stateData.prdContent, stateData.projectName);

        // Update the document with content
        await docs.documents.batchUpdate({
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
  } catch (error: any) {
    logger.error('Error in Google OAuth callback:', error);
    res.redirect(`/builder?error=oauth_failed`);
  }
});

// Helper function to build Google Docs API requests
function buildDocumentRequests(content: any, projectName?: string): any[] {
  const requests: any[] = [];
  let index = 1; // Start after the initial newline

  // Helper to insert text and move index
  const insertText = (text: string, bold = false, fontSize?: number, heading?: string) => {
    requests.push({
      insertText: {
        location: { index },
        text: text + '\n'
      }
    });

    const startIndex = index;
    const endIndex = index + text.length;

    if (bold || fontSize || heading) {
      const textStyle: any = {};
      if (bold) textStyle.bold = true;
      if (fontSize) textStyle.fontSize = { magnitude: fontSize, unit: 'PT' };

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
  const title = content.overview?.name || projectName || 'Product Requirements Document';
  insertText(title, true, 24, 'TITLE');

  // Description
  if (content.overview?.description) {
    insertText('');
    insertText(content.overview.description);
  }

  // Objectives
  if (content.overview?.objectives?.length > 0) {
    insertText('');
    insertText('Objectives', true, 18, 'HEADING_1');
    content.overview.objectives.forEach((obj: string, i: number) => {
      insertText(`${i + 1}. ${obj}`);
    });
  }

  // Features
  if (content.features?.length > 0) {
    insertText('');
    insertText('Features', true, 18, 'HEADING_1');
    content.features.forEach((feature: any) => {
      const priority = feature.priority ? ` [${feature.priority.toUpperCase()}]` : '';
      const points = feature.storyPoints ? ` (${feature.storyPoints} pts)` : '';
      insertText(`${feature.name}${priority}${points}`, true, 14, 'HEADING_2');

      if (feature.description) {
        insertText(feature.description);
      }

      if (feature.acceptanceCriteria) {
        insertText('Acceptance Criteria:', true);
        if (Array.isArray(feature.acceptanceCriteria)) {
          feature.acceptanceCriteria.forEach((ac: any) => {
            insertText(`• ${ac.text ?? ac}`);
          });
        } else {
          insertText(feature.acceptanceCriteria);
        }
      }
    });
  }

  // Target Users
  if (content.targetUsers?.length > 0) {
    insertText('');
    insertText('Target Users', true, 18, 'HEADING_1');
    content.targetUsers.forEach((user: any) => {
      insertText(user.persona, true, 14, 'HEADING_2');
      if (user.needs?.length > 0) {
        user.needs.forEach((need: string) => {
          insertText(`• ${need}`);
        });
      }
    });
  }

  // Data Model
  if (content.dataModel?.length > 0) {
    insertText('');
    insertText('Data Model', true, 18, 'HEADING_1');
    content.dataModel.forEach((entity: any) => {
      insertText(entity.entity, true, 14, 'HEADING_2');
      if (entity.attributes?.length > 0) {
        entity.attributes.forEach((attr: any) => {
          const required = attr.required ? ' (required)' : '';
          insertText(`• ${attr.name}: ${attr.type}${required}`);
        });
      }
    });
  }

  // API Endpoints
  if (content.apiEndpoints?.length > 0) {
    insertText('');
    insertText('API Endpoints', true, 18, 'HEADING_1');
    content.apiEndpoints.forEach((ep: any) => {
      insertText(`${ep.method} ${ep.path} - ${ep.description || ''}`);
    });
  }

  // Authentication
  if (content.authentication) {
    insertText('');
    insertText('Authentication', true, 18, 'HEADING_1');
    if (content.authentication.methods?.length > 0) {
      insertText('Methods:', true);
      content.authentication.methods.forEach((method: string) => {
        insertText(`• ${method}`);
      });
    }
    if (content.authentication.roles?.length > 0) {
      insertText('Roles:', true);
      content.authentication.roles.forEach((role: any) => {
        const perms = Array.isArray(role.permissions) ? role.permissions.join(', ') : role.permissions;
        insertText(`• ${role.name}: ${perms}`);
      });
    }
  }

  // Technical Requirements
  if (content.technicalRequirements) {
    insertText('');
    insertText('Technical Requirements', true, 18, 'HEADING_1');
    if (content.technicalRequirements.platforms?.length > 0) {
      insertText(`Platforms: ${content.technicalRequirements.platforms.join(', ')}`);
    }
    if (content.technicalRequirements.performance?.length > 0) {
      insertText('Performance:', true);
      content.technicalRequirements.performance.forEach((p: string) => {
        insertText(`• ${p}`);
      });
    }
    if (content.technicalRequirements.security?.length > 0) {
      insertText('Security:', true);
      content.technicalRequirements.security.forEach((s: string) => {
        insertText(`• ${s}`);
      });
    }
  }

  // Success Metrics
  if (content.successMetrics?.length > 0) {
    insertText('');
    insertText('Success Metrics', true, 18, 'HEADING_1');
    content.successMetrics.forEach((metric: string) => {
      insertText(`• ${metric}`);
    });
  }

  // Footer
  insertText('');
  insertText(`Generated on ${new Date().toLocaleDateString()}`);

  return requests;
}

export default router;
