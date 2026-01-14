import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { UserService } from '../../services/user.service';
import { mockUsers } from '../utils/test-utils';

// Mock the UserService
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

// Create a simple users router for testing
const createUsersRouter = () => {
  const router = Router();
  
  // Get all users
  router.get('/', async (req, res) => {
    try {
      const users = await UserService.getUsers();
      res.json(createSuccessResponse(users));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'SERVER_ERROR',
        error instanceof Error ? error.message : 'Failed to get users'
      ));
    }
  });
  
  // Get user by ID
  router.get('/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json(createErrorResponse(
          'NOT_FOUND',
          'User not found'
        ));
      }
      res.json(createSuccessResponse(user));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'SERVER_ERROR',
        error instanceof Error ? error.message : 'Failed to get user'
      ));
    }
  });
  
  // Create user
  router.post('/', async (req, res) => {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json(createSuccessResponse(user));
    } catch (error) {
      res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        error instanceof Error ? error.message : 'Failed to create user'
      ));
    }
  });
  
  return router;
};

describe('Users API', () => {
  let app: express.Application;
  let usersRouter: Router;

  beforeEach(() => {
    // Create a new Express app for each test
    app = express();
    app.use(express.json());
    usersRouter = createUsersRouter();
    app.use('/users', usersRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      // Mock the UserService.getUsers method
      const mockUsersList = mockUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      (UserService.getUsers as jest.Mock).mockResolvedValue(mockUsersList);

      // Make the request
      const response = await request(app).get('/users');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('email', 'test@example.com');
      expect(response.body.data[1]).toHaveProperty('email', 'admin@example.com');
      expect(UserService.getUsers).toHaveBeenCalled();
    });

    it('should return 500 when there is a server error', async () => {
      // Mock the UserService.getUsers method to throw an error
      (UserService.getUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Make the request
      const response = await request(app).get('/users');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'SERVER_ERROR');
      expect(response.body.error).toHaveProperty('message', 'Database error');
      expect(UserService.getUsers).toHaveBeenCalled();
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      // Mock the UserService.getUserById method
      const mockUser = mockUsers[0];
      const { password, ...userWithoutPassword } = mockUser;
      
      (UserService.getUserById as jest.Mock).mockResolvedValue(userWithoutPassword);

      // Make the request
      const response = await request(app).get('/users/1');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
      expect(response.body.data).toHaveProperty('firstName', 'Test');
      expect(response.body.data).toHaveProperty('lastName', 'User');
      expect(response.body.data).not.toHaveProperty('password');
      expect(UserService.getUserById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when user is not found', async () => {
      // Mock the UserService.getUserById method to return null
      (UserService.getUserById as jest.Mock).mockResolvedValue(null);

      // Make the request
      const response = await request(app).get('/users/999');

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'User not found');
      expect(UserService.getUserById).toHaveBeenCalledWith(999);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      // Mock the UserService.createUser method
      const mockUser = mockUsers[0];
      const { password, ...userWithoutPassword } = mockUser;
      
      (UserService.createUser as jest.Mock).mockResolvedValue(userWithoutPassword);

      // Make the request
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        roles: ['User']
      };
      
      const response = await request(app)
        .post('/users')
        .send(userData);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
      expect(response.body.data).not.toHaveProperty('password');
      expect(UserService.createUser).toHaveBeenCalledWith(userData);
    });

    it('should return 400 when validation fails', async () => {
      // Mock the UserService.createUser method to throw an error
      (UserService.createUser as jest.Mock).mockRejectedValue(new Error('Email is required'));

      // Make the request
      const response = await request(app)
        .post('/users')
        .send({
          firstName: 'Invalid',
          lastName: 'User'
        });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('message', 'Email is required');
      expect(UserService.createUser).toHaveBeenCalled();
    });
  });
}); 