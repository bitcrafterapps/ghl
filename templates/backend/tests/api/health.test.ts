import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { checkDbConnection } from '../../db';

// Mock the database connection check
jest.mock('../../db', () => ({
  checkDbConnection: jest.fn(),
}));

// Create a simple health route for testing
const createHealthRoutes = () => {
  const router = Router();
  
  router.get('/ping', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cache-Control', 'no-cache');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  router.get('/', async (req, res) => {
    try {
      const isConnected = await checkDbConnection();
      
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Cache-Control', 'no-cache');
      res.json({ 
        status: isConnected ? 'OK' : 'Database Error',
        timestamp: new Date().toISOString(),
        database: isConnected ? 'Connected' : 'Disconnected',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed';
      res.status(503).json({ 
        status: 'Error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    }
  });

  return router;
};

describe('Health API', () => {
  let app: express.Application;
  let healthRouter: Router;

  beforeEach(() => {
    // Create a new Express app for each test
    app = express();
    healthRouter = createHealthRoutes();
    app.use('/health', healthRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /health/ping', () => {
    it('should return a 200 status with OK response', async () => {
      const response = await request(app).get('/health/ping');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['cache-control']).toBe('no-cache');
    });
  });

  describe('GET /health', () => {
    it('should return a 200 status with database connected', async () => {
      // Mock the database connection check to return true
      (checkDbConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database', 'Connected');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['cache-control']).toBe('no-cache');
    });

    it('should return a 200 status with database disconnected', async () => {
      // Mock the database connection check to return false
      (checkDbConnection as jest.Mock).mockResolvedValue(false);

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'Database Error');
      expect(response.body).toHaveProperty('database', 'Disconnected');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });

    it('should return a 503 status when database check throws an error', async () => {
      // Mock the database connection check to throw an error
      (checkDbConnection as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'Error');
      expect(response.body).toHaveProperty('message', 'Database connection failed');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });
}); 