import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LoggerFactory } from '../../logger';
import { createErrorResponse } from '../../types/api/response.types';

const logger = LoggerFactory.getLogger('AuthMiddleware');

// Define user interface for consistency
interface AuthUser {
  userId: number;
  email: string;
  roles: string[];
}

// Extend Request type locally
interface AuthenticatedRequest extends Request {
  user: AuthUser;
  _authenticatedUser?: AuthUser; // Special property to ensure data persists
  authenticatedUser?: AuthUser; // For compatibility with non-v1 middleware
}

/**
 * Authentication middleware for v1 API
 * Verifies JWT token and adds user info to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug('V1 Auth middleware called for path:', req.path);
    logger.debug('Full URL:', req.originalUrl);
    
    // Check if user is already authenticated by another middleware
    if (req.user) {
      logger.debug('User already authenticated by another middleware:', req.user);
      
      // Ensure the user object has the correct format
      const userObj = {
        userId: req.user.userId || (req.user as any).id,
        email: req.user.email || 'unknown',
        roles: Array.isArray(req.user.roles) ? req.user.roles : []
      };
      
      // Set user object on request in all possible locations
      (req as AuthenticatedRequest).user = userObj;
      (req as AuthenticatedRequest)._authenticatedUser = userObj;
      (req as AuthenticatedRequest).authenticatedUser = userObj;
      
      logger.debug('User object normalized and set on request:', userObj);
      return next();
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.debug('No authorization header');
      return res.status(401).json(createErrorResponse(
        'AUTH_MISSING_TOKEN',
        'Authentication token is required'
      ));
    }

    // Check Bearer token format
    const parts = authHeader.split(' ');
    logger.debug('Auth header parts:', parts.length);
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.debug('Invalid authorization format');
      return res.status(401).json(createErrorResponse(
        'AUTH_INVALID_FORMAT',
        'Invalid authorization format'
      ));
    }

    const token = parts[1];
    logger.debug('Token found, length:', token.length);
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json(createErrorResponse(
        'SERVER_CONFIG_ERROR',
        'Server configuration error'
      ));
    }

    // Verify JWT token
    logger.debug('Verifying token with secret length:', secret.length);
    try {
      const decoded = jwt.verify(token, secret);
      logger.debug('Token decoded successfully');
      const payload = typeof decoded === 'string' ? JSON.parse(decoded) : decoded;
      
      // Log the payload for debugging
      logger.debug('Token payload:', JSON.stringify(payload));
      
      // Ensure userId exists and is a valid number
      if (!payload.userId && payload.userId !== 0) {
        logger.error('Missing user ID in token payload');
        return res.status(401).json(createErrorResponse(
          'AUTH_MISSING_ID',
          'Missing user ID in authentication token'
        ));
      }
      
      // Ensure userId is a number
      const userId = Number(payload.userId);
      if (isNaN(userId) || userId <= 0) {
        logger.error(`Invalid user ID in token: ${payload.userId}, type: ${typeof payload.userId}`);
        return res.status(401).json(createErrorResponse(
          'AUTH_INVALID_ID',
          'Invalid user ID in authentication token'
        ));
      }
      
      // Create user object
      const userObject = {
        userId,
        email: payload.email || 'unknown',
        roles: Array.isArray(payload.roles) ? payload.roles : []
      };
      
      // Log the user object for debugging
      logger.debug('User object created from token:', JSON.stringify(userObject));
      
      // Set user object on request in all possible locations
      (req as AuthenticatedRequest).user = userObject;
      (req as AuthenticatedRequest)._authenticatedUser = userObject;
      (req as AuthenticatedRequest).authenticatedUser = userObject;
      
      // Also set it directly on req.user for compatibility
      req.user = userObject;
      
      logger.debug('Authenticated user:', userObject.email);
      logger.debug('User object set on request:', req.user);
      
      next();
    } catch (jwtError) {
      logger.error('Token verification failed:', jwtError);
      return res.status(401).json(createErrorResponse(
        'AUTH_INVALID_TOKEN',
        'Invalid or expired authentication token'
      ));
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Internal server error during authentication'
    ));
  }
};

/**
 * Validates that the user session is active and valid
 */
export const validateSession = (req: Request, res: Response, next: NextFunction) => {
  // In a real implementation, this might check if the user's session is still valid
  // For now, we'll just pass through since the JWT validation is sufficient
  logger.debug('validateSession: Checking for _authenticatedUser');
  const authReq = req as AuthenticatedRequest;
  if (authReq._authenticatedUser) {
    logger.debug('validateSession: Found _authenticatedUser:', authReq._authenticatedUser);
    // Ensure user is also set in the standard location
    authReq.user = authReq._authenticatedUser;
  }
  next();
};

/**
 * Loads additional user data if needed
 */
export const loadUserData = (req: Request, res: Response, next: NextFunction) => {
  // In a real implementation, this might load additional user data from the database
  // For now, we'll just pass through since the JWT contains basic user info
  logger.debug('loadUserData: Checking for _authenticatedUser');
  const authReq = req as AuthenticatedRequest;
  if (authReq._authenticatedUser) {
    logger.debug('loadUserData: Found _authenticatedUser:', authReq._authenticatedUser);
    // Ensure user is also set in the standard location
    authReq.user = authReq._authenticatedUser;
  }
  next();
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;
    
    if (!user) {
      return res.status(401).json(createErrorResponse(
        'AUTH_REQUIRED',
        'Authentication required'
      ));
    }
    
    const hasRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      logger.warn(`User ${user.userId} attempted to access protected resource. Required roles: ${allowedRoles}, User roles: ${user.roles}`);
      return res.status(403).json(createErrorResponse(
        'AUTH_FORBIDDEN',
        'Insufficient permissions'
      ));
    }
    
    next();
  };
};