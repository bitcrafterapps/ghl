"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const user_service_1 = require("../../services/user.service");
const email_service_1 = require("../../services/email.service");
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('PaymentsAPI');
// Plan pricing configuration (in cents)
const PLAN_PRICING = {
    pro: { amount: 49900, name: 'Pro Plan', description: 'Professional subscription - $499/month' },
    enterprise: { amount: 0, name: 'Enterprise Plan', description: 'Custom enterprise pricing' }
};
// Helper to get Stripe instance
function getStripeInstance() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const settings = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        const config = settings[0];
        if (!((_a = config === null || config === void 0 ? void 0 : config.paymentProcessor) === null || _a === void 0 ? void 0 : _a.enabled) || config.paymentProcessor.provider !== 'stripe') {
            return null;
        }
        const secretKey = config.paymentProcessor.testMode
            ? (_b = config.paymentProcessor.credentials) === null || _b === void 0 ? void 0 : _b.stripeSecretKey
            : (_c = config.paymentProcessor.credentials) === null || _c === void 0 ? void 0 : _c.stripeSecretKey;
        if (!secretKey) {
            return null;
        }
        return new stripe_1.default(secretKey, { apiVersion: '2025-12-15.clover' });
    });
}
/**
 * GET /api/v1/payments/config
 * Public endpoint to check if payment processing is configured
 */
router.get('/config', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const settings = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        const config = settings[0];
        const isConfigured = !!(((_a = config === null || config === void 0 ? void 0 : config.paymentProcessor) === null || _a === void 0 ? void 0 : _a.enabled) &&
            config.paymentProcessor.provider &&
            config.paymentProcessor.credentials);
        // Check if provider has required credentials
        let hasValidCredentials = false;
        if (isConfigured) {
            const provider = (_b = config.paymentProcessor) === null || _b === void 0 ? void 0 : _b.provider;
            const creds = (_c = config.paymentProcessor) === null || _c === void 0 ? void 0 : _c.credentials;
            switch (provider) {
                case 'stripe':
                    hasValidCredentials = !!((creds === null || creds === void 0 ? void 0 : creds.stripePublishableKey) && (creds === null || creds === void 0 ? void 0 : creds.stripeSecretKey));
                    break;
                case 'square':
                    hasValidCredentials = !!((creds === null || creds === void 0 ? void 0 : creds.squareApplicationId) && (creds === null || creds === void 0 ? void 0 : creds.squareAccessToken));
                    break;
                case 'paypal':
                    hasValidCredentials = !!((creds === null || creds === void 0 ? void 0 : creds.paypalClientId) && (creds === null || creds === void 0 ? void 0 : creds.paypalClientSecret));
                    break;
                case 'braintree':
                    hasValidCredentials = !!((creds === null || creds === void 0 ? void 0 : creds.braintreeMerchantId) && (creds === null || creds === void 0 ? void 0 : creds.braintreePublicKey) && (creds === null || creds === void 0 ? void 0 : creds.braintreePrivateKey));
                    break;
            }
        }
        res.json((0, response_types_1.createSuccessResponse)({
            enabled: isConfigured && hasValidCredentials,
            provider: isConfigured ? (_d = config.paymentProcessor) === null || _d === void 0 ? void 0 : _d.provider : null,
            testMode: (_f = (_e = config === null || config === void 0 ? void 0 : config.paymentProcessor) === null || _e === void 0 ? void 0 : _e.testMode) !== null && _f !== void 0 ? _f : true,
            // Only return publishable key (never secret key)
            publishableKey: ((_h = (_g = config === null || config === void 0 ? void 0 : config.paymentProcessor) === null || _g === void 0 ? void 0 : _g.credentials) === null || _h === void 0 ? void 0 : _h.stripePublishableKey) || null,
            currency: ((_j = config === null || config === void 0 ? void 0 : config.paymentProcessor) === null || _j === void 0 ? void 0 : _j.defaultCurrency) || 'USD'
        }));
    }
    catch (error) {
        logger.error('Error fetching payment config:', error);
        res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch payment configuration'));
    }
}));
/**
 * POST /api/v1/payments/create-payment-intent
 * Create a Stripe PaymentIntent for signup
 */
router.post('/create-payment-intent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { planId, email, billingName } = req.body;
        if (!planId || !email) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Plan ID and email are required'));
        }
        const plan = PLAN_PRICING[planId];
        if (!plan) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Invalid plan'));
        }
        const stripe = yield getStripeInstance();
        if (!stripe) {
            return res.status(503).json((0, response_types_1.createErrorResponse)('PAYMENT_NOT_CONFIGURED', 'Payment processing is not configured'));
        }
        // Get payment settings for currency
        const settings = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        const currency = ((_c = (_b = (_a = settings[0]) === null || _a === void 0 ? void 0 : _a.paymentProcessor) === null || _b === void 0 ? void 0 : _b.defaultCurrency) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || 'usd';
        // Create PaymentIntent
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: plan.amount,
            currency: currency,
            metadata: {
                planId,
                planName: plan.name,
                email,
                billingName: billingName || ''
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        logger.info(`Created PaymentIntent ${paymentIntent.id} for ${email}, plan: ${planId}`);
        res.json((0, response_types_1.createSuccessResponse)({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: plan.amount,
            currency: currency.toUpperCase()
        }));
    }
    catch (error) {
        logger.error('Error creating payment intent:', error);
        res.status(500).json((0, response_types_1.createErrorResponse)('PAYMENT_ERROR', 'Failed to create payment intent'));
    }
}));
/**
 * POST /api/v1/payments/confirm-and-register
 * Confirm payment was successful and register the user
 */
router.post('/confirm-and-register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const { paymentIntentId, email, password, firstName, lastName, selectedPlan, companyName } = req.body;
        // Validate required fields
        if (!paymentIntentId || !email || !password || !firstName || !selectedPlan) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Payment intent ID, email, password, first name, and plan are required'));
        }
        const stripe = yield getStripeInstance();
        if (!stripe) {
            return res.status(503).json((0, response_types_1.createErrorResponse)('PAYMENT_NOT_CONFIGURED', 'Payment processing is not configured'));
        }
        // Retrieve and verify the PaymentIntent
        const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            // Create failed transaction record
            yield db_1.db.insert(schema_1.transactions).values({
                userEmail: email,
                type: 'subscription',
                status: 'failed',
                provider: 'stripe',
                providerTransactionId: paymentIntentId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency.toUpperCase(),
                planId: selectedPlan,
                planName: ((_a = PLAN_PRICING[selectedPlan]) === null || _a === void 0 ? void 0 : _a.name) || selectedPlan,
                billingName: firstName + (lastName ? ' ' + lastName : ''),
                billingEmail: email,
                errorCode: ((_b = paymentIntent.last_payment_error) === null || _b === void 0 ? void 0 : _b.code) || 'payment_failed',
                errorMessage: ((_c = paymentIntent.last_payment_error) === null || _c === void 0 ? void 0 : _c.message) || 'Payment was not successful'
            });
            return res.status(400).json((0, response_types_1.createErrorResponse)('PAYMENT_FAILED', `Payment failed: ${((_d = paymentIntent.last_payment_error) === null || _d === void 0 ? void 0 : _d.message) || 'Payment was not successful'}`));
        }
        // Verify email matches
        if (paymentIntent.metadata.email !== email) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Email does not match payment intent'));
        }
        // Get payment method details for card info
        let cardLast4;
        let cardBrand;
        if (paymentIntent.payment_method) {
            try {
                const paymentMethod = yield stripe.paymentMethods.retrieve(paymentIntent.payment_method);
                if (paymentMethod.card) {
                    cardLast4 = paymentMethod.card.last4;
                    cardBrand = paymentMethod.card.brand;
                }
            }
            catch (err) {
                logger.warn('Could not retrieve payment method details:', err);
            }
        }
        // Plan limits
        const planLimits = {
            starter: { maxProjects: 3, maxGenerations: 20 },
            pro: { maxProjects: null, maxGenerations: null },
            enterprise: { maxProjects: null, maxGenerations: null }
        };
        const limits = planLimits[selectedPlan] || planLimits.pro;
        // Create the user
        let user;
        try {
            user = yield user_service_1.UserService.createUser({
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
        }
        catch (createError) {
            logger.error('Failed to create user after payment:', createError);
            // Record the transaction but note the user creation failed
            yield db_1.db.insert(schema_1.transactions).values({
                userEmail: email,
                type: 'subscription',
                status: 'captured', // Payment succeeded but user creation failed
                provider: 'stripe',
                providerTransactionId: paymentIntentId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency.toUpperCase(),
                planId: selectedPlan,
                planName: ((_e = PLAN_PRICING[selectedPlan]) === null || _e === void 0 ? void 0 : _e.name) || selectedPlan,
                cardLast4,
                cardBrand,
                billingName: firstName + (lastName ? ' ' + lastName : ''),
                billingEmail: email,
                capturedAt: new Date(),
                metadata: { userCreationFailed: true, error: createError.message }
            });
            // Check for duplicate email
            if ((_f = createError.message) === null || _f === void 0 ? void 0 : _f.includes('duplicate')) {
                return res.status(409).json((0, response_types_1.createErrorResponse)('EMAIL_EXISTS', 'An account with this email already exists. Payment was processed - please contact support.'));
            }
            return res.status(400).json((0, response_types_1.createErrorResponse)('USER_CREATION_FAILED', 'Payment succeeded but account creation failed. Please contact support.'));
        }
        // Create successful transaction record
        yield db_1.db.insert(schema_1.transactions).values({
            userId: user.id,
            userEmail: email,
            type: 'subscription',
            status: 'captured',
            provider: 'stripe',
            providerTransactionId: paymentIntentId,
            providerCustomerId: paymentIntent.customer || undefined,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency.toUpperCase(),
            planId: selectedPlan,
            planName: ((_g = PLAN_PRICING[selectedPlan]) === null || _g === void 0 ? void 0 : _g.name) || selectedPlan,
            description: (_h = PLAN_PRICING[selectedPlan]) === null || _h === void 0 ? void 0 : _h.description,
            cardLast4,
            cardBrand,
            billingName: firstName + (lastName ? ' ' + lastName : ''),
            billingEmail: email,
            authorizedAt: new Date(),
            capturedAt: new Date()
        });
        logger.info(`User ${user.id} created with ${selectedPlan} plan after successful payment ${paymentIntentId}`);
        // Handle company creation if provided
        let createdCompanyId = null;
        if (companyName && companyName.trim()) {
            try {
                const { companies, companyUsers } = yield Promise.resolve().then(() => __importStar(require('../../db/schema')));
                const [company] = yield db_1.db.insert(companies).values({
                    name: companyName.trim(),
                    addressLine1: '',
                    city: '',
                    state: '',
                    zip: '',
                    email: email,
                    phone: ''
                }).returning();
                createdCompanyId = company.id;
                yield db_1.db.insert(companyUsers).values({
                    companyId: company.id,
                    userId: user.id
                });
                logger.debug(`Company ${company.id} created for user ${user.id}`);
            }
            catch (companyError) {
                logger.error('Failed to create company:', companyError);
            }
        }
        // Auto-login
        const loginResponse = yield user_service_1.UserService.login({ email, password });
        const userWithCompany = createdCompanyId
            ? Object.assign(Object.assign({}, loginResponse.user), { companyId: createdCompanyId }) : loginResponse.user;
        // Send welcome email
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
                logger.error('Failed to send welcome email:', err);
            });
        }
        catch (emailError) {
            logger.error('Failed to initiate welcome email:', emailError);
        }
        res.status(201).json((0, response_types_1.createSuccessResponse)({
            token: loginResponse.token,
            user: userWithCompany,
            transactionId: paymentIntentId
        }));
    }
    catch (error) {
        logger.error('Confirm and register failed:', error);
        res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', error instanceof Error ? error.message : 'Registration failed'));
    }
}));
/**
 * GET /api/v1/payments/plans
 * Get available pricing plans
 */
router.get('/plans', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const settings = yield db_1.db.select().from(schema_1.siteSettings).limit(1);
        const currency = ((_b = (_a = settings[0]) === null || _a === void 0 ? void 0 : _a.paymentProcessor) === null || _b === void 0 ? void 0 : _b.defaultCurrency) || 'USD';
        const plans = Object.entries(PLAN_PRICING).map(([id, plan]) => ({
            id,
            name: plan.name,
            amount: plan.amount,
            currency,
            description: plan.description
        }));
        res.json((0, response_types_1.createSuccessResponse)({ plans }));
    }
    catch (error) {
        logger.error('Error fetching plans:', error);
        res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch plans'));
    }
}));
exports.default = router;
