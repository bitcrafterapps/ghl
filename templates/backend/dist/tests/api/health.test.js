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
const db_1 = require("../../db");
// Mock the database connection check
jest.mock('../../db', () => ({
    checkDbConnection: jest.fn(),
}));
// Create a simple health route for testing
const createHealthRoutes = () => {
    const router = (0, express_2.Router)();
    router.get('/ping', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Cache-Control', 'no-cache');
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    });
    router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const isConnected = yield (0, db_1.checkDbConnection)();
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Cache-Control', 'no-cache');
            res.json({
                status: isConnected ? 'OK' : 'Database Error',
                timestamp: new Date().toISOString(),
                database: isConnected ? 'Connected' : 'Disconnected',
                environment: process.env.NODE_ENV || 'development'
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Health check failed';
            res.status(503).json({
                status: 'Error',
                message: errorMessage,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        }
    }));
    return router;
};
describe('Health API', () => {
    let app;
    let healthRouter;
    beforeEach(() => {
        // Create a new Express app for each test
        app = (0, express_1.default)();
        healthRouter = createHealthRoutes();
        app.use('/health', healthRouter);
        // Reset all mocks
        jest.clearAllMocks();
    });
    describe('GET /health/ping', () => {
        it('should return a 200 status with OK response', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/health/ping');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('environment');
            expect(response.headers['access-control-allow-origin']).toBe('*');
            expect(response.headers['cache-control']).toBe('no-cache');
        }));
    });
    describe('GET /health', () => {
        it('should return a 200 status with database connected', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database connection check to return true
            db_1.checkDbConnection.mockResolvedValue(true);
            const response = yield (0, supertest_1.default)(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('database', 'Connected');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('environment');
            expect(response.headers['access-control-allow-origin']).toBe('*');
            expect(response.headers['cache-control']).toBe('no-cache');
        }));
        it('should return a 200 status with database disconnected', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database connection check to return false
            db_1.checkDbConnection.mockResolvedValue(false);
            const response = yield (0, supertest_1.default)(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'Database Error');
            expect(response.body).toHaveProperty('database', 'Disconnected');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('environment');
        }));
        it('should return a 503 status when database check throws an error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the database connection check to throw an error
            db_1.checkDbConnection.mockRejectedValue(new Error('Database connection failed'));
            const response = yield (0, supertest_1.default)(app).get('/health');
            expect(response.status).toBe(503);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('message', 'Database connection failed');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('environment');
        }));
    });
});
