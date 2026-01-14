import { Router, Request, Response } from 'express';
import { CompanyService, CompanyData } from '../../services/company.service';
import { UserService } from '../../services/user.service';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';

const router = Router();
const logger = LoggerFactory.getLogger('CompaniesAPI');

// Middleware to log companies endpoint requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Companies endpoint accessed: ${req.method} ${req.path}`);
  next();
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    logger.debug('Getting all companies');
    
    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to access all companies without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to access this resource')
      );
    }
    
    const companies = await CompanyService.getAllCompanies();
    logger.debug(`Retrieved ${companies.length} companies`);
    
    return res.json(createSuccessResponse(companies));
  } catch (error) {
    logger.error('Error getting companies:', error);
    return res.status(500).json(
      createErrorResponse(
        'COMPANIES_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch companies'
      )
    );
  }
});

router.post('/', async (req: Request<{}, {}, CompanyData>, res: Response) => {
  try {
    logger.debug('Creating new company');
    
    // For signup flow, we don't require authentication
    // Check if user has admin privileges only if authenticated
    if (req.user) {
      const currentUser = await UserService.getUserById(req.user.userId);
      if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
        logger.warn(`User ${req.user?.userId} attempted to create a company without admin privileges`);
        return res.status(403).json(
          createErrorResponse('FORBIDDEN', 'You do not have permission to create companies')
        );
      }
    }
    
    // Validate required fields
    const requiredFields = ['name', 'addressLine1', 'city', 'state', 'zip', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !req.body[field as keyof CompanyData]);
    
    if (missingFields.length > 0) {
      logger.debug(`Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', `Missing required fields: ${missingFields.join(', ')}`)
      );
    }
    
    // Validate state format (2 characters)
    if (req.body.state.length !== 2) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'State must be a 2-character code')
      );
    }
    
    // Validate zip code format (5 digits)
    if (!/^\d{5}$/.test(req.body.zip)) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Zip code must be 5 digits')
      );
    }
    
    // Create the company
    const company = await CompanyService.createCompany(req.body);
    logger.debug(`Created company with ID: ${company.id}`);
    
    return res.status(201).json(createSuccessResponse(company));
  } catch (error) {
    logger.error('Error creating company:', error);
    return res.status(500).json(
      createErrorResponse(
        'COMPANY_CREATE_FAILED',
        error instanceof Error ? error.message : 'Failed to create company'
      )
    );
  }
});

router.get('/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Company ID must be a number')
      );
    }
    
    logger.debug(`Getting company with ID: ${companyId}`);
    
    // Check if user has admin privileges or belongs to the company
    const currentUser = await UserService.getUserById(req.user!.userId);
    const isAdmin = currentUser?.roles.some(role => ['Admin', 'Site Admin'].includes(role));
    
    // Get company with users
    const companyWithUsers = await CompanyService.getCompanyWithUsers(companyId);
    if (!companyWithUsers) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Company with ID ${companyId} not found`)
      );
    }
    
    // Check if user belongs to the company
    const userBelongsToCompany = companyWithUsers.users.some(user => user.id === req.user!.userId);
    
    if (!isAdmin && !userBelongsToCompany) {
      logger.warn(`User ${req.user?.userId} attempted to access company ${companyId} without permission`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to access this company')
      );
    }
    
    return res.json(createSuccessResponse(companyWithUsers));
  } catch (error) {
    logger.error('Error getting company:', error);
    return res.status(500).json(
      createErrorResponse(
        'COMPANY_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch company'
      )
    );
  }
});

router.put('/:id', authenticate, async (req: Request<{ id: string }, {}, Partial<CompanyData>>, res: Response) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Company ID must be a number')
      );
    }
    
    logger.debug(`Updating company with ID: ${companyId}`);
    
    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to update company ${companyId} without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to update companies')
      );
    }
    
    // Check if company exists
    const existingCompany = await CompanyService.getCompanyById(companyId);
    if (!existingCompany) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Company with ID ${companyId} not found`)
      );
    }
    
    // Validate state format if provided
    if (req.body.state && req.body.state.length !== 2) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'State must be a 2-character code')
      );
    }
    
    // Validate zip code format if provided
    if (req.body.zip && !/^\d{5}$/.test(req.body.zip)) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Zip code must be 5 digits')
      );
    }
    
    // Update the company
    const updatedCompany = await CompanyService.updateCompany(companyId, req.body);
    logger.debug(`Updated company with ID: ${companyId}`);
    
    return res.json(createSuccessResponse(updatedCompany));
  } catch (error) {
    logger.error('Error updating company:', error);
    return res.status(500).json(
      createErrorResponse(
        'COMPANY_UPDATE_FAILED',
        error instanceof Error ? error.message : 'Failed to update company'
      )
    );
  }
});

router.delete('/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Company ID must be a number')
      );
    }
    
    logger.debug(`Deleting company with ID: ${companyId}`);
    
    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to delete company ${companyId} without Site Admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to delete companies')
      );
    }
    
    // Check if company exists
    const existingCompany = await CompanyService.getCompanyById(companyId);
    if (!existingCompany) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Company with ID ${companyId} not found`)
      );
    }
    
    // Delete the company
    await CompanyService.deleteCompany(companyId);
    logger.debug(`Deleted company with ID: ${companyId}`);
    
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting company:', error);
    return res.status(500).json(
      createErrorResponse(
        'COMPANY_DELETE_FAILED',
        error instanceof Error ? error.message : 'Failed to delete company'
      )
    );
  }
});

router.post('/:id/users', authenticate, async (req: Request<{ id: string }, {}, { userId: number }>, res: Response) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Company ID must be a number')
      );
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'User ID is required')
      );
    }

    logger.debug(`Adding user ${userId} to company ${companyId}`);

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to add user to company ${companyId} without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to add users to companies')
      );
    }

    // Check if company exists
    const company = await CompanyService.getCompanyById(companyId);
    if (!company) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Company with ID ${companyId} not found`)
      );
    }

    // Check if user exists
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `User with ID ${userId} not found`)
      );
    }

    // Check if user is already in the company
    const companyUsers = await CompanyService.getCompanyUsers(companyId);
    if (companyUsers.some(u => u.id === userId)) {
      return res.status(409).json(
        createErrorResponse('CONFLICT', `User with ID ${userId} is already in company ${companyId}`)
      );
    }

    // Add user to company
    await CompanyService.addUserToCompany(companyId, userId);
    logger.debug(`Added user ${userId} to company ${companyId}`);

    return res.status(201).json(
      createSuccessResponse({ message: `User ${userId} added to company ${companyId}` })
    );
  } catch (error) {
    logger.error('Error adding user to company:', error);
    return res.status(500).json(
      createErrorResponse(
        'ADD_USER_FAILED',
        error instanceof Error ? error.message : 'Failed to add user to company'
      )
    );
  }
});

router.delete('/:id/users/:userId', authenticate, async (req: Request<{ id: string, userId: string }>, res: Response) => {
  try {
    const companyId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(companyId) || isNaN(userId)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Company ID and User ID must be numbers')
      );
    }

    logger.debug(`Removing user ${userId} from company ${companyId}`);

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to remove user from company ${companyId} without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to remove users from companies')
      );
    }

    // Check if company exists
    const company = await CompanyService.getCompanyById(companyId);
    if (!company) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Company with ID ${companyId} not found`)
      );
    }

    // Check if user exists
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `User with ID ${userId} not found`)
      );
    }

    // Check if user is in the company
    const companyUsers = await CompanyService.getCompanyUsers(companyId);
    if (!companyUsers.some(u => u.id === userId)) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `User with ID ${userId} is not in company ${companyId}`)
      );
    }

    // Remove user from company
    await CompanyService.removeUserFromCompany(companyId, userId);
    logger.debug(`Removed user ${userId} from company ${companyId}`);

    return res.status(204).send();
  } catch (error) {
    logger.error('Error removing user from company:', error);
    return res.status(500).json(
      createErrorResponse(
        'REMOVE_USER_FAILED',
        error instanceof Error ? error.message : 'Failed to remove user from company'
      )
    );
  }
});

logger.info('All company routes mounted successfully');

export default router; 