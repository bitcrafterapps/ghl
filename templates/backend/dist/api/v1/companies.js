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
const express_1 = require("express");
const company_service_1 = require("../../services/company.service");
const user_service_1 = require("../../services/user.service");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('CompaniesAPI');
// Middleware to log companies endpoint requests
router.use((req, _res, next) => {
    logger.debug(`Companies endpoint accessed: ${req.method} ${req.path}`);
    next();
});
router.get('/', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        logger.debug('Getting all companies');
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to access all companies without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to access this resource'));
        }
        const companies = yield company_service_1.CompanyService.getAllCompanies();
        logger.debug(`Retrieved ${companies.length} companies`);
        return res.json((0, response_types_1.createSuccessResponse)(companies));
    }
    catch (error) {
        logger.error('Error getting companies:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('COMPANIES_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch companies'));
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        logger.debug('Creating new company');
        // For signup flow, we don't require authentication
        // Check if user has admin privileges only if authenticated
        if (req.user) {
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
                logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to create a company without admin privileges`);
                return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to create companies'));
            }
        }
        // Validate required fields
        const requiredFields = ['name', 'addressLine1', 'city', 'state', 'zip', 'email', 'phone'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            logger.debug(`Missing required fields: ${missingFields.join(', ')}`);
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', `Missing required fields: ${missingFields.join(', ')}`));
        }
        // Validate state format (2 characters)
        if (req.body.state.length !== 2) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'State must be a 2-character code'));
        }
        // Validate zip code format (5 digits)
        if (!/^\d{5}$/.test(req.body.zip)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Zip code must be 5 digits'));
        }
        // Create the company
        const company = yield company_service_1.CompanyService.createCompany(req.body);
        logger.debug(`Created company with ID: ${company.id}`);
        return res.status(201).json((0, response_types_1.createSuccessResponse)(company));
    }
    catch (error) {
        logger.error('Error creating company:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('COMPANY_CREATE_FAILED', error instanceof Error ? error.message : 'Failed to create company'));
    }
}));
router.get('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const companyId = parseInt(req.params.id);
        if (isNaN(companyId)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Company ID must be a number'));
        }
        logger.debug(`Getting company with ID: ${companyId}`);
        // Check if user has admin privileges or belongs to the company
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        const isAdmin = currentUser === null || currentUser === void 0 ? void 0 : currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role));
        // Get company with users
        const companyWithUsers = yield company_service_1.CompanyService.getCompanyWithUsers(companyId);
        if (!companyWithUsers) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Company with ID ${companyId} not found`));
        }
        // Check if user belongs to the company
        const userBelongsToCompany = companyWithUsers.users.some(user => user.id === req.user.userId);
        if (!isAdmin && !userBelongsToCompany) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to access company ${companyId} without permission`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to access this company'));
        }
        return res.json((0, response_types_1.createSuccessResponse)(companyWithUsers));
    }
    catch (error) {
        logger.error('Error getting company:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('COMPANY_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch company'));
    }
}));
router.put('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const companyId = parseInt(req.params.id);
        if (isNaN(companyId)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Company ID must be a number'));
        }
        logger.debug(`Updating company with ID: ${companyId}`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to update company ${companyId} without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to update companies'));
        }
        // Check if company exists
        const existingCompany = yield company_service_1.CompanyService.getCompanyById(companyId);
        if (!existingCompany) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Company with ID ${companyId} not found`));
        }
        // Validate state format if provided
        if (req.body.state && req.body.state.length !== 2) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'State must be a 2-character code'));
        }
        // Validate zip code format if provided
        if (req.body.zip && !/^\d{5}$/.test(req.body.zip)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Zip code must be 5 digits'));
        }
        // Update the company
        const updatedCompany = yield company_service_1.CompanyService.updateCompany(companyId, req.body);
        logger.debug(`Updated company with ID: ${companyId}`);
        return res.json((0, response_types_1.createSuccessResponse)(updatedCompany));
    }
    catch (error) {
        logger.error('Error updating company:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('COMPANY_UPDATE_FAILED', error instanceof Error ? error.message : 'Failed to update company'));
    }
}));
router.delete('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const companyId = parseInt(req.params.id);
        if (isNaN(companyId)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Company ID must be a number'));
        }
        logger.debug(`Deleting company with ID: ${companyId}`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to delete company ${companyId} without Site Admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to delete companies'));
        }
        // Check if company exists
        const existingCompany = yield company_service_1.CompanyService.getCompanyById(companyId);
        if (!existingCompany) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Company with ID ${companyId} not found`));
        }
        // Delete the company
        yield company_service_1.CompanyService.deleteCompany(companyId);
        logger.debug(`Deleted company with ID: ${companyId}`);
        return res.status(204).send();
    }
    catch (error) {
        logger.error('Error deleting company:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('COMPANY_DELETE_FAILED', error instanceof Error ? error.message : 'Failed to delete company'));
    }
}));
router.post('/:id/users', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const companyId = parseInt(req.params.id);
        if (isNaN(companyId)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Company ID must be a number'));
        }
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'User ID is required'));
        }
        logger.debug(`Adding user ${userId} to company ${companyId}`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to add user to company ${companyId} without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to add users to companies'));
        }
        // Check if company exists
        const company = yield company_service_1.CompanyService.getCompanyById(companyId);
        if (!company) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Company with ID ${companyId} not found`));
        }
        // Check if user exists
        const user = yield user_service_1.UserService.getUserById(userId);
        if (!user) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `User with ID ${userId} not found`));
        }
        // Check if user is already in the company
        const companyUsers = yield company_service_1.CompanyService.getCompanyUsers(companyId);
        if (companyUsers.some(u => u.id === userId)) {
            return res.status(409).json((0, response_types_1.createErrorResponse)('CONFLICT', `User with ID ${userId} is already in company ${companyId}`));
        }
        // Add user to company
        yield company_service_1.CompanyService.addUserToCompany(companyId, userId);
        logger.debug(`Added user ${userId} to company ${companyId}`);
        return res.status(201).json((0, response_types_1.createSuccessResponse)({ message: `User ${userId} added to company ${companyId}` }));
    }
    catch (error) {
        logger.error('Error adding user to company:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('ADD_USER_FAILED', error instanceof Error ? error.message : 'Failed to add user to company'));
    }
}));
router.delete('/:id/users/:userId', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const companyId = parseInt(req.params.id);
        const userId = parseInt(req.params.userId);
        if (isNaN(companyId) || isNaN(userId)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Company ID and User ID must be numbers'));
        }
        logger.debug(`Removing user ${userId} from company ${companyId}`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to remove user from company ${companyId} without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to remove users from companies'));
        }
        // Check if company exists
        const company = yield company_service_1.CompanyService.getCompanyById(companyId);
        if (!company) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Company with ID ${companyId} not found`));
        }
        // Check if user exists
        const user = yield user_service_1.UserService.getUserById(userId);
        if (!user) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `User with ID ${userId} not found`));
        }
        // Check if user is in the company
        const companyUsers = yield company_service_1.CompanyService.getCompanyUsers(companyId);
        if (!companyUsers.some(u => u.id === userId)) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `User with ID ${userId} is not in company ${companyId}`));
        }
        // Remove user from company
        yield company_service_1.CompanyService.removeUserFromCompany(companyId, userId);
        logger.debug(`Removed user ${userId} from company ${companyId}`);
        return res.status(204).send();
    }
    catch (error) {
        logger.error('Error removing user from company:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('REMOVE_USER_FAILED', error instanceof Error ? error.message : 'Failed to remove user from company'));
    }
}));
logger.info('All company routes mounted successfully');
exports.default = router;
