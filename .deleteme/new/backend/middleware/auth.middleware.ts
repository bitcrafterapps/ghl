import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Logger } from '../logger';
import { publicRoutes } from './public.routes';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        roles: string[];
        impersonatorId?: number;
      };
    }
  }
}

const logger = new Logger('AuthMiddleware');

export function isPublicRoute(url: string): boolean {
  // Use the centralized public routes list
  return publicRoutes.some(route => url.startsWith(route));
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log what path we're processing
    logger.debug('Auth middleware called for path:', req.path);
    
    // Skip auth for public routes
    if (isPublicRoute(req.originalUrl)) {
      return next();
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: {
          code: 'NO_AUTH_HEADER',
          message: 'No authorization header provided'
        }
      });
    }
    
    // Split the header and check format
    const parts = authHeader.split(' ');
    logger.debug('Auth header parts:', parts.length);
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: {
          code: 'INVALID_AUTH_FORMAT',
          message: 'Invalid authorization format'
        }
      });
    }
    
    const token = parts[1];
    logger.debug('Token found, length:', token.length);
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        error: {
          code: 'SERVER_CONFIG_ERROR',
          message: 'Server configuration error'
        }
      });
    }
    
    logger.debug('Verifying token with secret length:', secret.length);
    
    // Verify JWT token
    const decoded = jwt.verify(token, secret);
    logger.debug('Token decoded successfully');
    const payload = typeof decoded === 'string' ? JSON.parse(decoded) : decoded;
    logger.debug('Token payload:', payload);
    
    // Create a user object with the necessary information
    const userObj = {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles || [],
      impersonatorId: payload.impersonatorId
    };
    
    // Directly attach to the request object
    req.user = userObj;
    
    logger.debug('User object set on request:', req.user);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      });
    }
    
    return res.status(500).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error'
      }
    });
  }
}; 