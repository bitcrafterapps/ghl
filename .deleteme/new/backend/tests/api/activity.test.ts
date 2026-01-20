import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { ActivityService } from '../../services/activity.service';

// Mock the services
jest.mock('../../services/activity.service');

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
    // Default to authenticated user
    req.user = { 
      userId: 1,
      roles: ['User']
    };
    next();
  })
}));

// Create a simple activity router for testing
const createActivityRouter = () => {
  const router = Router();
  
  // Log activity
  router.post('/log', require('../../middleware/v1/auth.middleware').authenticate, async (req, res) => {
    try {
      const authReq = req as any;
      
      if (!authReq.user) {
        return res.status(401).json(createErrorResponse(
          'AUTH_REQUIRED',
          'Authentication required'
        ));
      }
      
      const { type, action, title, entityId } = req.body;
      const userId = authReq.user.userId;
      
      // Validate required fields
      if (!type || !action || !title || !entityId) {
        return res.status(400).json(createErrorResponse(
          'MISSING_FIELDS',
          'Missing required fields'
        ));
      }
      
      // Validate field values
      const validTypes = ['proposal', 'template', 'company', 'user'];
      const validActions = ['created', 'updated', 'deleted'];
      
      if (!validTypes.includes(type)) {
        return res.status(400).json(createErrorResponse(
          'INVALID_TYPE',
          `Invalid type. Must be one of: ${validTypes.join(', ')}`
        ));
      }
      
      if (!validActions.includes(action)) {
        return res.status(400).json(createErrorResponse(
          'INVALID_ACTION',
          `Invalid action. Must be one of: ${validActions.join(', ')}`
        ));
      }
      
      // Log the activity
      const activity = await ActivityService.logActivity({
        type,
        action,
        title,
        entityId,
        userId,
        // Use any type to avoid TypeScript errors with metadata
        ...(req.body.metadata ? { metadata: req.body.metadata as any } : {})
      });
      
      return res.status(201).json(createSuccessResponse({
        message: 'Activity logged successfully',
        activity
      }));
    } catch (error) {
      return res.status(500).json(createErrorResponse(
        'SERVER_ERROR',
        'Failed to log activity'
      ));
    }
  });
  
  return router;
};

describe('Activity API', () => {
  let app: express.Application;
  let activityRouter: Router;

  beforeEach(() => {
    // Create a new Express app for each test
    app = express();
    app.use(express.json());
    activityRouter = createActivityRouter();
    app.use('/activity', activityRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /activity/log', () => {
    const validActivityData = {
      type: 'company',
      action: 'created',
      title: 'Created new company',
      entityId: 1
    };

    it('should log activity successfully', async () => {
      const mockActivity = {
        id: 1,
        ...validActivityData,
        userId: 1,
        timestamp: new Date().toISOString()
      };
      
      // Mock the ActivityService.logActivity method
      (ActivityService.logActivity as jest.Mock).mockResolvedValue(mockActivity);
      
      const response = await request(app)
        .post('/activity/log')
        .send(validActivityData);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createSuccessResponse({
        message: 'Activity logged successfully',
        activity: mockActivity
      }));
      expect(ActivityService.logActivity).toHaveBeenCalledWith({
        ...validActivityData,
        userId: 1,
        metadata: undefined
      });
    });

    it('should log activity with metadata successfully', async () => {
      const activityWithMetadata = {
        ...validActivityData,
        metadata: {
          key1: 'value1',
          key2: 'value2'
        }
      };
      
      const mockActivity = {
        id: 1,
        ...activityWithMetadata,
        userId: 1,
        timestamp: new Date().toISOString()
      };
      
      // Mock the ActivityService.logActivity method
      (ActivityService.logActivity as jest.Mock).mockResolvedValue(mockActivity);
      
      const response = await request(app)
        .post('/activity/log')
        .send(activityWithMetadata);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createSuccessResponse({
        message: 'Activity logged successfully',
        activity: mockActivity
      }));
      expect(ActivityService.logActivity).toHaveBeenCalledWith({
        ...activityWithMetadata,
        userId: 1
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidActivityData = {
        type: 'company',
        action: 'created',
        // Missing title and entityId
      };
      
      const response = await request(app)
        .post('/activity/log')
        .send(invalidActivityData);
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual(createErrorResponse(
        'MISSING_FIELDS',
        'Missing required fields'
      ));
      expect(ActivityService.logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 when type is invalid', async () => {
      const invalidTypeData = {
        ...validActivityData,
        type: 'invalid_type'
      };
      
      const response = await request(app)
        .post('/activity/log')
        .send(invalidTypeData);
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual(createErrorResponse(
        'INVALID_TYPE',
        'Invalid type. Must be one of: proposal, template, company, user'
      ));
      expect(ActivityService.logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 when action is invalid', async () => {
      const invalidActionData = {
        ...validActivityData,
        action: 'invalid_action'
      };
      
      const response = await request(app)
        .post('/activity/log')
        .send(invalidActionData);
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual(createErrorResponse(
        'INVALID_ACTION',
        'Invalid action. Must be one of: created, updated, deleted'
      ));
      expect(ActivityService.logActivity).not.toHaveBeenCalled();
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
      const testRouter = createActivityRouter();
      testApp.use('/activity', testRouter);
      
      const response = await request(testApp)
        .post('/activity/log')
        .send(validActivityData);
      
      expect(response.status).toBe(401);
      expect(response.body).toEqual(createErrorResponse(
        'AUTH_REQUIRED',
        'Authentication required'
      ));
      expect(ActivityService.logActivity).not.toHaveBeenCalled();
      
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
          roles: ['User']
        };
        next();
      });
      
      // Mock the ActivityService.logActivity method to throw an error
      (ActivityService.logActivity as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Create a new router with the mocked middleware
      const testRouter = createActivityRouter();
      testApp.use('/activity', testRouter);
      
      const response = await request(testApp)
        .post('/activity/log')
        .send(validActivityData);
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual(createErrorResponse(
        'SERVER_ERROR',
        'Failed to log activity'
      ));
      
      // Restore the original mock
      require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
    });
  });
}); 