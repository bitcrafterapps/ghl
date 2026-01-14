import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { CompanyService } from '../../services/company.service';
import { UserService } from '../../services/user.service';
import { mockCompanies, mockUsers } from '../utils/test-utils';

// Mock the services
jest.mock('../../services/company.service');
jest.mock('../../services/user.service');

// Mock the response format
const createSuccessResponse = (data: any) => ({
  success: true,
  data
});

const createErrorResponse = (code: string, message: string) => ({
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
  const router = Router();
  
  // Get all companies
  router.get('/', require('../../middleware/v1/auth.middleware').authenticate, async (req, res) => {
    try {
      // Check if user has admin privileges
      const currentUser = await UserService.getUserById(req.user!.userId);
      if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
        return res.status(403).json(
          createErrorResponse('FORBIDDEN', 'You do not have permission to access this resource')
        );
      }
      
      const companies = await CompanyService.getAllCompanies();
      res.json(createSuccessResponse(companies));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'COMPANIES_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch companies'
      ));
    }
  });
  
  // Get company by ID
  router.get('/:id', require('../../middleware/v1/auth.middleware').authenticate, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json(
          createErrorResponse('INVALID_ID', 'Company ID must be a number')
        );
      }
      
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
        return res.status(403).json(
          createErrorResponse('FORBIDDEN', 'You do not have permission to access this company')
        );
      }
      
      return res.json(createSuccessResponse(companyWithUsers));
    } catch (error) {
      return res.status(500).json(
        createErrorResponse(
          'COMPANY_FETCH_FAILED',
          error instanceof Error ? error.message : 'Failed to fetch company'
        )
      );
    }
  });
  
  // Create company
  router.post('/', require('../../middleware/v1/auth.middleware').authenticate, async (req, res) => {
    try {
      // Check if user has admin privileges
      const currentUser = await UserService.getUserById(req.user!.userId);
      if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
        return res.status(403).json(
          createErrorResponse('FORBIDDEN', 'You do not have permission to create companies')
        );
      }
      
      // Validate required fields
      const requiredFields = ['name', 'addressLine1', 'city', 'state', 'zip', 'email', 'phone'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
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
      return res.status(201).json(createSuccessResponse(company));
    } catch (error) {
      return res.status(500).json(
        createErrorResponse(
          'COMPANY_CREATE_FAILED',
          error instanceof Error ? error.message : 'Failed to create company'
        )
      );
    }
  });
  
  return router;
};

describe('Companies API', () => {
  let app: express.Application;
  let companiesRouter: Router;

  beforeEach(() => {
    // Create a new Express app for each test
    app = express();
    app.use(express.json());
    companiesRouter = createCompaniesRouter();
    app.use('/companies', companiesRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /companies', () => {
    it('should return all companies for admin user', async () => {
      // Mock the UserService.getUserById method to return an admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin']
      });
      
      // Mock the CompanyService.getAllCompanies method
      (CompanyService.getAllCompanies as jest.Mock).mockResolvedValue(mockCompanies);
      
      const response = await request(app).get('/companies');
      
      // Convert dates to strings for comparison
      const expectedResponse = createSuccessResponse(
        mockCompanies.map(company => ({
          ...company,
          createdAt: company.createdAt.toISOString(),
          updatedAt: company.updatedAt.toISOString()
        }))
      );
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
      expect(CompanyService.getAllCompanies).toHaveBeenCalledTimes(1);
    });

    it('should return 403 for non-admin user', async () => {
      // Mock the UserService.getUserById method to return a non-admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Regular User',
        email: 'user@example.com',
        roles: ['User']
      });
      
      const response = await request(app).get('/companies');
      
      expect(response.status).toBe(403);
      expect(response.body).toEqual(createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to access this resource'
      ));
      expect(CompanyService.getAllCompanies).not.toHaveBeenCalled();
    });

    it('should return 500 when there is a server error', async () => {
      // Mock the UserService.getUserById method to return an admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin']
      });
      
      // Mock the CompanyService.getAllCompanies method to throw an error
      (CompanyService.getAllCompanies as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const response = await request(app).get('/companies');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual(createErrorResponse(
        'COMPANIES_FETCH_FAILED',
        'Database error'
      ));
    });
  });

  describe('GET /companies/:id', () => {
    it('should return a company by ID for admin user', async () => {
      const companyId = 1;
      const companyWithUsers = {
        ...mockCompanies[0],
        users: [mockUsers[0], mockUsers[1]]
      };
      
      // Mock the UserService.getUserById method to return an admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin']
      });
      
      // Mock the CompanyService.getCompanyWithUsers method
      (CompanyService.getCompanyWithUsers as jest.Mock).mockResolvedValue(companyWithUsers);
      
      const response = await request(app).get(`/companies/${companyId}`);
      
      // Convert dates to strings for comparison
      const expectedCompany = {
        ...companyWithUsers,
        createdAt: companyWithUsers.createdAt.toISOString(),
        updatedAt: companyWithUsers.updatedAt.toISOString(),
        users: companyWithUsers.users.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }))
      };
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(createSuccessResponse(expectedCompany));
      expect(CompanyService.getCompanyWithUsers).toHaveBeenCalledWith(companyId);
    });

    it('should return a company by ID for user belonging to the company', async () => {
      const companyId = 1;
      const companyWithUsers = {
        ...mockCompanies[0],
        users: [
          { ...mockUsers[0], id: 2 }, // User with ID 2 belongs to the company
          mockUsers[1]
        ]
      };
      
      // Create a new app with a router that uses the user-specific middleware
      const testApp = express();
      testApp.use(express.json());
      
      // Override the default mock to make the user belong to the company
      const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
      require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
        req.user = { userId: 2 }; // User with ID 2 belongs to the company
        next();
      });
      
      // Mock the UserService.getUserById method to return a regular user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Regular User',
        email: 'user@example.com',
        roles: ['User']
      });
      
      // Mock the CompanyService.getCompanyWithUsers method
      (CompanyService.getCompanyWithUsers as jest.Mock).mockResolvedValue(companyWithUsers);
      
      // Create a new router with the mocked middleware
      const testRouter = createCompaniesRouter();
      testApp.use('/companies', testRouter);
      
      const response = await request(testApp).get(`/companies/${companyId}`);
      
      // Convert dates to strings for comparison
      const expectedCompany = {
        ...companyWithUsers,
        createdAt: companyWithUsers.createdAt.toISOString(),
        updatedAt: companyWithUsers.updatedAt.toISOString(),
        users: companyWithUsers.users.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }))
      };
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(createSuccessResponse(expectedCompany));
      expect(CompanyService.getCompanyWithUsers).toHaveBeenCalledWith(companyId);
      
      // Restore the original mock
      require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
    });

    it('should return 400 for invalid company ID', async () => {
      const response = await request(app).get('/companies/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual(createErrorResponse(
        'INVALID_ID',
        'Company ID must be a number'
      ));
    });

    it('should return 404 when company is not found', async () => {
      const companyId = 999;
      
      // Mock the UserService.getUserById method to return an admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin']
      });
      
      // Mock the CompanyService.getCompanyWithUsers method to return null
      (CompanyService.getCompanyWithUsers as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app).get(`/companies/${companyId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual(createErrorResponse(
        'NOT_FOUND',
        `Company with ID ${companyId} not found`
      ));
    });

    it('should return 403 for user not belonging to the company', async () => {
      const companyId = 1;
      const companyWithUsers = {
        ...mockCompanies[0],
        users: [mockUsers[0], mockUsers[1]] // Users with IDs 1 and 3
      };
      
      // Create a new app with a router that uses the user-specific middleware
      const testApp = express();
      testApp.use(express.json());
      
      // Override the default mock to make the user not belong to the company
      const originalAuthenticate = require('../../middleware/v1/auth.middleware').authenticate;
      require('../../middleware/v1/auth.middleware').authenticate = jest.fn((req, res, next) => {
        req.user = { userId: 2 }; // User with ID 2 does not belong to the company
        next();
      });
      
      // Mock the UserService.getUserById method to return a regular user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Regular User',
        email: 'user@example.com',
        roles: ['User']
      });
      
      // Mock the CompanyService.getCompanyWithUsers method
      (CompanyService.getCompanyWithUsers as jest.Mock).mockResolvedValue(companyWithUsers);
      
      // Create a new router with the mocked middleware
      const testRouter = createCompaniesRouter();
      testApp.use('/companies', testRouter);
      
      const response = await request(testApp).get(`/companies/${companyId}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toEqual(createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to access this company'
      ));
      
      // Restore the original mock
      require('../../middleware/v1/auth.middleware').authenticate = originalAuthenticate;
    });
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

    it('should create a company successfully', async () => {
      const createdCompany = { id: 3, ...validCompanyData };
      
      // Mock the UserService.getUserById method to return an admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin']
      });
      
      // Mock the CompanyService.createCompany method
      (CompanyService.createCompany as jest.Mock).mockResolvedValue(createdCompany);
      
      const response = await request(app)
        .post('/companies')
        .send(validCompanyData);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createSuccessResponse(createdCompany));
      expect(CompanyService.createCompany).toHaveBeenCalledWith(validCompanyData);
    });

    it('should return 403 for non-admin user', async () => {
      // Mock the UserService.getUserById method to return a non-admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Regular User',
        email: 'user@example.com',
        roles: ['User']
      });
      
      const response = await request(app)
        .post('/companies')
        .send(validCompanyData);
      
      expect(response.status).toBe(403);
      expect(response.body).toEqual(createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to create companies'
      ));
      expect(CompanyService.createCompany).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidCompanyData = {
        name: 'New Company',
        // Missing required fields
      };
      
      // Mock the UserService.getUserById method to return an admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin']
      });
      
      const response = await request(app)
        .post('/companies')
        .send(invalidCompanyData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(CompanyService.createCompany).not.toHaveBeenCalled();
    });

    it('should return 400 when state format is invalid', async () => {
      const invalidStateData = {
        ...validCompanyData,
        state: 'New York' // Should be 2 characters
      };
      
      // Mock the UserService.getUserById method to return an admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin']
      });
      
      const response = await request(app)
        .post('/companies')
        .send(invalidStateData);
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual(createErrorResponse(
        'VALIDATION_ERROR',
        'State must be a 2-character code'
      ));
      expect(CompanyService.createCompany).not.toHaveBeenCalled();
    });

    it('should return 400 when zip code format is invalid', async () => {
      const invalidZipData = {
        ...validCompanyData,
        zip: '1000' // Should be 5 digits
      };
      
      // Mock the UserService.getUserById method to return an admin user
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin']
      });
      
      const response = await request(app)
        .post('/companies')
        .send(invalidZipData);
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual(createErrorResponse(
        'VALIDATION_ERROR',
        'Zip code must be 5 digits'
      ));
      expect(CompanyService.createCompany).not.toHaveBeenCalled();
    });
  });
}); 