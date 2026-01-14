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
const company_service_1 = require("../../services/company.service");
const user_service_1 = require("../../services/user.service");
const test_utils_1 = require("../utils/test-utils");
// Mock the services
jest.mock('../../services/company.service');
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
        req.user = { userId: 1 }; // Default to admin user
        next();
    })
}));
// Create a simple companies router for testing
const createCompaniesRouter = () => {
    const router = (0, express_2.Router)();
    // Get all companies
    router.get('/', require('../../middleware/v1/auth.middleware').authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check if user has admin privileges
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
                return res.status(403).json(createErrorResponse('FORBIDDEN', 'You do not have permission to access this resource'));
            }
            const companies = yield company_service_1.CompanyService.getAllCompanies();
            res.json(createSuccessResponse(companies));
        }
        catch (error) {
            res.status(500).json(createErrorResponse('COMPANIES_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch companies'));
        }
    }));
    // Get company by ID
    router.get('/:id', require('../../middleware/v1/auth.middleware').authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const companyId = parseInt(req.params.id);
            if (isNaN(companyId)) {
                return res.status(400).json(createErrorResponse('INVALID_ID', 'Company ID must be a number'));
            }
            // Check if user has admin privileges or belongs to the company
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            const isAdmin = currentUser === null || currentUser === void 0 ? void 0 : currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role));
            // Get company with users
            const companyWithUsers = yield company_service_1.CompanyService.getCompanyWithUsers(companyId);
            if (!companyWithUsers) {
                return res.status(404).json(createErrorResponse('NOT_FOUND', `Company with ID ${companyId} not found`));
            }
            // Check if user belongs to the company
            const userBelongsToCompany = companyWithUsers.users.some(user => user.id === req.user.userId);
            if (!isAdmin && !userBelongsToCompany) {
                return res.status(403).json(createErrorResponse('FORBIDDEN', 'You do not have permission to access this company'));
            }
            return res.json(createSuccessResponse(companyWithUsers));
        }
        catch (error) {
            return res.status(500).json(createErrorResponse('COMPANY_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch company'));
        }
    }));
    // Create company
    router.post('/', require('../../middleware/v1/auth.middleware').authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check if user has admin privileges
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
                return res.status(403).json(createErrorResponse('FORBIDDEN', 'You do not have permission to create companies'));
            }
            // Validate required fields
            const requiredFields = ['name', 'addressLine1', 'city', 'state', 'zip', 'email', 'phone'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            if (missingFields.length > 0) {
                return res.status(400).json(createErrorResponse('VALIDATION_ERROR', `Missing required fields: ${missingFields.join(', ')}`));
            }
            // Validate state format (2 characters)
            if (req.body.state.length !== 2) {
                return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'State must be a 2-character code'));
            }
            // Validate zip code format (5 digits)
            if (!/^\d{5}$/.test(req.body.zip)) {
                return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Zip code must be 5 digits'));
            }
            // Create the company
            const company = yield company_service_1.CompanyService.createCompany(req.body);
            return res.status(201).json(createSuccessResponse(company));
        }
        catch (error) {
            return res.status(500).json(createErrorResponse('COMPANY_CREATE_FAILED', error instanceof Error ? error.message : 'Failed to create company'));
        }
    }));
    return router;
};
describe('Companies API', () => {
    let app;
    let companiesRouter;
    beforeEach(() => {
        // Create a new Express app for each test
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        companiesRouter = createCompaniesRouter();
        app.use('/companies', companiesRouter);
        // Reset all mocks
        jest.clearAllMocks();
    });
    describe('GET /companies', () => {
        it('should return all companies for admin user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.getUserById method to return an admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                roles: ['Admin']
            });
            // Mock the CompanyService.getAllCompanies method
            company_service_1.CompanyService.getAllCompanies.mockResolvedValue(test_utils_1.mockCompanies);
            const response = yield (0, supertest_1.default)(app).get('/companies');
            // Convert dates to strings for comparison
            const expectedResponse = createSuccessResponse(test_utils_1.mockCompanies.map(company => (Object.assign(Object.assign({}, company), { createdAt: company.createdAt.toISOString(), updatedAt: company.updatedAt.toISOString() }))));
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expectedResponse);
            expect(company_service_1.CompanyService.getAllCompanies).toHaveBeenCalledTimes(1);
        }));
        it('should return 403 for non-admin user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.getUserById method to return a non-admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 2,
                name: 'Regular User',
                email: 'user@example.com',
                roles: ['User']
            });
            const response = yield (0, supertest_1.default)(app).get('/companies');
            expect(response.status).toBe(403);
            expect(response.body).toEqual(createErrorResponse('FORBIDDEN', 'You do not have permission to access this resource'));
            expect(company_service_1.CompanyService.getAllCompanies).not.toHaveBeenCalled();
        }));
        it('should return 500 when there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.getUserById method to return an admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                roles: ['Admin']
            });
            // Mock the CompanyService.getAllCompanies method to throw an error
            company_service_1.CompanyService.getAllCompanies.mockRejectedValue(new Error('Database error'));
            const response = yield (0, supertest_1.default)(app).get('/companies');
            expect(response.status).toBe(500);
            expect(response.body).toEqual(createErrorResponse('COMPANIES_FETCH_FAILED', 'Database error'));
        }));
    });
    describe('GET /companies/:id', () => {
        it('should return a company by ID for admin user', () => __awaiter(void 0, void 0, void 0, function* () {
            const companyId = 1;
            const companyWithUsers = Object.assign(Object.assign({}, test_utils_1.mockCompanies[0]), { users: [test_utils_1.mockUsers[0], test_utils_1.mockUsers[1]] });
            // Mock the UserService.getUserById method to return an admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                roles: ['Admin']
            });
            // Mock the CompanyService.getCompanyWithUsers method
            company_service_1.CompanyService.getCompanyWithUsers.mockResolvedValue(companyWithUsers);
            const response = yield (0, supertest_1.default)(app).get(`/companies/${companyId}`);
            // Convert dates to strings for comparison
            const expectedCompany = Object.assign(Object.assign({}, companyWithUsers), { createdAt: companyWithUsers.createdAt.toISOString(), updatedAt: companyWithUsers.updatedAt.toISOString(), users: companyWithUsers.users.map(user => (Object.assign(Object.assign({}, user), { createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }))) });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(createSuccessResponse(expectedCompany));
            expect(company_service_1.CompanyService.getCompanyWithUsers).toHaveBeenCalledWith(companyId);
        }));
        it('should return a company by ID for user belonging to the company', () => __awaiter(void 0, void 0, void 0, function* () {
            const companyId = 1;
            const companyWithUsers = Object.assign(Object.assign({}, test_utils_1.mockCompanies[0]), { users: [
                    Object.assign(Object.assign({}, test_utils_1.mockUsers[0]), { id: 2 }), // User with ID 2 belongs to the company
                    test_utils_1.mockUsers[1]
                ] });
            // Create a new app with a router that uses the user-specific middleware
            const testApp = (0, express_1.default)();
            testApp.use(express_1.default.json());
            // Override the default mock to make the user belong to the company
            const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
            require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
                req.user = { userId: 2 }; // User with ID 2 belongs to the company
                next();
            });
            // Mock the UserService.getUserById method to return a regular user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 2,
                name: 'Regular User',
                email: 'user@example.com',
                roles: ['User']
            });
            // Mock the CompanyService.getCompanyWithUsers method
            company_service_1.CompanyService.getCompanyWithUsers.mockResolvedValue(companyWithUsers);
            // Create a new router with the mocked middleware
            const testRouter = createCompaniesRouter();
            testApp.use('/companies', testRouter);
            const response = yield (0, supertest_1.default)(testApp).get(`/companies/${companyId}`);
            // Convert dates to strings for comparison
            const expectedCompany = Object.assign(Object.assign({}, companyWithUsers), { createdAt: companyWithUsers.createdAt.toISOString(), updatedAt: companyWithUsers.updatedAt.toISOString(), users: companyWithUsers.users.map(user => (Object.assign(Object.assign({}, user), { createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }))) });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(createSuccessResponse(expectedCompany));
            expect(company_service_1.CompanyService.getCompanyWithUsers).toHaveBeenCalledWith(companyId);
            // Restore the original mock
            require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
        }));
        it('should return 400 for invalid company ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/companies/invalid');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(createErrorResponse('INVALID_ID', 'Company ID must be a number'));
        }));
        it('should return 404 when company is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const companyId = 999;
            // Mock the UserService.getUserById method to return an admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                roles: ['Admin']
            });
            // Mock the CompanyService.getCompanyWithUsers method to return null
            company_service_1.CompanyService.getCompanyWithUsers.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app).get(`/companies/${companyId}`);
            expect(response.status).toBe(404);
            expect(response.body).toEqual(createErrorResponse('NOT_FOUND', `Company with ID ${companyId} not found`));
        }));
        it('should return 403 for user not belonging to the company', () => __awaiter(void 0, void 0, void 0, function* () {
            const companyId = 1;
            const companyWithUsers = Object.assign(Object.assign({}, test_utils_1.mockCompanies[0]), { users: [test_utils_1.mockUsers[0], test_utils_1.mockUsers[1]] // Users with IDs 1 and 3
             });
            // Create a new app with a router that uses the user-specific middleware
            const testApp = (0, express_1.default)();
            testApp.use(express_1.default.json());
            // Override the default mock to make the user not belong to the company
            const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
            require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
                req.user = { userId: 2 }; // User with ID 2 does not belong to the company
                next();
            });
            // Mock the UserService.getUserById method to return a regular user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 2,
                name: 'Regular User',
                email: 'user@example.com',
                roles: ['User']
            });
            // Mock the CompanyService.getCompanyWithUsers method
            company_service_1.CompanyService.getCompanyWithUsers.mockResolvedValue(companyWithUsers);
            // Create a new router with the mocked middleware
            const testRouter = createCompaniesRouter();
            testApp.use('/companies', testRouter);
            const response = yield (0, supertest_1.default)(testApp).get(`/companies/${companyId}`);
            expect(response.status).toBe(403);
            expect(response.body).toEqual(createErrorResponse('FORBIDDEN', 'You do not have permission to access this company'));
            // Restore the original mock
            require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
        }));
    });
    describe('POST /companies', () => {
        const validCompanyData = {
            name: 'New Company',
            addressLine1: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            email: 'info@newcompany.com',
            phone: '555-123-4567'
        };
        it('should create a company successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const createdCompany = Object.assign({ id: 3 }, validCompanyData);
            // Mock the UserService.getUserById method to return an admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                roles: ['Admin']
            });
            // Mock the CompanyService.createCompany method
            company_service_1.CompanyService.createCompany.mockResolvedValue(createdCompany);
            const response = yield (0, supertest_1.default)(app)
                .post('/companies')
                .send(validCompanyData);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(createSuccessResponse(createdCompany));
            expect(company_service_1.CompanyService.createCompany).toHaveBeenCalledWith(validCompanyData);
        }));
        it('should return 403 for non-admin user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the UserService.getUserById method to return a non-admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 2,
                name: 'Regular User',
                email: 'user@example.com',
                roles: ['User']
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/companies')
                .send(validCompanyData);
            expect(response.status).toBe(403);
            expect(response.body).toEqual(createErrorResponse('FORBIDDEN', 'You do not have permission to create companies'));
            expect(company_service_1.CompanyService.createCompany).not.toHaveBeenCalled();
        }));
        it('should return 400 when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCompanyData = {
                name: 'New Company',
                // Missing required fields
            };
            // Mock the UserService.getUserById method to return an admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                roles: ['Admin']
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/companies')
                .send(invalidCompanyData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(company_service_1.CompanyService.createCompany).not.toHaveBeenCalled();
        }));
        it('should return 400 when state format is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidStateData = Object.assign(Object.assign({}, validCompanyData), { state: 'New York' // Should be 2 characters
             });
            // Mock the UserService.getUserById method to return an admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                roles: ['Admin']
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/companies')
                .send(invalidStateData);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(createErrorResponse('VALIDATION_ERROR', 'State must be a 2-character code'));
            expect(company_service_1.CompanyService.createCompany).not.toHaveBeenCalled();
        }));
        it('should return 400 when zip code format is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidZipData = Object.assign(Object.assign({}, validCompanyData), { zip: '1000' // Should be 5 digits
             });
            // Mock the UserService.getUserById method to return an admin user
            user_service_1.UserService.getUserById.mockResolvedValue({
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                roles: ['Admin']
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/companies')
                .send(invalidZipData);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(createErrorResponse('VALIDATION_ERROR', 'Zip code must be 5 digits'));
            expect(company_service_1.CompanyService.createCompany).not.toHaveBeenCalled();
        }));
    });
});
