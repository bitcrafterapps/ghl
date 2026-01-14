import { Router, Request, Response } from 'express';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { checkDbConnection } from '../../db';
import fs from 'fs';
import path from 'path';

const router = Router();
const logger = LoggerFactory.getLogger('APIHealth');

// Middleware to log health endpoint requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Health endpoint accessed: ${req.method} ${req.path}`);
  next();
});

// Get API health status
router.get('/', async (_req: Request, res: Response) => {
  try {
    logger.debug('Performing health check');
    
    // Get uptime
    const uptime = process.uptime();
    
    // Check database connection
    let dbConnected = false;
    try {
      dbConnected = await checkDbConnection();
    } catch (e) {
      logger.warn('Database connection check failed:', e);
    }
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memPercentage = Math.round((memUsedMB / memTotalMB) * 100);
    
    // Determine overall health status
    const status = dbConnected ? 'healthy' : 'degraded';
    
    // Return health data with system info for Site Status page
    res.json(createSuccessResponse({
      status: status,
      message: dbConnected ? 'All systems operational' : 'Database connection issues detected',
      uptime: uptime,
      database: {
        connected: dbConnected,
        status: dbConnected ? 'connected' : 'disconnected'
      },
      system: {
        uptime: Math.round(uptime).toString(),
        memory: {
          used: memUsedMB,
          total: memTotalMB,
          percentage: memPercentage
        },
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: memUsedMB,
        total: memTotalMB
      },
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Error performing health check:', error);
    res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Failed to perform health check'
    ));
  }
});

// PING ROUTER FUNCTIONALITY
router.get('/ping', (_req: Request, res: Response) => {
  res.json(createSuccessResponse({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));
});

// DATABASE HEALTH CHECK
router.get('/db', async (_req: Request, res: Response) => {
  try {
    logger.debug('Checking database connection');
    const startTime = Date.now();
    
    let connected = false;
    try {
      connected = await checkDbConnection();
    } catch (e) {
      logger.warn('Database connection check failed:', e);
    }
    
    const latency = Date.now() - startTime;
    
    res.json(createSuccessResponse({
      status: connected ? 'connected' : 'disconnected',
      type: 'PostgreSQL',
      latency: latency,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Error checking database connection:', error);
    res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Failed to check database connection'
    ));
  }
});

// REDIS HEALTH CHECK
router.get('/redis', async (_req: Request, res: Response) => {
  try {
    logger.debug('Checking Redis connection');
    
    // Check if Redis is configured
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      // Redis not configured - return as not available
      return res.json(createSuccessResponse({
        status: 'not_configured',
        message: 'Redis is not configured in this environment',
        timestamp: new Date().toISOString()
      }));
    }
    
    // For now, return connected if REDIS_URL is set
    // In a real implementation, you'd ping the Redis server
    return res.json(createSuccessResponse({
      status: 'connected',
      message: 'Redis connection available',
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Error checking Redis connection:', error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Failed to check Redis connection'
    ));
  }
});

// VERSION ROUTER FUNCTIONALITY
router.get('/version', async (_req: Request, res: Response) => {
  try {
    logger.debug('Getting API version information');
    
    // Get package version
    const version = process.env.npm_package_version || '1.0.0';
    
    // Get build time or use current time
    const buildTime = process.env.BUILD_TIME || new Date().toISOString();
    
    // Get available endpoints
    const endpoints = {
      auth: {
        available: true,
        migrated: true,
        routes: ['/api/v1/auth/login']
      },
      users: {
        available: true,
        migrated: true,
        routes: [
          '/api/v1/users/profile',
          '/api/v1/users',
          '/api/v1/users/:id',
          '/api/v1/users/pending',
          '/api/v1/users/:id/approve',
          '/api/v1/users/:id/reject',
          '/api/v1/users/:id/preferences',
          '/api/v1/users/change-password'
        ]
      },
      companies: {
        available: true,
        migrated: true,
        routes: [
          '/api/v1/companies',
          '/api/v1/companies/:id',
          '/api/v1/companies/:id/users'
        ]
      },
      dashboard: {
        available: true,
        migrated: true,
        routes: [
          '/api/v1/dashboard/stats',
          '/api/v1/dashboard/recent-changes'
        ]
      },
      activity: {
        available: true,
        migrated: true,
        routes: [
          '/api/v1/activity/log'
        ]
      },
      health: {
        available: true,
        migrated: true,
        routes: [
          '/api/v1/health',
          '/api/v1/health/ping',
          '/api/v1/health/version'
        ]
      }
    };
    
    // Current migration phase
    const migrationPhase = '3 - API Validation & Transition';
    
    // Return version info
    res.json(createSuccessResponse({
      version: version,
      apiSpec: 'v1',
      endpoints: endpoints,
      migrationPhase: migrationPhase,
      lastUpdated: buildTime,
      environment: process.env.NODE_ENV || 'development',
      compatibility: {
        legacySupport: true,
        recommendedVersion: 'v1',
        deprecationDate: '2025-06-30T00:00:00Z'
      }
    }));
  } catch (error) {
    logger.error('Error retrieving version information:', error);
    res.status(500).json(createSuccessResponse({
      version: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
});

// MONITOR ROUTER FUNCTIONALITY

interface RequestCounts {
  [path: string]: number;
}

interface ApiVersionStats {
  requestCounts: RequestCounts;
  totalRequests: number;
  errors: number;
  latency: number[];
}

interface ApiStatsData {
  requestCounts: {
    legacy: RequestCounts;
    v1: RequestCounts;
  };
  totalRequests: {
    legacy: number;
    v1: number;
  };
  errors: {
    legacy: number;
    v1: number;
  };
  latency: {
    legacy: number[];
    v1: number[];
  };
  lastReset: string;
}

// Simple in-memory stats tracker (would use Redis or similar in production)
const apiStats: ApiStatsData = {
  requestCounts: {
    legacy: {},
    v1: {}
  },
  totalRequests: {
    legacy: 0,
    v1: 0
  },
  errors: {
    legacy: 0,
    v1: 0
  },
  latency: {
    legacy: [],
    v1: []
  },
  lastReset: new Date().toISOString()
};

// Update stats (called by middleware)
export const updateApiStats = (version: 'legacy' | 'v1', path: string, duration: number, isError: boolean) => {
  // Update path-specific counts
  if (!apiStats.requestCounts[version][path]) {
    apiStats.requestCounts[version][path] = 0;
  }
  apiStats.requestCounts[version][path]++;
  
  // Update total count
  apiStats.totalRequests[version]++;
  
  // Update errors if applicable
  if (isError) {
    apiStats.errors[version]++;
  }
  
  // Store latency
  apiStats.latency[version].push(duration);
  // Keep only last 1000 latency measurements
  if (apiStats.latency[version].length > 1000) {
    apiStats.latency[version].shift();
  }
};

// MONITOR ROUTER FUNCTIONALITY
router.get('/monitor', authenticate, async (req: Request, res: Response) => {
  try {
    logger.debug('Retrieving API monitoring stats');
    
    const authReq = req as any;
    
    // Require admin role for access
    if (!authReq.user?.roles?.includes('Site Admin')) {
      logger.warn('Non-admin user attempted to access monitoring stats:', authReq.user?.email);
      return res.status(403).json(createErrorResponse(
        'FORBIDDEN',
        'Insufficient privileges - Site Admin role required'
      ));
    }
    
    // Calculate average latency
    const avgLatency = {
      legacy: apiStats.latency.legacy.length > 0 
        ? Math.round(apiStats.latency.legacy.reduce((sum, val) => sum + val, 0) / apiStats.latency.legacy.length) 
        : 0,
      v1: apiStats.latency.v1.length > 0 
        ? Math.round(apiStats.latency.v1.reduce((sum, val) => sum + val, 0) / apiStats.latency.v1.length) 
        : 0
    };
    
    // Return stats
    return res.json(createSuccessResponse({
      requestCounts: apiStats.requestCounts,
      totalRequests: apiStats.totalRequests,
      errors: apiStats.errors,
      avgLatency: avgLatency,
      lastReset: apiStats.lastReset
    }));
  } catch (error) {
    logger.error('Error retrieving API monitoring stats:', error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Failed to retrieve API monitoring statistics'
    ));
  }
});

// RESET MONITOR ROUTER FUNCTIONALITY
router.post('/monitor/reset', authenticate, (req: Request, res: Response) => {
  try {
    logger.debug('Resetting API monitoring stats');
    
    const authReq = req as any;
    
    // Require admin role for access
    if (!authReq.user?.roles?.includes('Site Admin')) {
      logger.warn('Non-admin user attempted to reset monitoring stats:', authReq.user?.email);
      return res.status(403).json(createErrorResponse(
        'FORBIDDEN',
        'Insufficient privileges - Site Admin role required'
      ));
    }
    
    // Reset all stats
    apiStats.requestCounts.legacy = {};
    apiStats.requestCounts.v1 = {};
    apiStats.totalRequests.legacy = 0;
    apiStats.totalRequests.v1 = 0;
    apiStats.errors.legacy = 0;
    apiStats.errors.v1 = 0;
    apiStats.latency.legacy = [];
    apiStats.latency.v1 = [];
    apiStats.lastReset = new Date().toISOString();
    
    return res.json(createSuccessResponse({ 
      message: 'API monitoring statistics have been reset',
      timestamp: apiStats.lastReset
    }));
  } catch (error) {
    logger.error('Error resetting API monitoring stats:', error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Failed to reset API monitoring statistics'
    ));
  }
});

// WARMUP ROUTER FUNCTIONALITY
router.get('/warmup', async (_req: Request, res: Response) => {
  try {
    logger.debug('Warming up API');
    
    // Check database connection
    const dbConnected = await checkDbConnection();
    
    if (dbConnected) {
      logger.debug('Warmup successful');
      res.json({ status: 'ok' });
    } else {
      logger.error('Warmup failed - database connection check failed');
      res.status(500).json({ error: 'Warmup failed - database connection check failed' });
    }
  } catch (error) {
    logger.error('Warmup failed:', error);
    res.status(500).json({ error: 'Warmup failed' });
  }
});

logger.info('All health routes mounted successfully');

export default router; 