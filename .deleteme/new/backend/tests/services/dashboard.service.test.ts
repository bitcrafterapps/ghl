import { DashboardService } from '../../services/dashboard.service';
import { eq, sql, and } from 'drizzle-orm';
import { users, companies, activityLog } from '../../db/schema';

// Mock the database
jest.mock('../../db', () => {
  return {
    db: {
      select: jest.fn(),
    },
    users: { status: 'status' },
    companies: {},
    activityLog: { userId: 'userId', createdAt: 'createdAt' }
  };
});

// Mock the logger
jest.mock('../../logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
    error: jest.fn()
  }))
}));

describe('DashboardService', () => {
  const { db } = require('../../db');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getDashboardStats', () => {
    it('should return dashboard stats for site admin', async () => {
      // Setup the mock chain for each query
      const mockWhere1 = jest.fn().mockResolvedValue([{ count: 10 }]);
      const mockFrom1 = jest.fn().mockReturnValue({ where: mockWhere1 });
      
      const mockWhere2 = jest.fn().mockResolvedValue([{ count: 3 }]);
      const mockFrom2 = jest.fn().mockReturnValue({ where: mockWhere2 });
      
      const mockFrom3 = jest.fn().mockResolvedValue([{ count: 5 }]);
      
      const mockWhere4 = jest.fn().mockResolvedValue([{ count: 7 }]);
      const mockFrom4 = jest.fn().mockReturnValue({ where: mockWhere4 });
      
      // Setup the select mock to return different from implementations for each call
      db.select.mockReturnValueOnce({ from: mockFrom1 })
               .mockReturnValueOnce({ from: mockFrom2 })
               .mockReturnValueOnce({ from: mockFrom3 })
               .mockReturnValueOnce({ from: mockFrom4 });
      
      // Call the method
      const result = await DashboardService.getDashboardStats(1, true);
      
      // Assertions
      expect(result).toEqual({
        users: 10,
        pendingUsers: 3,
        companies: 5,
        notifications: 7
      });
      
      // Verify database calls
      expect(db.select).toHaveBeenCalledTimes(4);
    });
    
    it('should return empty stats for non-admin user', async () => {
      // For non-admin, only notifications query is called
      const mockWhere = jest.fn().mockResolvedValue([{ count: 4 }]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      
      db.select.mockReturnValueOnce({ from: mockFrom });
      
      // Call the method
      const result = await DashboardService.getDashboardStats(1, false);
      
      // Assertions
      expect(result).toEqual({
        users: 0,
        pendingUsers: 0,
        companies: 0,
        notifications: 4
      });
      
      // Verify database calls
      expect(db.select).toHaveBeenCalledTimes(1);
    });
    
    it('should return zero counts when database returns no results', async () => {
      // Setup the mock chain for each query with empty results
      const mockWhere1 = jest.fn().mockResolvedValue([]);
      const mockFrom1 = jest.fn().mockReturnValue({ where: mockWhere1 });
      
      const mockWhere2 = jest.fn().mockResolvedValue([]);
      const mockFrom2 = jest.fn().mockReturnValue({ where: mockWhere2 });
      
      const mockFrom3 = jest.fn().mockResolvedValue([]);
      
      const mockWhere4 = jest.fn().mockResolvedValue([]);
      const mockFrom4 = jest.fn().mockReturnValue({ where: mockWhere4 });
      
      // Setup the select mock to return different from implementations for each call
      db.select.mockReturnValueOnce({ from: mockFrom1 })
               .mockReturnValueOnce({ from: mockFrom2 })
               .mockReturnValueOnce({ from: mockFrom3 })
               .mockReturnValueOnce({ from: mockFrom4 });
      
      // Call the method
      const result = await DashboardService.getDashboardStats(1, true);
      
      // Assertions
      expect(result).toEqual({
        users: 0,
        pendingUsers: 0,
        companies: 0,
        notifications: 0
      });
    });
    
    it('should return zero for null count values', async () => {
      // Setup the mock chain for each query with null count values
      const mockWhere1 = jest.fn().mockResolvedValue([{ count: null }]);
      const mockFrom1 = jest.fn().mockReturnValue({ where: mockWhere1 });
      
      const mockWhere2 = jest.fn().mockResolvedValue([{ count: null }]);
      const mockFrom2 = jest.fn().mockReturnValue({ where: mockWhere2 });
      
      const mockFrom3 = jest.fn().mockResolvedValue([{ count: null }]);
      
      const mockWhere4 = jest.fn().mockResolvedValue([{ count: null }]);
      const mockFrom4 = jest.fn().mockReturnValue({ where: mockWhere4 });
      
      // Setup the select mock to return different from implementations for each call
      db.select.mockReturnValueOnce({ from: mockFrom1 })
               .mockReturnValueOnce({ from: mockFrom2 })
               .mockReturnValueOnce({ from: mockFrom3 })
               .mockReturnValueOnce({ from: mockFrom4 });
      
      // Call the method
      const result = await DashboardService.getDashboardStats(1, true);
      
      // Assertions
      expect(result).toEqual({
        users: 0,
        pendingUsers: 0,
        companies: 0,
        notifications: 0
      });
    });
    
    it('should handle database error when getting user count', async () => {
      // Setup error for first query
      const dbError = new Error('Database error');
      const mockWhere = jest.fn().mockRejectedValue(dbError);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      
      db.select.mockReturnValueOnce({ from: mockFrom });
      
      // Call the getDashboardStats method and expect it to throw
      await expect(DashboardService.getDashboardStats(1, true)).rejects.toThrow('Database error');
    });
    
    it('should handle database error when getting company count', async () => {
      // Setup the mock chain for first two queries
      const mockWhere1 = jest.fn().mockResolvedValue([{ count: 10 }]);
      const mockFrom1 = jest.fn().mockReturnValue({ where: mockWhere1 });
      
      const mockWhere2 = jest.fn().mockResolvedValue([{ count: 3 }]);
      const mockFrom2 = jest.fn().mockReturnValue({ where: mockWhere2 });
      
      // Setup error for third query
      const dbError = new Error('Database error');
      const mockFrom3 = jest.fn().mockRejectedValue(dbError);
      
      // Setup the select mock
      db.select.mockReturnValueOnce({ from: mockFrom1 })
               .mockReturnValueOnce({ from: mockFrom2 })
               .mockReturnValueOnce({ from: mockFrom3 });
      
      // Call the getDashboardStats method and expect it to throw
      await expect(DashboardService.getDashboardStats(1, true)).rejects.toThrow('Database error');
    });
  });
}); 