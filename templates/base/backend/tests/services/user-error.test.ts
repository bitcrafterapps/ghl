import { UserService } from '../../services/user.service';
import { UserRole } from '../../types/user.types';
import { Logger } from '../../logger';

// Mock the database
jest.mock('../../db', () => {
  const mockDb = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  
  return {
    db: mockDb,
    users: {},
    companyUsers: {},
  };
});

// Get the mocked db
const { db } = require('../../db');

// Mock the logger
jest.mock('../../logger', () => {
  return {
    Logger: jest.fn().mockImplementation(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }))
  };
});

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

// Mock ActivityService
jest.mock('../../services/activity.service', () => ({
  ActivityService: {
    logActivity: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('UserService Error Handling', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should handle and rethrow database errors during user creation', async () => {
      // Mock the database to throw an error during insert
      const dbError = new Error('Database connection error');
      (db.insert as jest.Mock).mockImplementationOnce(() => {
        throw dbError;
      });
      
      // Create a mock user
      const mockUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: ['User'] as UserRole[]
      };
      
      // Expect the error to be rethrown
      await expect(UserService.createUser(mockUser)).rejects.toThrow(dbError);
    });
  });
}); 