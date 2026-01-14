"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = require("../../services/user.service");
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
describe('UserService Error Handling - Specific Lines', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
    });
    describe('createUser - Error Handling', () => {
        it('should handle and log errors during user creation (lines 74-75)', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database to throw an error during insert
            const dbError = new Error('Database connection error');
            db.insert.mockImplementationOnce(() => {
                throw dbError;
            });
            // Create a mock user
            const mockUser = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User']
            };
            // Expect the error to be rethrown
            yield expect(user_service_1.UserService.createUser(mockUser)).rejects.toThrow(dbError);
            // The test should reach lines 74-75 where the error is logged and rethrown
        }));
    });
});
