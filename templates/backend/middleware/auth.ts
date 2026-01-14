import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LoggerFactory } from '../logger';

export interface UserPayload {
  userId: number;
  email: string;
  roles: string[];
}

export type AuthenticatedRequest = Request & {
  authenticatedUser: UserPayload;
  user?: UserPayload; // Add user property for compatibility with v1 API
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const logger = LoggerFactory.getLogger('AuthMiddleware');
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as UserPayload;
    
    // Set both authenticatedUser and user properties for compatibility
    (req as AuthenticatedRequest).authenticatedUser = decoded;
    (req as AuthenticatedRequest).user = decoded;
    
    // Also set directly on req.user for maximum compatibility
    req.user = decoded;
    
    logger.debug('Auth middleware: User object set on request:', req.user);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}; 