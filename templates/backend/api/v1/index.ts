import { Router, Request, Response, NextFunction } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import companiesRouter from './companies';
import healthRouter from './health';
import dashboardRouter from './dashboard';
import activityRouter from './activity';
import logsRouter from './logs';


import messagesRouter from './messages';
import siteSettingsRouter from './site-settings';
import usageRouter from './usage';

import signupRouter from './signup';
import emailsRouter from './emails';
import impersonationRouter from './impersonation';
import googleRouter from './google';
import paymentsRouter from './payments';
import transactionsRouter from './transactions';
import { trackApiUsage, trackApiErrors } from '../../middleware/v1/stats.middleware';
import { LoggerFactory } from '../../logger';
import { validateSession, loadUserData } from '../../middleware/v1/auth.middleware';

const logger = LoggerFactory.getLogger('ApiRouter');

// Use mergeParams to inherit request properties from parent router
const router = Router({ mergeParams: true });

// Add API usage tracking middleware
router.use(trackApiUsage);

// Add request logging middleware
router.use((req: Request, res: Response, next: NextFunction) => {
  logger.debug(`API request: ${req.method} ${req.originalUrl}, params: ${JSON.stringify(req.params)}`);
  next();
});

// Mount auth routes before authentication middleware
logger.debug('Mounting auth routes at /auth');
router.use('/auth', authRouter);

// Mount signup routes before authentication middleware (public endpoint)
logger.debug('Mounting signup routes at /signup');
router.use('/signup', signupRouter);

// Mount site settings routes before authentication middleware (handles its own auth)
logger.debug('Mounting site settings routes at /site-settings');
router.use('/site-settings', siteSettingsRouter);


// Mount Google routes before authentication middleware (OAuth callback needs to work without auth)
logger.debug('Mounting Google routes at /google');
router.use('/google', googleRouter);

// Mount payments routes before authentication middleware (signup payment flow needs public access)
logger.debug('Mounting payments routes at /payments');
router.use('/payments', paymentsRouter);

// Add middleware to ensure user data is preserved across requests
// Skip auth middleware for auth routes
router.use((req: Request, res: Response, next: NextFunction) => {
  logger.debug(`[Middleware] Path check: ${req.path}, OriginalUrl: ${req.originalUrl}`);
  if (req.path.startsWith('/auth') || req.path.startsWith('/signup') || req.originalUrl.includes('/site-settings/public') || req.path.startsWith('/google/callback') || req.path.startsWith('/google/status') || req.path.startsWith('/payments')) {
    return next();
  }
  validateSession(req, res, next);
});

// Add middleware to load user data
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/signup') || req.originalUrl.includes('/site-settings/public') || req.path.startsWith('/google/callback') || req.path.startsWith('/google/status') || req.path.startsWith('/payments')) {
    return next();
  }
  loadUserData(req, res, next);
});

// Add middleware to normalize user object format
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    logger.debug(`Normalizing user object: ${JSON.stringify(req.user)}`);
    
    // Normalize user object format
    const normalizedUser = {
      userId: req.user.userId || (req.user as any).id || (req.user as any).authenticatedUser?.userId,
      email: req.user.email || (req.user as any).authenticatedUser?.email || 'unknown',
      roles: Array.isArray(req.user.roles) 
        ? req.user.roles 
        : (Array.isArray((req.user as any).authenticatedUser?.roles) 
            ? (req.user as any).authenticatedUser.roles 
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
router.use('/users', usersRouter);

logger.debug('Mounting companies routes at /companies');
router.use('/companies', companiesRouter);

logger.debug('Mounting health routes at /health');
router.use('/health', healthRouter);

logger.debug('Mounting dashboard routes at /dashboard');
router.use('/dashboard', dashboardRouter);

logger.debug('Mounting activity routes at /activity');
router.use('/activity', activityRouter);

logger.debug('Mounting logs routes at /logs');
router.use('/logs', logsRouter);


logger.debug('Mounting impersonation routes at /admin');
router.use('/admin', impersonationRouter);

logger.debug('Mounting messages routes at /messages');
router.use('/messages', messagesRouter);


// Site settings moved to valid session bypass block

logger.debug('Mounting usage routes at /usage');
router.use('/usage', usageRouter);

logger.debug('Mounting emails routes at /emails');
router.use('/emails', emailsRouter);

logger.debug('Mounting transactions routes at /transactions');
router.use('/transactions', transactionsRouter);

// Add API error tracking middleware
router.use(trackApiErrors);

logger.info('All API routes mounted successfully');

export default router; 