"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDb = exports.mockCompanies = exports.mockUsers = void 0;
exports.createMockRequest = createMockRequest;
exports.createMockResponse = createMockResponse;
exports.createTestToken = createTestToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Creates a mock Express request object
 */
function createMockRequest(overrides = {}) {
    const req = Object.assign({ body: {}, params: {}, query: {}, headers: {}, cookies: {} }, overrides);
    return req;
}
/**
 * Creates a mock Express response object
 */
function createMockResponse() {
    const res = {};
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
function createTestToken(userId, email, roles = ['User']) {
    const secret = process.env.JWT_SECRET || 'test-secret';
    return jsonwebtoken_1.default.sign({ userId, email, roles }, secret, { expiresIn: '1h' });
}
/**
 * Mock user data for testing
 */
exports.mockUsers = [
    {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: '$2b$10$dJoCrMmd3v5muMFGFz6EoOmVMWQHT4wQH6RBq/zgLOQSBMW9hIGLe', // hashed 'password123'
        roles: ['User'],
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
        roles: ['Admin'],
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
exports.mockCompanies = [
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
exports.mockDb = {
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
