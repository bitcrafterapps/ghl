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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const user_service_1 = require("../../services/user.service");
const test_utils_1 = require("../utils/test-utils");
// Mock the UserService
jest.mock('../../services/user.service');
// Mock the response format
const createSuccessResponse = (data) => ({
    success: true,
    data
});
const createErrorResponse = (code, message) => ({
    success: false,
    error: {
        code,
        message
    }
});
// Create a simple users router for testing
const createUsersRouter = () => {
    const router = (0, express_2.Router)();
    // Get all users
    router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield user_service_1.UserService.getUsers();
            res.json(createSuccessResponse(users));
        }
        catch (error) {
            res.status(500).json(createErrorResponse('SERVER_ERROR', error instanceof Error ? error.message : 'Failed to get users'));
        }
    }));
    // Get user by ID
    router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = parseInt(req.params.id, 10);
            const user = yield user_service_1.UserService.getUserById(userId);
            if (!user) {
                return res.status(404).json(createErrorResponse('NOT_FOUND', 'User not found'));
            }
            res.json(createSuccessResponse(user));
        }
        catch (error) {
            res.status(500).json(createErrorResponse('SERVER_ERROR', error instanceof Error ? error.message : 'Failed to get user'));
        }
    }));
    // Create user
    router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield user_service_1.UserService.createUser(req.body);
            res.status(201).json(createSuccessResponse(user));
        }
        catch (error) {
            res.status(400).json(createErrorResponse('VALIDATION_ERROR', error instanceof Error ? error.message : 'Failed to create user'));
        }
    }));
    return router;
};
describe('Users API', () => {
    let app;
    let usersRouter;
    beforeEach(() => {
        // Create a new Express app for each test
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        usersRouter = createUsersRouter();
        app.use('/users', usersRouter);
        // Reset all mocks
        jest.clearAllMocks();
    });
    describe('GET /users', () => {
        it('should return all users', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.getUsers method
            const mockUsersList = test_utils_1.mockUsers.map(user => {
                const { password } = user, userWithoutPassword = __rest(user, ["password"]);
                return userWithoutPassword;
            });
            user_service_1.UserService.getUsers.mockResolvedValue(mockUsersList);
            // Make the request
            const response = yield (0, supertest_1.default)(app).get('/users');
            // Assertions
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty('email', 'test@example.com');
            expect(response.body.data[1]).toHaveProperty('email', 'admin@example.com');
            expect(user_service_1.UserService.getUsers).toHaveBeenCalled();
        }));
        it('should return 500 when there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.getUsers method to throw an error
            user_service_1.UserService.getUsers.mockRejectedValue(new Error('Database error'));
            // Make the request
            const response = yield (0, supertest_1.default)(app).get('/users');
            // Assertions
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('code', 'SERVER_ERROR');
            expect(response.body.error).toHaveProperty('message', 'Database error');
            expect(user_service_1.UserService.getUsers).toHaveBeenCalled();
        }));
    });
    describe('GET /users/:id', () => {
        it('should return a user by ID', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.getUserById method
            const mockUser = test_utils_1.mockUsers[0];
            const { password } = mockUser, userWithoutPassword = __rest(mockUser, ["password"]);
            user_service_1.UserService.getUserById.mockResolvedValue(userWithoutPassword);
            // Make the request
            const response = yield (0, supertest_1.default)(app).get('/users/1');
            // Assertions
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email', 'test@example.com');
            expect(response.body.data).toHaveProperty('firstName', 'Test');
            expect(response.body.data).toHaveProperty('lastName', 'User');
            expect(response.body.data).not.toHaveProperty('password');
            expect(user_service_1.UserService.getUserById).toHaveBeenCalledWith(1);
        }));
        it('should return 404 when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.getUserById method to return null
            user_service_1.UserService.getUserById.mockResolvedValue(null);
            // Make the request
            const response = yield (0, supertest_1.default)(app).get('/users/999');
            // Assertions
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
            expect(response.body.error).toHaveProperty('message', 'User not found');
            expect(user_service_1.UserService.getUserById).toHaveBeenCalledWith(999);
        }));
    });
    describe('POST /users', () => {
        it('should create a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.createUser method
            const mockUser = test_utils_1.mockUsers[0];
            const { password } = mockUser, userWithoutPassword = __rest(mockUser, ["password"]);
            user_service_1.UserService.createUser.mockResolvedValue(userWithoutPassword);
            // Make the request
            const userData = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'User',
                roles: ['User']
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/users')
                .send(userData);
            // Assertions
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email', 'test@example.com');
            expect(response.body.data).not.toHaveProperty('password');
            expect(user_service_1.UserService.createUser).toHaveBeenCalledWith(userData);
        }));
        it('should return 400 when validation fails', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.createUser method to throw an error
            user_service_1.UserService.createUser.mockRejectedValue(new Error('Email is required'));
            // Make the request
            const response = yield (0, supertest_1.default)(app)
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
            expect(user_service_1.UserService.createUser).toHaveBeenCalled();
        }));
    });
});
