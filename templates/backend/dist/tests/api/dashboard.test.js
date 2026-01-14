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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const dashboard_service_1 = require("../../services/dashboard.service");
// Mock the services
jest.mock('../../services/dashboard.service');
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
// Mock the authenticate middleware
jest.mock('../../middleware/v1/auth.middleware', () => ({
    authenticate: jest.fn((req, res, next) => {
        // Default to authenticated user with Site Admin role
        req.user = {
            userId: 1,
            roles: ['Site Admin']
        };
        next();
    })
}));
// Create a simple dashboard router for testing
const createDashboardRouter = () => {
    const router = (0, express_2.Router)();
    // Get dashboard stats
    router.get('/stats', require('../../middleware/v1/auth.middleware').authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const authReq = req;
            if (!authReq.user) {
                return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
            }
            const isSiteAdmin = (_b = (_a = authReq.user.roles) === null || _a === void 0 ? void 0 : _a.includes('Site Admin')) !== null && _b !== void 0 ? _b : false;
            const stats = yield dashboard_service_1.DashboardService.getDashboardStats(authReq.user.userId, isSiteAdmin);
            return res.json(createSuccessResponse(stats));
        }
        catch (error) {
            return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch dashboard statistics'));
        }
    }));
    return router;
};
describe('Dashboard API', () => {
    let app;
    let dashboardRouter;
    beforeEach(() => {
        // Create a new Express app for each test
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        dashboardRouter = createDashboardRouter();
        app.use('/dashboard', dashboardRouter);
        // Reset all mocks
        jest.clearAllMocks();
    });
    describe('GET /dashboard/stats', () => {
        it('should return dashboard stats for site admin user', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockStats = {
                users: 10,
                companies: 5
            };
            // Mock the DashboardService.getDashboardStats method
            dashboard_service_1.DashboardService.getDashboardStats.mockResolvedValue(mockStats);
            const response = yield (0, supertest_1.default)(app).get('/dashboard/stats');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(createSuccessResponse(mockStats));
            expect(dashboard_service_1.DashboardService.getDashboardStats).toHaveBeenCalledWith(1, true);
        }));
        it('should return empty stats for non-admin user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a new app with a router that uses the non-admin middleware
            const testApp = (0, express_1.default)();
            testApp.use(express_1.default.json());
            // Override the default mock to make the user a non-admin
            const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
            require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
                req.user = {
                    userId: 2,
                    roles: ['User']
                };
                next();
            });
            const mockStats = {
                users: null,
                companies: null
            };
            // Mock the DashboardService.getDashboardStats method
            dashboard_service_1.DashboardService.getDashboardStats.mockResolvedValue(mockStats);
            // Create a new router with the mocked middleware
            const testRouter = createDashboardRouter();
            testApp.use('/dashboard', testRouter);
            const response = yield (0, supertest_1.default)(testApp).get('/dashboard/stats');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(createSuccessResponse(mockStats));
            expect(dashboard_service_1.DashboardService.getDashboardStats).toHaveBeenCalledWith(2, false);
            // Restore the original mock
            require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
        }));
        it('should return 401 when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a new app with a router that uses the unauthenticated middleware
            const testApp = (0, express_1.default)();
            testApp.use(express_1.default.json());
            // Override the default mock to make the user unauthenticated
            const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
            require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
                // Don't set req.user to simulate unauthenticated request
                return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
            });
            // Create a new router with the mocked middleware
            const testRouter = createDashboardRouter();
            testApp.use('/dashboard', testRouter);
            const response = yield (0, supertest_1.default)(testApp).get('/dashboard/stats');
            expect(response.status).toBe(401);
            expect(response.body).toEqual(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
            expect(dashboard_service_1.DashboardService.getDashboardStats).not.toHaveBeenCalled();
            // Restore the original mock
            require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
        }));
        it('should return 500 when there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a new app with a router that uses the authenticated middleware
            const testApp = (0, express_1.default)();
            testApp.use(express_1.default.json());
            // Make sure we're using the default authentication that allows access
            const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
            require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
                req.user = {
                    userId: 1,
                    roles: ['Site Admin']
                };
                next();
            });
            // Mock the DashboardService.getDashboardStats method to throw an error
            dashboard_service_1.DashboardService.getDashboardStats.mockRejectedValue(new Error('Database error'));
            // Create a new router with the mocked middleware
            const testRouter = createDashboardRouter();
            testApp.use('/dashboard', testRouter);
            const response = yield (0, supertest_1.default)(testApp).get('/dashboard/stats');
            expect(response.status).toBe(500);
            expect(response.body).toEqual(createErrorResponse('SERVER_ERROR', 'Failed to fetch dashboard statistics'));
            // Restore the original mock
            require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
        }));
    });
});
