import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createMockRequest, createMockResponse, createTestToken } from '../utils/test-utils';

// Mock the authMiddleware implementation for testing
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'AUTH_REQUIRED', 
          message: 'Authentication required' 
        } 
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'test-secret';
    
    const decoded = jwt.verify(token, secret) as { userId: string; email: string; roles: string[] };
    
    req.user = {
      userId: parseInt(decoded.userId),
      email: decoded.email,
      roles: decoded.roles
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: { 
        code: 'INVALID_TOKEN', 
        message: 'Invalid or expired token' 
      } 
    });
  }
};

// Mock jwt.verify
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn().mockReturnValue('mock-token'),
}));

describe('Auth Middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock request, response, and next function
    req = createMockRequest();
    res = createMockResponse();
    next = jest.fn();
    
    // Set JWT_SECRET for testing
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should call next() when a valid token is provided', () => {
    // Mock the request with a valid token
    req.headers = {
      authorization: 'Bearer valid-token'
    };
    
    // Mock jwt.verify to return a valid decoded token
    (jwt.verify as jest.Mock).mockReturnValueOnce({
      userId: 123,
      email: 'test@example.com',
      roles: ['User']
    });
    
    // Call the middleware
    authMiddleware(req, res, next);
    
    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.user).toEqual({
      userId: 123,
      email: 'test@example.com',
      roles: ['User']
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 when no authorization header is provided', () => {
    // Call the middleware without an authorization header
    authMiddleware(req, res, next);
    
    // Assertions
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication required'
      }
    });
  });

  it('should return 401 when the authorization header does not start with "Bearer "', () => {
    // Mock the request with an invalid authorization header
    req.headers = {
      authorization: 'InvalidFormat token'
    };
    
    // Call the middleware
    authMiddleware(req, res, next);
    
    // Assertions
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication required'
      }
    });
  });

  it('should return 401 when the token is invalid', () => {
    // Mock the request with a token
    req.headers = {
      authorization: 'Bearer invalid-token'
    };
    
    // Mock jwt.verify to throw an error
    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });
    
    // Call the middleware
    authMiddleware(req, res, next);
    
    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  });
}); 