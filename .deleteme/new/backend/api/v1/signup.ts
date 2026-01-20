import { Router, Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { EmailService } from '../../services/email.service';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import { db } from '../../db';
import { companies, companyUsers } from '../../db/schema';

const router = Router();
const logger = LoggerFactory.getLogger('SignupAPI');

// Types for signup
type PlanType = 'starter' | 'pro' | 'enterprise';

interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  selectedPlan: PlanType;
  companyName?: string;
}

/**
 * POST /api/v1/signup
 * Public endpoint for user registration with pricing plan selection.
 * Creates user with role 'User', status 'active', and returns JWT for auto-login.
 * Optionally creates a company and links the user to it.
 */
router.post('/', async (req: Request<{}, {}, SignupDto>, res: Response) => {
  try {
    const { email, password, firstName, lastName, selectedPlan, companyName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !selectedPlan) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Email, password, first name, and plan selection are required'
      ));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid email format'
      ));
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Password must be at least 8 characters'
      ));
    }

    // Validate plan selection
    const validPlans: PlanType[] = ['starter', 'pro', 'enterprise'];
    if (!validPlans.includes(selectedPlan)) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid plan selection. Must be starter, pro, or enterprise'
      ));
    }

    logger.debug(`Signup attempt for: ${email} with plan: ${selectedPlan}${companyName ? `, company: ${companyName}` : ''}`);

    // Determine limits based on plan
    // Starter: 3 projects, 20 generations
    // Pro/Enterprise: unlimited (null means no limit)
    const planLimits: Record<PlanType, { maxProjects: number | null; maxGenerations: number | null }> = {
      starter: { maxProjects: 3, maxGenerations: 20 },
      pro: { maxProjects: null, maxGenerations: null },
      enterprise: { maxProjects: null, maxGenerations: null }
    };

    const limits = planLimits[selectedPlan];

    // Create the user with 'User' role and 'active' status
    const user = await UserService.createUser({
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
    let createdCompanyId: number | null = null;
    if (companyName && companyName.trim()) {
      try {
        const [company] = await db.insert(companies).values({
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
        await db.insert(companyUsers).values({
          companyId: company.id,
          userId: user.id
        });
        
        logger.debug(`User ${user.id} linked to company ${company.id}`);
      } catch (companyError) {
        // Log error but don't fail signup - company creation is optional
        logger.error('Failed to create company:', companyError);
      }
    }

    // Auto-login: get token by calling login service
    const loginResponse = await UserService.login({ email, password });

    logger.info(`User signed up and logged in: ${email}`);

    // Include companyId in the user response if a company was created
    const userWithCompany = createdCompanyId 
      ? { ...loginResponse.user, companyId: createdCompanyId }
      : loginResponse.user;

    // Send welcome email asynchronously
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
        logger.error('Failed to send welcome email (async catch):', err);
      });
    } catch (emailError) {
      logger.error('Failed to initiate welcome email:', emailError);
    }

    res.status(201).json(createSuccessResponse({
      token: loginResponse.token,
      user: userWithCompany
    }));
  } catch (error) {
    logger.error('Signup failed:', error);

    // Check for duplicate email error
    if (error instanceof Error && error.message.includes('duplicate')) {
      return res.status(409).json(createErrorResponse(
        'EMAIL_EXISTS',
        'An account with this email already exists'
      ));
    }

    res.status(400).json(createErrorResponse(
      'SIGNUP_FAILED',
      error instanceof Error ? error.message : 'Signup failed'
    ));
  }
});

export default router;
