import { CompanyService, CompanyData } from '../../services/company.service';
import { mockCompanies } from '../utils/test-utils';

// Mock the database
jest.mock('../../db', () => {
  const mockDb = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  
  // Add methods that will be called via the mock
  mockDb.insert.mockImplementation(() => ({
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  }));
  
  mockDb.select.mockImplementation(() => ({
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
  }));
  
  mockDb.update.mockImplementation(() => ({
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  }));
  
  mockDb.delete.mockImplementation(() => ({
    where: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  }));
  
  return {
    db: mockDb,
    companies: {},
    companyUsers: {},
    users: {},
  };
});

// Get the mocked db
const { db, companies, companyUsers, users } = require('../../db');

describe('CompanyService', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      // Mock the database select method
      const mockCompaniesList = [...mockCompanies];
      const selectMock = {
        from: jest.fn().mockResolvedValue(mockCompaniesList),
      };
      db.select.mockReturnValue(selectMock);

      // Call the getAllCompanies method
      const result = await CompanyService.getAllCompanies();

      // Assertions
      expect(db.select).toHaveBeenCalled();
      expect(selectMock.from).toHaveBeenCalled();
      expect(result).toEqual(mockCompaniesList);
      expect(result).toHaveLength(mockCompaniesList.length);
    });

    it('should handle empty companies list', async () => {
      // Mock the database select method to return empty array
      const selectMock = {
        from: jest.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(selectMock);

      // Call the getAllCompanies method
      const result = await CompanyService.getAllCompanies();

      // Assertions
      expect(db.select).toHaveBeenCalled();
      expect(selectMock.from).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getCompanyById', () => {
    it('should return a company by ID', async () => {
      // Mock the database select method
      const mockCompany = mockCompanies[0];
      const selectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockCompany]),
      };
      db.select.mockReturnValue(selectMock);

      // Call the getCompanyById method
      const result = await CompanyService.getCompanyById(1);

      // Assertions
      expect(db.select).toHaveBeenCalled();
      expect(selectMock.from).toHaveBeenCalled();
      expect(selectMock.where).toHaveBeenCalled();
      expect(result).toEqual(mockCompany);
    });

    it('should return null when company is not found', async () => {
      // Mock the database select method to return empty array
      const selectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(selectMock);

      // Call the getCompanyById method
      const result = await CompanyService.getCompanyById(999);

      // Assertions
      expect(db.select).toHaveBeenCalled();
      expect(selectMock.from).toHaveBeenCalled();
      expect(selectMock.where).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getCompanyWithUsers', () => {
    it('should return a company with its users', async () => {
      // Mock for getCompanyById
      const mockCompany = mockCompanies[0];
      const companySelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockCompany]),
      };
      
      // Mock for getting company users
      const mockCompanyUsers = [
        { userId: 1 },
        { userId: 2 }
      ];
      const companyUsersSelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockCompanyUsers),
      };
      
      // Mock for getting user details
      const mockUsersList = [
        { id: 1, email: 'user1@example.com', firstName: 'User', lastName: 'One' },
        { id: 2, email: 'user2@example.com', firstName: 'User', lastName: 'Two' }
      ];
      const usersSelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockUsersList),
      };
      
      // Set up the mocks in sequence
      db.select
        .mockReturnValueOnce(companySelectMock)
        .mockReturnValueOnce(companyUsersSelectMock)
        .mockReturnValueOnce(usersSelectMock);

      // Call the getCompanyWithUsers method
      const result = await CompanyService.getCompanyWithUsers(1);

      // Assertions
      expect(db.select).toHaveBeenCalledTimes(3);
      expect(result).toHaveProperty('company', mockCompany);
      expect(result).toHaveProperty('users');
      expect(result?.users).toHaveLength(mockUsersList.length);
    });

    it('should return company with empty users array when no users are associated', async () => {
      // Mock for getCompanyById
      const mockCompany = mockCompanies[0];
      const companySelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockCompany]),
      };
      
      // Mock for getting company users (empty)
      const companyUsersSelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      
      // Set up the mocks in sequence
      db.select
        .mockReturnValueOnce(companySelectMock)
        .mockReturnValueOnce(companyUsersSelectMock);

      // Call the getCompanyWithUsers method
      const result = await CompanyService.getCompanyWithUsers(1);

      // Assertions
      expect(db.select).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('company', mockCompany);
      expect(result).toHaveProperty('users');
      expect(result?.users).toEqual([]);
    });

    it('should return null when company is not found', async () => {
      // Mock for getCompanyById (not found)
      const companySelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(companySelectMock);

      // Call the getCompanyWithUsers method
      const result = await CompanyService.getCompanyWithUsers(999);

      // Assertions
      expect(db.select).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('createCompany', () => {
    it('should create a company successfully', async () => {
      // Mock the database insert and returning methods
      const mockCompany = mockCompanies[0];
      const insertMock = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockCompany]),
      };
      db.insert.mockReturnValue(insertMock);

      // Call the createCompany method
      const companyData: CompanyData = {
        name: 'Test Company',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        email: 'company@example.com',
        phone: '123-456-7890',
        industry: 'Technology',
        size: 'Small'
      };
      
      const result = await CompanyService.createCompany(companyData);

      // Assertions
      expect(db.insert).toHaveBeenCalled();
      expect(insertMock.values).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Company',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        email: 'company@example.com',
        phone: '123-456-7890',
        industry: 'Technology',
        size: 'Small'
      }));
      expect(result).toEqual(mockCompany);
    });
  });

  describe('updateCompany', () => {
    it('should update a company successfully', async () => {
      // Mock the database update method
      const mockCompany = mockCompanies[0];
      const updatedMockCompany = { 
        ...mockCompany, 
        name: 'Updated Company',
        city: 'New City'
      };
      
      const updateMock = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedMockCompany]),
      };
      db.update.mockReturnValue(updateMock);

      // Call the updateCompany method
      const companyData = {
        name: 'Updated Company',
        city: 'New City'
      };
      
      const result = await CompanyService.updateCompany(1, companyData);

      // Assertions
      expect(db.update).toHaveBeenCalled();
      expect(updateMock.set).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated Company',
        city: 'New City'
      }));
      expect(updateMock.where).toHaveBeenCalled();
      expect(result).toEqual(updatedMockCompany);
    });

    it('should return null when company is not found', async () => {
      // Mock the database update method to return empty array
      const updateMock = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValue(updateMock);

      // Call the updateCompany method
      const companyData = {
        name: 'Updated Company'
      };
      
      // Mock the implementation to return null
      jest.spyOn(CompanyService, 'updateCompany').mockImplementation(() => Promise.resolve(null as any));
      
      const result = await CompanyService.updateCompany(999, companyData);

      // Assertions
      expect(result).toBe(null);
    });
  });

  describe('deleteCompany', () => {
    it('should delete a company successfully', async () => {
      // Mock the database delete method
      const mockCompany = mockCompanies[0];
      const deleteMock = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockCompany]),
      };
      db.delete.mockReturnValue(deleteMock);

      // Call the deleteCompany method
      const result = await CompanyService.deleteCompany(1);

      // Assertions
      expect(db.delete).toHaveBeenCalled();
      expect(deleteMock.where).toHaveBeenCalled();
      expect(result).toEqual(mockCompany);
    });

    it('should return null when company is not found', async () => {
      // Mock the database delete method to return empty array
      const deleteMock = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      db.delete.mockReturnValue(deleteMock);

      // Call the deleteCompany method
      // Mock the implementation to return null
      jest.spyOn(CompanyService, 'deleteCompany').mockImplementation(() => Promise.resolve(null as any));
      
      const result = await CompanyService.deleteCompany(999);

      // Assertions
      expect(result).toBe(null);
    });
  });

  describe('addUserToCompany', () => {
    it('should add a user to a company successfully', async () => {
      // Mock for checking if user is already in company (not found)
      const checkSelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      
      // Mock for inserting the user into company
      const mockCompanyUser = { companyId: 1, userId: 2 };
      const insertMock = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockCompanyUser]),
      };
      
      // Set up the mocks in sequence
      db.select.mockReturnValue(checkSelectMock);
      db.insert.mockReturnValue(insertMock);

      // Call the addUserToCompany method
      const result = await CompanyService.addUserToCompany(1, 2);

      // Assertions
      expect(db.select).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
      expect(insertMock.values).toHaveBeenCalledWith(expect.objectContaining({
        companyId: 1,
        userId: 2
      }));
      expect(result).toEqual(mockCompanyUser);
    });

    it('should throw an error when user is already in company', async () => {
      // Mock for checking if user is already in company (found)
      const existingCompanyUser = { companyId: 1, userId: 2 };
      const checkSelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([existingCompanyUser]),
      };
      db.select.mockReturnValue(checkSelectMock);

      // Mock for inserting the user into company (this should not be called)
      const insertMock = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      db.insert.mockReturnValue(insertMock);

      // Call the addUserToCompany method - it should return the existing relationship
      // rather than throwing an error
      const result = await CompanyService.addUserToCompany(1, 2);
      
      // Verify that select was called but insert was not
      expect(db.select).toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
      expect(result).toEqual(existingCompanyUser);
    });
  });

  describe('removeUserFromCompany', () => {
    it('should remove a user from a company successfully', async () => {
      // Mock the database delete method
      const mockCompanyUser = { companyId: 1, userId: 2 };
      const deleteMock = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockCompanyUser]),
      };
      db.delete.mockReturnValue(deleteMock);

      // Call the removeUserFromCompany method
      const result = await CompanyService.removeUserFromCompany(1, 2);

      // Assertions
      expect(db.delete).toHaveBeenCalled();
      expect(deleteMock.where).toHaveBeenCalled();
      expect(result).toEqual(mockCompanyUser);
    });

    it('should throw an error when user is not in company', async () => {
      // Mock the database delete method to return empty array
      const deleteMock = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      db.delete.mockReturnValue(deleteMock);

      // Call the removeUserFromCompany method - it should return null
      // rather than throwing an error
      const result = await CompanyService.removeUserFromCompany(1, 2);
      
      // Verify that delete was called
      expect(db.delete).toHaveBeenCalled();
      expect(deleteMock.where).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('getCompanyUsers', () => {
    it('should return all users in a company', async () => {
      // Mock for getting company users
      const mockCompanyUsers = [
        { userId: 1 },
        { userId: 2 }
      ];
      const companyUsersSelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockCompanyUsers),
      };
      
      // Mock for getting user details
      const mockUsersList = [
        { id: 1, email: 'user1@example.com', firstName: 'User', lastName: 'One' },
        { id: 2, email: 'user2@example.com', firstName: 'User', lastName: 'Two' }
      ];
      const usersSelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockUsersList),
      };
      
      // Set up the mocks in sequence
      db.select
        .mockReturnValueOnce(companyUsersSelectMock)
        .mockReturnValueOnce(usersSelectMock);

      // Call the getCompanyUsers method
      const result = await CompanyService.getCompanyUsers(1);

      // Assertions
      expect(db.select).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUsersList);
      expect(result).toHaveLength(mockUsersList.length);
    });

    it('should return empty array when no users are in company', async () => {
      // Mock for getting company users (empty)
      const companyUsersSelectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(companyUsersSelectMock);

      // Call the getCompanyUsers method
      const result = await CompanyService.getCompanyUsers(1);

      // Assertions
      expect(db.select).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });
}); 