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
// Create a simple auth router for testing
const createAuthRouter = () => {
    const router = express_1.default.Router();
    router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const loginResponse = yield user_service_1.UserService.login(req.body);
            res.json(createSuccessResponse(loginResponse));
        }
        catch (error) {
            res.status(401).json(createErrorResponse('AUTH_FAILED', error instanceof Error ? error.message : 'Login failed'));
        }
    }));
    return router;
};
describe('Auth API', () => {
    let app;
    let authRouter;
    beforeEach(() => {
        // Create a new Express app for each test
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        authRouter = createAuthRouter();
        app.use('/auth', authRouter);
        // Reset all mocks
        jest.clearAllMocks();
    });
    describe('POST /auth/login', () => {
        it('should return a token and user data when login is successful', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.login method
            const mockUser = Object.assign({}, test_utils_1.mockUsers[0]);
            const { password } = mockUser, userWithoutPassword = __rest(mockUser, ["password"]);
            const mockLoginResponse = {
                token: 'mock-token',
                user: userWithoutPassword
            };
            user_service_1.UserService.login.mockResolvedValue(mockLoginResponse);
            // Make the request
            const response = yield (0, supertest_1.default)(app)
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
            expect(user_service_1.UserService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
        }));
        it('should return 401 when login fails', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.login method to throw an error
            user_service_1.UserService.login.mockRejectedValue(new Error('Invalid credentials'));
            // Make the request
            const response = yield (0, supertest_1.default)(app)
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
            expect(user_service_1.UserService.login).toHaveBeenCalledWith({
                email: 'wrong@example.com',
                password: 'wrongpassword'
            });
        }));
    });
});
