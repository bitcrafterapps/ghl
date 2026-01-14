import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../types/user.types';

/**
 * Creates a mock Express request object
 */
export function createMockRequest(overrides: Partial<Request> = {}): Request {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    ...overrides,
  } as unknown as Request;
  
  return req;
}

/**
 * Creates a mock Express response object
 */
export function createMockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Creates a JWT token for testing
 */
export function createTestToken(userId: string, email: string, roles: UserRole[] = ['User']): string {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(
    { userId, email, roles },
    secret,
    { expiresIn: '1h' }
  );
}

/**
 * Mock user data for testing
 */
export const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: '$2b$10$dJoCrMmd3v5muMFGFz6EoOmVMWQHT4wQH6RBq/zgLOQSBMW9hIGLe', // hashed 'password123'
    roles: ['User'] as UserRole[],
    emailNotify: true,
    smsNotify: false,
    phoneNumber: null,
    theme: 'dark',
    status: 'active',
    companyName: 'Test Company',
    jobTitle: 'Developer',
    selectedPlan: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    password: '$2b$10$dJoCrMmd3v5muMFGFz6EoOmVMWQHT4wQH6RBq/zgLOQSBMW9hIGLe', // hashed 'password123'
    roles: ['Admin'] as UserRole[],
    emailNotify: true,
    smsNotify: false,
    phoneNumber: null,
    theme: 'light',
    status: 'active',
    companyName: 'Admin Company',
    jobTitle: 'Administrator',
    selectedPlan: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Mock company data for testing
 */
export const mockCompanies = [
  {
    id: '1',
    name: 'Test Company',
    description: 'A test company',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Admin Company',
    description: 'An admin company',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Mock database for testing
 */
export const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
}; 