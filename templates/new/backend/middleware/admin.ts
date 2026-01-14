import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authenticatedReq = req as AuthenticatedRequest;
  
  if (!authenticatedReq.authenticatedUser) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!authenticatedReq.authenticatedUser.roles?.includes('Site Admin')) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}; 