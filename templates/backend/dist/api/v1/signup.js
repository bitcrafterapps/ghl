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
const user_service_1 = require("../../services/user.service");
const email_service_1 = require("../../services/email.service");
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('SignupAPI');
/**
 * POST /api/v1/signup
 * Public endpoint for user registration with pricing plan selection.
 * Creates user with role 'User', status 'active', and returns JWT for auto-login.
 * Optionally creates a company and links the user to it.
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, selectedPlan, companyName } = req.body;
        // Validate required fields
        if (!email || !password || !firstName || !selectedPlan) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Email, password, first name, and plan selection are required'));
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Invalid email format'));
        }
        // Validate password length
        if (password.length < 8) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Password must be at least 8 characters'));
        }
        // Validate plan selection
        const validPlans = ['starter', 'pro', 'enterprise'];
        if (!validPlans.includes(selectedPlan)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Invalid plan selection. Must be starter, pro, or enterprise'));
        }
        logger.debug(`Signup attempt for: ${email} with plan: ${selectedPlan}${companyName ? `, company: ${companyName}` : ''}`);
        // Determine limits based on plan
        // Starter: 3 projects, 20 generations
        // Pro/Enterprise: unlimited (null means no limit)
        const planLimits = {
            starter: { maxProjects: 3, maxGenerations: 20 },
            pro: { maxProjects: null, maxGenerations: null },
            enterprise: { maxProjects: null, maxGenerations: null }
        };
        const limits = planLimits[selectedPlan];
        // Create the user with 'User' role and 'active' status
        const user = yield user_service_1.UserService.createUser({
            email,
            password,
            firstName,
            lastName: lastName || '',
            roles: ['User'],
            status: 'active',
            selectedPlan,
            maxProjects: limits.maxProjects,
            maxGenerations: limits.maxGenerations
        });
        logger.debug(`User created successfully: ${user.id}`);
        // If company name provided, create company and link user
        let createdCompanyId = null;
        if (companyName && companyName.trim()) {
            try {
                const [company] = yield db_1.db.insert(schema_1.companies).values({
                    name: companyName.trim(),
                    // Required fields with placeholder values - user can update later in profile
                    addressLine1: '',
                    city: '',
                    state: '',
                    zip: '',
                    email: email, // Use signup email as company contact
                    phone: ''
                }).returning();
                createdCompanyId = company.id;
                logger.debug(`Company created: ${company.id} - ${company.name}`);
                // Link user to company
                yield db_1.db.insert(schema_1.companyUsers).values({
                    companyId: company.id,
                    userId: user.id
                });
                logger.debug(`User ${user.id} linked to company ${company.id}`);
            }
            catch (companyError) {
                // Log error but don't fail signup - company creation is optional
                logger.error('Failed to create company:', companyError);
            }
        }
        // Auto-login: get token by calling login service
        const loginResponse = yield user_service_1.UserService.login({ email, password });
        logger.info(`User signed up and logged in: ${email}`);
        // Include companyId in the user response if a company was created
        const userWithCompany = createdCompanyId
            ? Object.assign(Object.assign({}, loginResponse.user), { companyId: createdCompanyId }) : loginResponse.user;
        // Send welcome email asynchronously
        try {
            email_service_1.EmailService.send({
                to: email,
                templateKey: 'welcome',
                variables: {
                    firstName: firstName,
                    planName: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
                },
                userId: user.id
            }).catch((err) => {
                logger.error('Failed to send welcome email (async catch):', err);
            });
        }
        catch (emailError) {
            logger.error('Failed to initiate welcome email:', emailError);
        }
        res.status(201).json((0, response_types_1.createSuccessResponse)({
            token: loginResponse.token,
            user: userWithCompany
        }));
    }
    catch (error) {
        logger.error('Signup failed:', error);
        // Check for duplicate email error
        if (error instanceof Error && error.message.includes('duplicate')) {
            return res.status(409).json((0, response_types_1.createErrorResponse)('EMAIL_EXISTS', 'An account with this email already exists'));
        }
        res.status(400).json((0, response_types_1.createErrorResponse)('SIGNUP_FAILED', error instanceof Error ? error.message : 'Signup failed'));
    }
}));
exports.default = router;
