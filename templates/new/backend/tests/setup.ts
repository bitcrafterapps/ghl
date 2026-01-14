import dotenv from 'dotenv';
import { Logger } from '../logger';

// Load environment variables from .env.test if it exists, otherwise from .env
dotenv.config({ path: '.env.test' });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key';
}

// Mock the logger to prevent console output during tests
jest.mock('../logger', () => {
  return {
    Logger: jest.fn().mockImplementation(() => {
      return {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
    }),
  };
});

// Mock the database connection
jest.mock('../db', () => {
  const { mockDb } = require('./utils/test-utils');
  return {
    db: mockDb,
    initializeDatabase: jest.fn().mockResolvedValue(undefined),
    checkDbConnection: jest.fn().mockResolvedValue(true),
  };
}); 