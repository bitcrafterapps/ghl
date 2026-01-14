import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../logger';
import { updateApiStats } from '../../api/v1/health';

const logger = new Logger('StatsMiddleware');

/**
 * Middleware to track API usage statistics
 * Measures response times and records request/error counts
 */
export const trackApiUsage = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const path = req.originalUrl.split('?')[0]; // Remove query parameters
  
  // Determine if this is a v1 API request or legacy
  const isV1 = path.includes('/api/v1/');
  const version = isV1 ? 'v1' : 'legacy';
  
  // Store original end method to intercept it
  const originalEnd = res.end;
  
  // Override end method to capture response metrics
  // @ts-ignore - Correctly handle res.end override
  res.end = function(chunk: any, encoding: BufferEncoding, cb?: () => void) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;
    
    // Log response time
    logger.debug(`${req.method} ${path} ${statusCode} ${responseTime}ms`);
    
    // Update stats
    try {
      updateApiStats(version, path, responseTime, isError);
    } catch (error) {
      logger.error('Failed to update API stats:', error);
    }
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};

/**
 * Middleware to track API errors
 * Captures detailed error information
 */
export const trackApiErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`API Error: ${req.method} ${req.originalUrl}`, err);
  
  // Continue to next error handler
  next(err);
};

export default { trackApiUsage, trackApiErrors }; 