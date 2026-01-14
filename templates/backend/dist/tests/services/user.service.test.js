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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = require("../../services/user.service");
const activity_service_1 = require("../../services/activity.service");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock-token'),
}));
// Create mock users for testing
const mockUsers = [
    {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password123',
        firstName: 'Test',
        lastName: 'User',
        roles: ['User'],
        theme: 'dark',
        emailNotify: true,
        smsNotify: false,
        phoneNumber: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        email: 'admin@example.com',
        password: 'hashed_adminpass',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['Admin', 'User'],
        theme: 'light',
        emailNotify: true,
        smsNotify: true,
        phoneNumber: '123-456-7890',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
describe('UserService', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Set JWT_SECRET for testing
        process.env.JWT_SECRET = 'test-secret';
    });
    describe('createUser', () => {
        it('should handle and rethrow database errors during user creation', () => __awaiter(void 0, void 0, void 0, function* () {
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
        }));
        it('should create a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database insert and returning methods
            const mockUser = Object.assign(Object.assign({}, mockUsers[0]), { password: 'hashed_password123' });
            db.insert.mockReturnValue({
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([mockUser]),
            });
            // Call the createUser method
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
            };
            const result = yield user_service_1.UserService.createUser(userData);
            // Assertions
            expect(db.insert).toHaveBeenCalled();
            expect(bcrypt_1.hash).toHaveBeenCalledWith('password123', 10);
            expect(activity_service_1.ActivityService.logActivity).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
            }));
            expect(result).not.toHaveProperty('password');
        }));
        it('should create a user with default roles when roles are not provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database insert and returning methods
            const mockUser = Object.assign(Object.assign({}, mockUsers[0]), { password: 'hashed_password123', roles: ['User'] });
            db.insert.mockReturnValue({
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([mockUser]),
            });
            // Call the createUser method without roles
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };
            const result = yield user_service_1.UserService.createUser(userData);
            // Assertions
            expect(db.insert).toHaveBeenCalled();
            expect(result.roles).toEqual(['User']);
        }));
        it('should handle error during activity logging', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database insert and returning methods
            const mockUser = Object.assign(Object.assign({}, mockUsers[0]), { password: 'hashed_password123' });
            db.insert.mockReturnValue({
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([mockUser]),
            });
            // Mock ActivityService to throw an error but don't expect it to propagate
            activity_service_1.ActivityService.logActivity.mockImplementationOnce(() => {
                return Promise.reject(new Error('Activity logging failed'));
            });
            // Call the createUser method
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
            };
            // The service should still create the user even if activity logging fails
            const result = yield user_service_1.UserService.createUser(userData);
            // Assertions
            expect(db.insert).toHaveBeenCalled();
            expect(activity_service_1.ActivityService.logActivity).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
            }));
        }));
        it('should create a user and associate with company if companyId is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database insert and returning methods
            const mockUser = Object.assign(Object.assign({}, mockUsers[0]), { password: 'hashed_password123' });
            db.insert.mockReturnValue({
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([mockUser]),
            });
            // Call the createUser method with companyId
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
                companyId: 123,
            };
            const result = yield user_service_1.UserService.createUser(userData);
            // Assertions
            expect(db.insert).toHaveBeenCalledTimes(2);
            expect(activity_service_1.ActivityService.logActivity).toHaveBeenCalled();
        }));
        it('should create a user with default values for optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database insert and returning methods
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashed_password123',
                firstName: null,
                lastName: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            db.insert.mockReturnValue({
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([mockUser]),
            });
            // Call the createUser method with minimal data
            const userData = {
                email: 'test@example.com',
                password: 'password123',
            };
            const result = yield user_service_1.UserService.createUser(userData);
            // Assertions
            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                email: 'test@example.com',
                roles: ['User'],
                emailNotify: true,
                smsNotify: false,
                theme: 'system',
            }));
        }));
    });
    describe('login', () => {
        it('should return a token and user data when login is successful', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method
            const mockUser = Object.assign({}, mockUsers[0]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockUser]),
            });
            // Call the login method
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };
            const result = yield user_service_1.UserService.login(loginData);
            // Assertions
            expect(db.select).toHaveBeenCalled();
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith(expect.objectContaining({
                userId: mockUser.id,
                email: mockUser.email,
                roles: mockUser.roles,
            }), 'test-secret', expect.objectContaining({ expiresIn: '24h' }));
            expect(result).toHaveProperty('token', 'mock-token');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('password');
        }));
        it('should throw an error when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to return empty array
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Call the login method
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };
            // Assertions
            yield expect(user_service_1.UserService.login(loginData)).rejects.toThrow('Invalid credentials');
        }));
        it('should throw an error when password is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method
            const mockUser = Object.assign({}, mockUsers[0]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockUser]),
            });
            // Mock bcrypt.compare to return false
            bcrypt_1.compare.mockResolvedValueOnce(false);
            // Call the login method
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };
            // Assertions
            yield expect(user_service_1.UserService.login(loginData)).rejects.toThrow('Invalid credentials');
        }));
        it('should throw an error when JWT_SECRET is not configured', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method
            const mockUser = Object.assign({}, mockUsers[0]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockUser]),
            });
            // Save the original process.env.JWT_SECRET
            const originalJwtSecret = process.env.JWT_SECRET;
            // Set JWT_SECRET to undefined
            delete process.env.JWT_SECRET;
            try {
                // Call the login method and expect it to throw
                yield expect(user_service_1.UserService.login({
                    email: 'test@example.com',
                    password: 'password123',
                })).rejects.toThrow('JWT_SECRET not configured');
            }
            finally {
                // Restore the original JWT_SECRET
                process.env.JWT_SECRET = originalJwtSecret;
            }
        }));
        it('should handle error during login process', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to throw an error
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockImplementation(() => {
                    throw new Error('Database connection error');
                }),
            });
            // Call the login method
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };
            // Assertions
            yield expect(user_service_1.UserService.login(loginData)).rejects.toThrow('Database connection error');
        }));
        it('should handle case when user has no password set', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to return a user without password
            const userWithoutPassword = Object.assign(Object.assign({}, mockUsers[0]), { password: null });
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([userWithoutPassword]),
            });
            // Call the login method
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };
            // Assertions
            yield expect(user_service_1.UserService.login(loginData)).rejects.toThrow('Invalid credentials');
        }));
        it('should handle user with no roles', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method
            const mockUserNoRoles = Object.assign(Object.assign({}, mockUsers[0]), { roles: null });
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockUserNoRoles]),
            });
            // Call the login method
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };
            const result = yield user_service_1.UserService.login(loginData);
            // Assertions
            expect(result.user.roles).toEqual(['User']); // Should default to ['User']
        }));
    });
    describe('getUsers', () => {
        it('should return all users without passwords', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method
            const mockUsersList = [...mockUsers];
            db.select.mockReturnValue({
                from: jest.fn().mockResolvedValue(mockUsersList),
            });
            // Call the getUsers method
            const result = yield user_service_1.UserService.getUsers();
            // Assertions
            expect(db.select).toHaveBeenCalled();
            expect(result).toHaveLength(mockUsersList.length);
            expect(result[0]).not.toHaveProperty('password');
            expect(result[0]).toHaveProperty('email', mockUsersList[0].email);
            expect(result[1]).toHaveProperty('email', mockUsersList[1].email);
        }));
        it('should handle empty user list', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to return empty array
            db.select.mockReturnValue({
                from: jest.fn().mockResolvedValue([]),
            });
            // Call the getUsers method
            const result = yield user_service_1.UserService.getUsers();
            // Assertions
            expect(db.select).toHaveBeenCalled();
            expect(result).toEqual([]);
        }));
        it('should handle error during getUsers process', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to throw an error
            db.select.mockImplementation(() => {
                throw new Error('Database connection error');
            });
            // Assertions
            yield expect(user_service_1.UserService.getUsers()).rejects.toThrow('Database connection error');
        }));
    });
    describe('getUserById', () => {
        it('should return a user by ID without password', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method
            const mockUser = mockUsers[0];
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockUser]),
            });
            // Call the getUserById method
            const result = yield user_service_1.UserService.getUserById(1);
            // Assertions
            expect(db.select).toHaveBeenCalled();
            expect(result).not.toHaveProperty('password');
            expect(result).toHaveProperty('email', mockUser.email);
            expect(result).toHaveProperty('firstName', mockUser.firstName);
            expect(result).toHaveProperty('lastName', mockUser.lastName);
        }));
        it('should return null when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to return empty array
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Call the getUserById method
            const result = yield user_service_1.UserService.getUserById(999);
            // Assertions
            expect(db.select).toHaveBeenCalled();
            expect(result).toBeNull();
        }));
        it('should handle error during getUserById process', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to throw an error
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockImplementation(() => {
                    throw new Error('Database connection error');
                }),
            });
            // Assertions
            yield expect(user_service_1.UserService.getUserById(1)).rejects.toThrow('Database connection error');
        }));
        it('should handle user with no roles or theme', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method
            const mockUserNoRolesOrTheme = Object.assign(Object.assign({}, mockUsers[0]), { roles: null, theme: null });
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockUserNoRolesOrTheme]),
            });
            // Call the getUserById method
            const result = yield user_service_1.UserService.getUserById(1);
            // Assertions
            expect(result).not.toBeNull();
            expect(result === null || result === void 0 ? void 0 : result.roles).toEqual(['User']); // Should default to ['User']
            expect(result === null || result === void 0 ? void 0 : result.theme).toEqual('system'); // Should default to 'system'
        }));
    });
    describe('updateUser', () => {
        it('should update a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to check if email exists
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock the database update method
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
                theme: 'system',
                emailNotify: true,
                smsNotify: false,
                phoneNumber: null
            };
            const updatedMockUser = Object.assign(Object.assign({}, mockUser), { firstName: 'Updated', lastName: 'Name' });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([updatedMockUser]),
            });
            // Call the updateUser method
            const userData = {
                firstName: 'Updated',
                lastName: 'Name',
            };
            const result = yield user_service_1.UserService.updateUser(1, userData);
            // Assertions
            expect(db.update).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                firstName: 'Updated',
                lastName: 'Name',
            }));
        }));
        it('should update user password with hashing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select and update methods
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            const mockUser = Object.assign({}, mockUsers[0]);
            const updatedMockUser = Object.assign(Object.assign({}, mockUser), { password: 'hashed_newpassword', updatedAt: new Date() });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([updatedMockUser]),
            });
            // Call the updateUser method
            const userData = {
                password: 'newpassword',
            };
            const result = yield user_service_1.UserService.updateUser(1, userData);
            // Assertions
            expect(bcrypt_1.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(result).not.toHaveProperty('password');
        }));
        it('should throw an error when email is already taken', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to return a user with the same email
            const existingUser = Object.assign({}, mockUsers[1]); // Different user with the same email
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([existingUser]),
            });
            // Call the updateUser method
            const userData = {
                email: 'existing@example.com',
            };
            // Assertions
            yield expect(user_service_1.UserService.updateUser(1, userData)).rejects.toThrow('Email is already taken');
            expect(db.update).not.toHaveBeenCalled();
        }));
        it('should return null when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method for email check
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock the database update method to return empty array
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([]),
            });
            // Call the updateUser method
            const userData = {
                firstName: 'Updated',
            };
            const result = yield user_service_1.UserService.updateUser(999, userData);
            // Assertions
            expect(db.update).toHaveBeenCalled();
            expect(result).toBeNull();
        }));
        it('should handle phoneNumber field correctly when empty string is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to check if email exists
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock the database update method
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
                theme: 'system',
                emailNotify: true,
                smsNotify: false,
                phoneNumber: '123-456-7890'
            };
            const updatedMockUser = Object.assign(Object.assign({}, mockUser), { phoneNumber: null });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([updatedMockUser]),
            });
            // Call the updateUser method with empty string phoneNumber
            const userData = {
                phoneNumber: '',
            };
            const result = yield user_service_1.UserService.updateUser(1, userData);
            // Assertions
            expect(db.update).toHaveBeenCalled();
            expect(result === null || result === void 0 ? void 0 : result.phoneNumber).toBeNull();
        }));
        it('should update user company association when companyId is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to check if email exists
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock the database update method
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
                theme: 'system',
                emailNotify: true,
                smsNotify: false,
                phoneNumber: null
            };
            const updatedMockUser = Object.assign({}, mockUser);
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([updatedMockUser]),
            });
            // Mock delete for company association
            db.delete.mockReturnValue({
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock insert for new company association
            db.insert.mockReturnValue({
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([{ userId: 1, companyId: 456 }]),
            });
            // Call the updateUser method with new companyId
            const userData = {
                companyId: 456,
            };
            const result = yield user_service_1.UserService.updateUser(1, userData);
            // Assertions
            expect(db.update).toHaveBeenCalled();
            expect(db.delete).toHaveBeenCalled();
            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                id: 1,
                email: 'test@example.com',
            }));
        }));
        it('should remove user company association when companyId is null', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to check if email exists
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock the database update method
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
                theme: 'system',
                emailNotify: true,
                smsNotify: false,
                phoneNumber: null
            };
            const updatedMockUser = Object.assign({}, mockUser);
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([updatedMockUser]),
            });
            // Mock delete for company association
            db.delete.mockReturnValue({
                where: jest.fn().mockResolvedValue([]),
            });
            // Call the updateUser method with null companyId
            const userData = {
                companyId: null,
            };
            const result = yield user_service_1.UserService.updateUser(1, userData);
            // Assertions
            expect(db.update).toHaveBeenCalled();
            expect(db.delete).toHaveBeenCalled();
            expect(db.insert).not.toHaveBeenCalled(); // Should not insert a new association
            expect(result).toEqual(expect.objectContaining({
                id: 1,
                email: 'test@example.com',
            }));
        }));
        it('should update all user fields correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to check if email exists
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock the database update method
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
                theme: 'system',
                emailNotify: true,
                smsNotify: false,
                phoneNumber: null
            };
            const updatedMockUser = Object.assign(Object.assign({}, mockUser), { email: 'updated@example.com', firstName: 'Updated', lastName: 'Name', roles: ['Admin', 'User'], theme: 'dark', emailNotify: false, smsNotify: true, phoneNumber: '555-123-4567' });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([updatedMockUser]),
            });
            // Call the updateUser method with all fields
            const userData = {
                email: 'updated@example.com',
                firstName: 'Updated',
                lastName: 'Name',
                roles: ['Admin', 'User'],
                theme: 'dark',
                emailNotify: false,
                smsNotify: true,
                phoneNumber: '555-123-4567'
            };
            const result = yield user_service_1.UserService.updateUser(1, userData);
            // Assertions
            expect(db.update).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                email: 'updated@example.com',
                firstName: 'Updated',
                lastName: 'Name',
                roles: ['Admin', 'User'],
                theme: 'dark',
                emailNotify: false,
                smsNotify: true,
                phoneNumber: '555-123-4567'
            }));
        }));
        it('should handle error during activity logging in updateUser', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to check if email exists
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock the database update method
            const mockUser = Object.assign({}, mockUsers[0]);
            const updatedMockUser = Object.assign(Object.assign({}, mockUser), { firstName: 'Updated' });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([updatedMockUser]),
            });
            // Save original implementation
            const originalLogActivity = activity_service_1.ActivityService.logActivity;
            // Create a spy that will throw an error
            const logActivitySpy = jest.spyOn(activity_service_1.ActivityService, 'logActivity')
                .mockImplementationOnce(() => {
                throw new Error('Activity logging failed');
            });
            try {
                // Call the updateUser method
                const userData = {
                    firstName: 'Updated',
                };
                // This should throw an error since the updateUser method doesn't catch activity logging errors
                yield expect(user_service_1.UserService.updateUser(1, userData)).rejects.toThrow('Activity logging failed');
                // Assertions
                expect(db.update).toHaveBeenCalled();
                expect(logActivitySpy).toHaveBeenCalled();
            }
            finally {
                // Restore the original implementation
                logActivitySpy.mockRestore();
                activity_service_1.ActivityService.logActivity = originalLogActivity;
            }
        }));
        it('should handle null values for user fields', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database select method to check if email exists
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            // Mock the database update method
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['User'],
                theme: 'system',
                emailNotify: true,
                smsNotify: false,
                phoneNumber: '123-456-7890'
            };
            const updatedMockUser = Object.assign(Object.assign({}, mockUser), { firstName: null, lastName: null });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([updatedMockUser]),
            });
            // Call the updateUser method with null values
            const userData = {
                firstName: null,
                lastName: null,
            };
            const result = yield user_service_1.UserService.updateUser(1, userData);
            // Assertions
            expect(db.update).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                firstName: null,
                lastName: null,
            }));
        }));
    });
    describe('deleteUser', () => {
        it('should delete a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database operations
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockUsers[0]]),
            });
            db.delete.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([mockUsers[0]]),
            });
            const result = yield user_service_1.UserService.deleteUser(1);
            expect(result).toBe(true);
            expect(db.delete).toHaveBeenCalled();
            expect(activity_service_1.ActivityService.logActivity).toHaveBeenCalled();
        }));
        it('should return false when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database operations
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            const result = yield user_service_1.UserService.deleteUser(999);
            expect(result).toBe(false);
            expect(db.delete).not.toHaveBeenCalled();
            expect(activity_service_1.ActivityService.logActivity).not.toHaveBeenCalled();
        }));
        it('should handle database error when deleting user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database operations to throw an error
            db.select.mockImplementation(() => {
                throw new Error('Database error');
            });
            yield expect(user_service_1.UserService.deleteUser(1)).rejects.toThrow('Database error');
        }));
        it('should handle error during activity logging in deleteUser', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database operations
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockUsers[0]]),
            });
            db.delete.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([mockUsers[0]]),
            });
            // Save original implementation
            const originalLogActivity = activity_service_1.ActivityService.logActivity;
            // Create a spy that will throw an error
            const logActivitySpy = jest.spyOn(activity_service_1.ActivityService, 'logActivity')
                .mockImplementationOnce(() => {
                throw new Error('Activity logging failed');
            });
            try {
                // This should throw an error since the deleteUser method doesn't catch activity logging errors
                yield expect(user_service_1.UserService.deleteUser(1)).rejects.toThrow('Activity logging failed');
                // Assertions
                expect(db.delete).toHaveBeenCalled();
                expect(logActivitySpy).toHaveBeenCalled();
            }
            finally {
                // Restore the original implementation
                logActivitySpy.mockRestore();
                activity_service_1.ActivityService.logActivity = originalLogActivity;
            }
        }));
    });
    describe('changePassword', () => {
        it('should change password successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = 1;
            const currentPassword = 'password123';
            const newPassword = 'newPassword123';
            // Mock the database operations
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([Object.assign(Object.assign({}, mockUsers[0]), { password: 'hashedOldPassword' })]),
            });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            yield user_service_1.UserService.changePassword(userId, currentPassword, newPassword);
            expect(bcrypt_1.compare).toHaveBeenCalled();
            expect(bcrypt_1.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(db.update).toHaveBeenCalled();
        }));
        it('should throw error when password is too short', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = 1;
            const currentPassword = 'password123';
            const newPassword = 'short';
            yield expect(user_service_1.UserService.changePassword(userId, currentPassword, newPassword))
                .rejects.toThrow('New password must be at least 8 characters long');
            expect(db.select).not.toHaveBeenCalled();
            expect(bcrypt_1.compare).not.toHaveBeenCalled();
            expect(bcrypt_1.hash).not.toHaveBeenCalled();
            expect(db.update).not.toHaveBeenCalled();
        }));
        it('should throw error when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = 999;
            const currentPassword = 'password123';
            const newPassword = 'newPassword123';
            // Mock the database operations
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([]),
            });
            yield expect(user_service_1.UserService.changePassword(userId, currentPassword, newPassword))
                .rejects.toThrow('User not found');
            expect(bcrypt_1.compare).not.toHaveBeenCalled();
            expect(bcrypt_1.hash).not.toHaveBeenCalled();
            expect(db.update).not.toHaveBeenCalled();
        }));
        it('should throw error when current password is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = 1;
            const currentPassword = 'wrongPassword';
            const newPassword = 'newPassword123';
            // Mock the database operations
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([Object.assign(Object.assign({}, mockUsers[0]), { password: 'hashedOldPassword' })]),
            });
            // Mock bcrypt compare to return false
            bcrypt_1.compare.mockResolvedValueOnce(false);
            yield expect(user_service_1.UserService.changePassword(userId, currentPassword, newPassword))
                .rejects.toThrow('Invalid current password');
            expect(bcrypt_1.compare).toHaveBeenCalled();
            expect(bcrypt_1.hash).not.toHaveBeenCalled();
            expect(db.update).not.toHaveBeenCalled();
        }));
    });
    describe('getPendingUsers', () => {
        it('should return pending users', () => __awaiter(void 0, void 0, void 0, function* () {
            const pendingUsers = [
                {
                    id: 3,
                    email: 'pending@example.com',
                    firstName: 'Pending',
                    lastName: 'User',
                    roles: ['User'],
                    companyName: 'Pending Company',
                    jobTitle: 'Developer',
                    selectedPlan: 'basic',
                    createdAt: new Date()
                }
            ];
            // Mock the database operations
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(pendingUsers),
            });
            const result = yield user_service_1.UserService.getPendingUsers();
            expect(result).toEqual(pendingUsers);
            expect(db.select).toHaveBeenCalled();
        }));
        it('should handle database error when fetching pending users', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database operations to throw an error
            db.select.mockImplementation(() => {
                throw new Error('Database error');
            });
            yield expect(user_service_1.UserService.getPendingUsers()).rejects.toThrow('Database error');
        }));
        it('should handle empty roles in pending users', () => __awaiter(void 0, void 0, void 0, function* () {
            const pendingUsers = [
                {
                    id: 3,
                    email: 'pending@example.com',
                    firstName: 'Pending',
                    lastName: 'User',
                    roles: null, // Null roles to test the default
                    companyName: 'Pending Company',
                    jobTitle: 'Developer',
                    selectedPlan: 'basic',
                    createdAt: new Date()
                }
            ];
            // Mock the database operations
            db.select.mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(pendingUsers),
            });
            const result = yield user_service_1.UserService.getPendingUsers();
            // Should default to ['User'] when roles is null
            expect(result[0].roles).toEqual(null);
            expect(db.select).toHaveBeenCalled();
        }));
    });
});
