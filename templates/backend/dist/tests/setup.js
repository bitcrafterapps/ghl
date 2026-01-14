"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env.test if it exists, otherwise from .env
dotenv_1.default.config({ path: '.env.test' });
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
