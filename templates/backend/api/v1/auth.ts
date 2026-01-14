import { Router, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { hash } from 'bcrypt';
import { UserService } from '../../services/user.service';
import { EmailService } from '../../services/email.service';
import { LoginDto } from '../../types/user.types';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';

const router = Router();
const logger = LoggerFactory.getLogger('AuthAPI');

const APP_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';

// Middleware to log auth endpoint requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Auth endpoint accessed: ${req.method} ${req.path}`);
  next();
});


router.post('/login', async (req: Request<{}, {}, LoginDto>, res: Response) => {
  try {
    logger.debug('Login attempt - Headers:', JSON.stringify(req.headers));
    logger.debug('Login attempt for:', req.body.email);
    logger.debug('Request body:', JSON.stringify(req.body));
    
    const loginResponse = await UserService.login(req.body);
    
    logger.debug('Login successful for:', req.body.email);
    logger.debug('Token generated with length:', loginResponse.token.length);
    
    res.json(createSuccessResponse({
      token: loginResponse.token,
      user: loginResponse.user
    }));
  } catch (error) {
    logger.error('Login failed for user:', req.body.email);
    logger.error('Login error details:', error);
    
    res.status(401).json(createErrorResponse(
      'AUTH_FAILED',
      error instanceof Error ? error.message : 'Login failed'
    ));
  }
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Email is required'));
    }

    logger.info(`Password reset requested for: ${email}`);

    // Find user by email
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      logger.debug(`Password reset requested for non-existent email: ${email}`);
      return res.json(createSuccessResponse({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      }));
    }

    // Generate secure reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to database
    await db.update(users)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // Send email
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
    
    await EmailService.send({
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

    return res.json(createSuccessResponse({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    }));
  } catch (error) {
    logger.error('Error in forgot-password:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to process password reset request'));
  }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Token and password are required'));
    }

    if (password.length < 8) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Password must be at least 8 characters'));
    }

    // Find user with valid token
    const [user] = await db.select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          gt(users.resetPasswordExpires, new Date())
        )
      );

    if (!user) {
      logger.warn(`Invalid or expired reset token attempted`);
      return res.status(400).json(createErrorResponse('INVALID_TOKEN', 'Invalid or expired reset token'));
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update password and clear reset token
    await db.update(users)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    logger.info(`Password reset successful for user: ${user.email}`);

    return res.json(createSuccessResponse({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    }));
  } catch (error) {
    logger.error('Error in reset-password:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to reset password'));
  }
});


logger.info('All auth routes mounted successfully');

export default router; 