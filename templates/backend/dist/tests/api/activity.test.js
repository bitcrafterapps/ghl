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
const activity_service_1 = require("../../services/activity.service");
// Mock the services
jest.mock('../../services/activity.service');
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
        // Default to authenticated user
        req.user = {
            userId: 1,
            roles: ['User']
        };
        next();
    })
}));
// Create a simple activity router for testing
const createActivityRouter = () => {
    const router = (0, express_2.Router)();
    // Log activity
    router.post('/log', require('../../middleware/v1/auth.middleware').authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const authReq = req;
            if (!authReq.user) {
                return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
            }
            const { type, action, title, entityId } = req.body;
            const userId = authReq.user.userId;
            // Validate required fields
            if (!type || !action || !title || !entityId) {
                return res.status(400).json(createErrorResponse('MISSING_FIELDS', 'Missing required fields'));
            }
            // Validate field values
            const validTypes = ['proposal', 'template', 'company', 'user'];
            const validActions = ['created', 'updated', 'deleted'];
            if (!validTypes.includes(type)) {
                return res.status(400).json(createErrorResponse('INVALID_TYPE', `Invalid type. Must be one of: ${validTypes.join(', ')}`));
            }
            if (!validActions.includes(action)) {
                return res.status(400).json(createErrorResponse('INVALID_ACTION', `Invalid action. Must be one of: ${validActions.join(', ')}`));
            }
            // Log the activity
            const activity = yield activity_service_1.ActivityService.logActivity(Object.assign({ type,
                action,
                title,
                entityId,
                userId }, (req.body.metadata ? { metadata: req.body.metadata } : {})));
            return res.status(201).json(createSuccessResponse({
                message: 'Activity logged successfully',
                activity
            }));
        }
        catch (error) {
            return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to log activity'));
        }
    }));
    return router;
};
describe('Activity API', () => {
    let app;
    let activityRouter;
    beforeEach(() => {
        // Create a new Express app for each test
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        activityRouter = createActivityRouter();
        app.use('/activity', activityRouter);
        // Reset all mocks
        jest.clearAllMocks();
    });
    describe('POST /activity/log', () => {
        const validActivityData = {
            type: 'company',
            action: 'created',
            title: 'Created new company',
            entityId: 1
        };
        it('should log activity successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockActivity = Object.assign(Object.assign({ id: 1 }, validActivityData), { userId: 1, timestamp: new Date().toISOString() });
            // Mock the ActivityService.logActivity method
            activity_service_1.ActivityService.logActivity.mockResolvedValue(mockActivity);
            const response = yield (0, supertest_1.default)(app)
                .post('/activity/log')
                .send(validActivityData);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(createSuccessResponse({
                message: 'Activity logged successfully',
                activity: mockActivity
            }));
            expect(activity_service_1.ActivityService.logActivity).toHaveBeenCalledWith(Object.assign(Object.assign({}, validActivityData), { userId: 1, metadata: undefined }));
        }));
        it('should log activity with metadata successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const activityWithMetadata = Object.assign(Object.assign({}, validActivityData), { metadata: {
                    key1: 'value1',
                    key2: 'value2'
                } });
            const mockActivity = Object.assign(Object.assign({ id: 1 }, activityWithMetadata), { userId: 1, timestamp: new Date().toISOString() });
            // Mock the ActivityService.logActivity method
            activity_service_1.ActivityService.logActivity.mockResolvedValue(mockActivity);
            const response = yield (0, supertest_1.default)(app)
                .post('/activity/log')
                .send(activityWithMetadata);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(createSuccessResponse({
                message: 'Activity logged successfully',
                activity: mockActivity
            }));
            expect(activity_service_1.ActivityService.logActivity).toHaveBeenCalledWith(Object.assign(Object.assign({}, activityWithMetadata), { userId: 1 }));
        }));
        it('should return 400 when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidActivityData = {
                type: 'company',
                action: 'created',
                // Missing title and entityId
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/activity/log')
                .send(invalidActivityData);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(createErrorResponse('MISSING_FIELDS', 'Missing required fields'));
            expect(activity_service_1.ActivityService.logActivity).not.toHaveBeenCalled();
        }));
        it('should return 400 when type is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidTypeData = Object.assign(Object.assign({}, validActivityData), { type: 'invalid_type' });
            const response = yield (0, supertest_1.default)(app)
                .post('/activity/log')
                .send(invalidTypeData);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(createErrorResponse('INVALID_TYPE', 'Invalid type. Must be one of: proposal, template, company, user'));
            expect(activity_service_1.ActivityService.logActivity).not.toHaveBeenCalled();
        }));
        it('should return 400 when action is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidActionData = Object.assign(Object.assign({}, validActivityData), { action: 'invalid_action' });
            const response = yield (0, supertest_1.default)(app)
                .post('/activity/log')
                .send(invalidActionData);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(createErrorResponse('INVALID_ACTION', 'Invalid action. Must be one of: created, updated, deleted'));
            expect(activity_service_1.ActivityService.logActivity).not.toHaveBeenCalled();
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
            const testRouter = createActivityRouter();
            testApp.use('/activity', testRouter);
            const response = yield (0, supertest_1.default)(testApp)
                .post('/activity/log')
                .send(validActivityData);
            expect(response.status).toBe(401);
            expect(response.body).toEqual(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
            expect(activity_service_1.ActivityService.logActivity).not.toHaveBeenCalled();
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
                    roles: ['User']
                };
                next();
            });
            // Mock the ActivityService.logActivity method to throw an error
            activity_service_1.ActivityService.logActivity.mockRejectedValue(new Error('Database error'));
            // Create a new router with the mocked middleware
            const testRouter = createActivityRouter();
            testApp.use('/activity', testRouter);
            const response = yield (0, supertest_1.default)(testApp)
                .post('/activity/log')
                .send(validActivityData);
            expect(response.status).toBe(500);
            expect(response.body).toEqual(createErrorResponse('SERVER_ERROR', 'Failed to log activity'));
            // Restore the original mock
            require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
        }));
    });
});
