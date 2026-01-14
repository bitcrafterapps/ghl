import request from 'supertest';
import express from 'express';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
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

// Create a simple auth router for testing
const createAuthRouter = () => {
  const router = express.Router();
  
  router.post('/login', async (req, res) => {
    try {
      const loginResponse = await UserService.login(req.body);
      res.json(createSuccessResponse(loginResponse));
    } catch (error) {
      res.status(401).json(createErrorResponse(
        'AUTH_FAILED',
        error instanceof Error ? error.message : 'Login failed'
      ));
    }
  });
  
  return router;
};

describe('Auth API', () => {
  let app: express.Application;
  let authRouter: express.Router;

  beforeEach(() => {
    // Create a new Express app for each test
    app = express();
    app.use(express.json());
    authRouter = createAuthRouter();
    app.use('/auth', authRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return a token and user data when login is successful', async () => {
      // Mock the UserService.login method
      const mockUser = { ...mockUsers[0] };
      const { password, ...userWithoutPassword } = mockUser;
      
      const mockLoginResponse = {
        token: 'mock-token',
        user: userWithoutPassword
      };
      
      (UserService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      // Make the request
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(UserService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should return 401 when login fails', async () => {
      // Mock the UserService.login method to throw an error
      (UserService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      // Make the request
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'AUTH_FAILED');
      expect(response.body.error).toHaveProperty('message', 'Invalid credentials');
      expect(UserService.login).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });
    });
  });
}); 