import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../../db';
import { siteSettings, transactions, users } from '../../db/schema';
import { UserService } from '../../services/user.service';
import { EmailService } from '../../services/email.service';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import { eq } from 'drizzle-orm';

const router = Router();
const logger = LoggerFactory.getLogger('PaymentsAPI');

// Plan pricing configuration (in cents)
const PLAN_PRICING: Record<string, { amount: number; name: string; description: string }> = {
  pro: { amount: 49900, name: 'Pro Plan', description: 'Professional subscription - $499/month' },
  enterprise: { amount: 0, name: 'Enterprise Plan', description: 'Custom enterprise pricing' }
};

// Helper to get Stripe instance
async function getStripeInstance(): Promise<Stripe | null> {
  const settings = await db.select().from(siteSettings).limit(1);
  const config = settings[0];

  if (!config?.paymentProcessor?.enabled || config.paymentProcessor.provider !== 'stripe') {
    return null;
  }

  const secretKey = config.paymentProcessor.testMode
    ? config.paymentProcessor.credentials?.stripeSecretKey
    : config.paymentProcessor.credentials?.stripeSecretKey;

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey, { apiVersion: '2025-12-15.clover' });
}

/**
 * GET /api/v1/payments/config
 * Public endpoint to check if payment processing is configured
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    const config = settings[0];

    const isConfigured = !!(
      config?.paymentProcessor?.enabled &&
      config.paymentProcessor.provider &&
      config.paymentProcessor.credentials
    );

    // Check if provider has required credentials
    let hasValidCredentials = false;
    if (isConfigured) {
      const provider = config.paymentProcessor?.provider;
      const creds = config.paymentProcessor?.credentials;

      switch (provider) {
        case 'stripe':
          hasValidCredentials = !!(creds?.stripePublishableKey && creds?.stripeSecretKey);
          break;
        case 'square':
          hasValidCredentials = !!(creds?.squareApplicationId && creds?.squareAccessToken);
          break;
        case 'paypal':
          hasValidCredentials = !!(creds?.paypalClientId && creds?.paypalClientSecret);
          break;
        case 'braintree':
          hasValidCredentials = !!(creds?.braintreeMerchantId && creds?.braintreePublicKey && creds?.braintreePrivateKey);
          break;
      }
    }

    res.json(createSuccessResponse({
      enabled: isConfigured && hasValidCredentials,
      provider: isConfigured ? config.paymentProcessor?.provider : null,
      testMode: config?.paymentProcessor?.testMode ?? true,
      // Only return publishable key (never secret key)
      publishableKey: config?.paymentProcessor?.credentials?.stripePublishableKey || null,
      currency: config?.paymentProcessor?.defaultCurrency || 'USD'
    }));
  } catch (error) {
    logger.error('Error fetching payment config:', error);
    res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch payment configuration'));
  }
});

/**
 * POST /api/v1/payments/create-payment-intent
 * Create a Stripe PaymentIntent for signup
 */
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { planId, email, billingName } = req.body;

    if (!planId || !email) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Plan ID and email are required'));
    }

    const plan = PLAN_PRICING[planId];
    if (!plan) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Invalid plan'));
    }

    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(503).json(createErrorResponse('PAYMENT_NOT_CONFIGURED', 'Payment processing is not configured'));
    }

    // Get payment settings for currency
    const settings = await db.select().from(siteSettings).limit(1);
    const currency = settings[0]?.paymentProcessor?.defaultCurrency?.toLowerCase() || 'usd';

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
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

    res.json(createSuccessResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: plan.amount,
      currency: currency.toUpperCase()
    }));
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json(createErrorResponse('PAYMENT_ERROR', 'Failed to create payment intent'));
  }
});

/**
 * POST /api/v1/payments/confirm-and-register
 * Confirm payment was successful and register the user
 */
router.post('/confirm-and-register', async (req: Request, res: Response) => {
  try {
    const {
      paymentIntentId,
      email,
      password,
      firstName,
      lastName,
      selectedPlan,
      companyName
    } = req.body;

    // Validate required fields
    if (!paymentIntentId || !email || !password || !firstName || !selectedPlan) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Payment intent ID, email, password, first name, and plan are required'
      ));
    }

    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(503).json(createErrorResponse('PAYMENT_NOT_CONFIGURED', 'Payment processing is not configured'));
    }

    // Retrieve and verify the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      // Create failed transaction record
      await db.insert(transactions).values({
        userEmail: email,
        type: 'subscription',
        status: 'failed',
        provider: 'stripe',
        providerTransactionId: paymentIntentId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        planId: selectedPlan,
        planName: PLAN_PRICING[selectedPlan]?.name || selectedPlan,
        billingName: firstName + (lastName ? ' ' + lastName : ''),
        billingEmail: email,
        errorCode: paymentIntent.last_payment_error?.code || 'payment_failed',
        errorMessage: paymentIntent.last_payment_error?.message || 'Payment was not successful'
      });

      return res.status(400).json(createErrorResponse(
        'PAYMENT_FAILED',
        `Payment failed: ${paymentIntent.last_payment_error?.message || 'Payment was not successful'}`
      ));
    }

    // Verify email matches
    if (paymentIntent.metadata.email !== email) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Email does not match payment intent'
      ));
    }

    // Get payment method details for card info
    let cardLast4: string | undefined;
    let cardBrand: string | undefined;

    if (paymentIntent.payment_method) {
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
        if (paymentMethod.card) {
          cardLast4 = paymentMethod.card.last4;
          cardBrand = paymentMethod.card.brand;
        }
      } catch (err) {
        logger.warn('Could not retrieve payment method details:', err);
      }
    }

    // Plan limits
    const planLimits: Record<string, { maxProjects: number | null; maxGenerations: number | null }> = {
      starter: { maxProjects: 3, maxGenerations: 20 },
      pro: { maxProjects: null, maxGenerations: null },
      enterprise: { maxProjects: null, maxGenerations: null }
    };

    const limits = planLimits[selectedPlan] || planLimits.pro;

    // Create the user
    let user;
    try {
      user = await UserService.createUser({
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
    } catch (createError: any) {
      logger.error('Failed to create user after payment:', createError);

      // Record the transaction but note the user creation failed
      await db.insert(transactions).values({
        userEmail: email,
        type: 'subscription',
        status: 'captured', // Payment succeeded but user creation failed
        provider: 'stripe',
        providerTransactionId: paymentIntentId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        planId: selectedPlan,
        planName: PLAN_PRICING[selectedPlan]?.name || selectedPlan,
        cardLast4,
        cardBrand,
        billingName: firstName + (lastName ? ' ' + lastName : ''),
        billingEmail: email,
        capturedAt: new Date(),
        metadata: { userCreationFailed: true, error: createError.message }
      });

      // Check for duplicate email
      if (createError.message?.includes('duplicate')) {
        return res.status(409).json(createErrorResponse(
          'EMAIL_EXISTS',
          'An account with this email already exists. Payment was processed - please contact support.'
        ));
      }

      return res.status(400).json(createErrorResponse(
        'USER_CREATION_FAILED',
        'Payment succeeded but account creation failed. Please contact support.'
      ));
    }

    // Create successful transaction record
    await db.insert(transactions).values({
      userId: user.id,
      userEmail: email,
      type: 'subscription',
      status: 'captured',
      provider: 'stripe',
      providerTransactionId: paymentIntentId,
      providerCustomerId: paymentIntent.customer as string || undefined,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      planId: selectedPlan,
      planName: PLAN_PRICING[selectedPlan]?.name || selectedPlan,
      description: PLAN_PRICING[selectedPlan]?.description,
      cardLast4,
      cardBrand,
      billingName: firstName + (lastName ? ' ' + lastName : ''),
      billingEmail: email,
      authorizedAt: new Date(),
      capturedAt: new Date()
    });

    logger.info(`User ${user.id} created with ${selectedPlan} plan after successful payment ${paymentIntentId}`);

    // Handle company creation if provided
    let createdCompanyId: number | null = null;
    if (companyName && companyName.trim()) {
      try {
        const { companies, companyUsers } = await import('../../db/schema');
        const [company] = await db.insert(companies).values({
          name: companyName.trim(),
          addressLine1: '',
          city: '',
          state: '',
          zip: '',
          email: email,
          phone: ''
        }).returning();

        createdCompanyId = company.id;

        await db.insert(companyUsers).values({
          companyId: company.id,
          userId: user.id
        });

        logger.debug(`Company ${company.id} created for user ${user.id}`);
      } catch (companyError) {
        logger.error('Failed to create company:', companyError);
      }
    }

    // Auto-login
    const loginResponse = await UserService.login({ email, password });

    const userWithCompany = createdCompanyId
      ? { ...loginResponse.user, companyId: createdCompanyId }
      : loginResponse.user;

    // Send welcome email
    try {
      EmailService.send({
        to: email,
        templateKey: 'welcome',
        variables: {
          firstName: firstName,
          planName: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
        },
        userId: user.id
      }).catch((err: unknown) => {
        logger.error('Failed to send welcome email:', err);
      });
    } catch (emailError) {
      logger.error('Failed to initiate welcome email:', emailError);
    }

    res.status(201).json(createSuccessResponse({
      token: loginResponse.token,
      user: userWithCompany,
      transactionId: paymentIntentId
    }));
  } catch (error) {
    logger.error('Confirm and register failed:', error);
    res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      error instanceof Error ? error.message : 'Registration failed'
    ));
  }
});

/**
 * GET /api/v1/payments/plans
 * Get available pricing plans
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    const currency = settings[0]?.paymentProcessor?.defaultCurrency || 'USD';

    const plans = Object.entries(PLAN_PRICING).map(([id, plan]) => ({
      id,
      name: plan.name,
      amount: plan.amount,
      currency,
      description: plan.description
    }));

    res.json(createSuccessResponse({ plans }));
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch plans'));
  }
});

export default router;
