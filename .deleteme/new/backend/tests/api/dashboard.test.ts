import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { DashboardService } from '../../services/dashboard.service';
import { UserService } from '../../services/user.service';

// Mock the services
jest.mock('../../services/dashboard.service');
jest.mock('../../services/user.service');

// Mock the response format
const createSuccessResponse = (data: any) => ({
  success: true,
  data
});

const createErrorResponse = (code: string, message: string) => ({
  success: false,
  error: {
    code,
    message
  }
});

// Mock the authenticate middleware
jest.mock('../../middleware/v1/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    // Default to authenticated user with Site Admin role
    req.user = { 
      userId: 1,
      roles: ['Site Admin']
    };
    next();
  })
}));

// Create a simple dashboard router for testing
const createDashboardRouter = () => {
  const router = Router();
  
  // Get dashboard stats
  router.get('/stats', require('../../middleware/v1/auth.middleware').authenticate, async (req, res) => {
    try {
      const authReq = req as any;
      
      if (!authReq.user) {
        return res.status(401).json(createErrorResponse(
          'AUTH_REQUIRED',
          'Authentication required'
        ));
      }
      
      const isSiteAdmin = authReq.user.roles?.includes('Site Admin') ?? false;
      
      const stats = await DashboardService.getDashboardStats(
        authReq.user.userId,
        isSiteAdmin
      );
      
      return res.json(createSuccessResponse(stats));
    } catch (error) {
      return res.status(500).json(createErrorResponse(
        'SERVER_ERROR',
        'Failed to fetch dashboard statistics'
      ));
    }
  });
  
  return router;
};

describe('Dashboard API', () => {
  let app: express.Application;
  let dashboardRouter: Router;

  beforeEach(() => {
    // Create a new Express app for each test
    app = express();
    app.use(express.json());
    dashboardRouter = createDashboardRouter();
    app.use('/dashboard', dashboardRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /dashboard/stats', () => {
    it('should return dashboard stats for site admin user', async () => {
      const mockStats = {
        users: 10,
        companies: 5
      };
      
      // Mock the DashboardService.getDashboardStats method
      (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue(mockStats);
      
      const response = await request(app).get('/dashboard/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(createSuccessResponse(mockStats));
      expect(DashboardService.getDashboardStats).toHaveBeenCalledWith(1, true);
    });

    it('should return empty stats for non-admin user', async () => {
      // Create a new app with a router that uses the non-admin middleware
      const testApp = express();
      testApp.use(express.json());
      
      // Override the default mock to make the user a non-admin
      const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
      require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
        req.user = { 
          userId: 2,
          roles: ['User']
        };
        next();
      });
      
      const mockStats = {
        users: null,
        companies: null
      };
      
      // Mock the DashboardService.getDashboardStats method
      (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue(mockStats);
      
      // Create a new router with the mocked middleware
      const testRouter = createDashboardRouter();
      testApp.use('/dashboard', testRouter);
      
      const response = await request(testApp).get('/dashboard/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(createSuccessResponse(mockStats));
      expect(DashboardService.getDashboardStats).toHaveBeenCalledWith(2, false);
      
      // Restore the original mock
      require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
    });

    it('should return 401 when user is not authenticated', async () => {
      // Create a new app with a router that uses the unauthenticated middleware
      const testApp = express();
      testApp.use(express.json());
      
      // Override the default mock to make the user unauthenticated
      const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
      require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
        // Don't set req.user to simulate unauthenticated request
        return res.status(401).json(createErrorResponse(
          'AUTH_REQUIRED',
          'Authentication required'
        ));
      });
      
      // Create a new router with the mocked middleware
      const testRouter = createDashboardRouter();
      testApp.use('/dashboard', testRouter);
      
      const response = await request(testApp).get('/dashboard/stats');
      
      expect(response.status).toBe(401);
      expect(response.body).toEqual(createErrorResponse(
        'AUTH_REQUIRED',
        'Authentication required'
      ));
      expect(DashboardService.getDashboardStats).not.toHaveBeenCalled();
      
      // Restore the original mock
      require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
    });

    it('should return 500 when there is a server error', async () => {
      // Create a new app with a router that uses the authenticated middleware
      const testApp = express();
      testApp.use(express.json());
      
      // Make sure we're using the default authentication that allows access
      const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
      require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
        req.user = { 
          userId: 1,
          roles: ['Site Admin']
        };
        next();
      });
      
      // Mock the DashboardService.getDashboardStats method to throw an error
      (DashboardService.getDashboardStats as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Create a new router with the mocked middleware
      const testRouter = createDashboardRouter();
      testApp.use('/dashboard', testRouter);
      
      const response = await request(testApp).get('/dashboard/stats');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual(createErrorResponse(
        'SERVER_ERROR',
        'Failed to fetch dashboard statistics'
      ));
      
      // Restore the original mock
      require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
    });
  });
});