require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
import { Request, Response } from "express";
import { createServer } from "http";
import { initializeDatabase, checkDbConnection } from "./db";
import { createSwaggerConfig } from "./config/swagger";
import { authMiddleware } from "./middleware/auth.middleware";
import { normalizeRequest } from "./middleware/v1/compatibility.middleware";
import { db } from './db';
import v1Router from './api/v1';
import { generateBanner, formatServerInfo, formatRoutes } from './utils/banner';
import { extractRoutes } from './utils/routeExtractor';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { configureLogger } from './config/logger-config';
import { LoggerFactory } from './logger';
import { initializeWebSocket } from './websocket';

// Get package.json version
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = fs.existsSync(packageJsonPath) 
  ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) 
  : { name: 'API Server', version: '1.0.0' };

configureLogger();
const logger = LoggerFactory.getLogger('App');
const app = express();

// Configure CORS first
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

// Handle preflight requests
app.options('*', cors());

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API compatibility middleware
app.use(normalizeRequest);

// Request logging middleware
app.use((req: Request, res: Response, next: any) => {
  logger.debug(`${req.method} ${req.url}`);
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  
  // Add X-Response-Time header for client-side performance monitoring
  const originalEnd = res.end;
  // @ts-ignore
  res.end = function(...args) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('Server-Timing', `total;dur=${duration}`);
    // @ts-ignore
    originalEnd.apply(res, args);
  };
  
  next();
});

// Health check endpoints - BEFORE auth middleware
app.get('/api/health/ping', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cache-Control', 'no-cache');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', async (req: Request, res: Response) => {
  const TIMEOUT_MS = 3000; // 3 second timeout
  logger.debug('Health check started');
  
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database health check timeout')), TIMEOUT_MS);
    });

    const dbCheckPromise = (async () => {
      logger.debug('Database check starting');
      const isConnected = await checkDbConnection();
      logger.debug(`Database check completed: ${isConnected ? 'Connected' : 'Disconnected'}`);
      return isConnected;
    })();

    const isConnected = await Promise.race([dbCheckPromise, timeoutPromise]);
    
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
    logger.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'Error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Swagger documentation route - BEFORE auth middleware
app.get("/api-docs", (req: Request, res: Response) => {
  // Lazy-load swagger spec to improve cold start time
  const swaggerSpec = swaggerJsdoc(createSwaggerConfig(port));
  
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui.css" />
        <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/favicon-16x16.png" sizes="16x16" />
        <style>
            html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin: 0; background: #fafafa; }
            .swagger-ui .topbar { display: none; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = () => {
                window.ui = SwaggerUIBundle({
                    spec: ${JSON.stringify(swaggerSpec)},
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout"
                });
            };
        </script>
    </body>
    </html>
  `);
});

// Mount v1 API routes
logger.info('Mounting v1 API routes');
app.use('/api/v1', v1Router); // Mount v1 routes at /api/v1

// Auth middleware for protected routes - AFTER mounting v1 routes
app.use((req: Request, res: Response, next: any) => {
  // Skip auth for health and docs routes, and user registration/company creation routes
  if (req.path.startsWith('/api/health') || 
      req.path.startsWith('/api-docs') || 
      req.path.startsWith('/api/auth/login') ||
      (req.path === '/api/v1/users' && req.method === 'POST') ||
      (req.path === '/api/v1/companies' && req.method === 'POST') ||
      req.path.startsWith('/api/v1/site-settings/public')) {
    return next();
  }
  return authMiddleware(req, res, next);
});

const port = Number(process.env.PORT) || 3001;
logger.info(`Starting server on port ${port}`);
// const swaggerSpec = swaggerJsdoc(createSwaggerConfig(port)); // Setup moved to route handler

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('Error:', err);
  res.status(500).json({ error: "Something broke!" });
});

// Initialize database for production - REMOVED for Serverless Optimization
// relying on pool 'connect' event instead to avoid cold start race conditions
// if (process.env.NODE_ENV === "production") {
//   initializeDatabase().catch(error => {
//     logger.error("Production database initialization failed:", error);
//   });
// }

// Export the serverless handler
module.exports = app;

// Create HTTP server for WebSocket support
const httpServer = createServer(app);

// Initialize WebSocket - ONLY IN DEVELOPMENT
// Vercel Serverless cannot host a persistent socket server
if (process.env.NODE_ENV !== 'production') {
  initializeWebSocket(httpServer);
  logger.info('WebSocket initialized (Development only)');
}

// Start server in development mode
if (process.env.NODE_ENV !== 'production') {
  // Display banner and server info
  console.log(generateBanner(packageJson.name, packageJson.version));
  
  // Collect server information
  const serverInfo = {
    'Environment': process.env.NODE_ENV || 'development',
    'Port': port,
    'Database Schema': process.env.POSTGRES_SCHEMA || 'public',
    'API Version': 'v1',
    'Documentation': `http://localhost:${port}/api-docs`,
    'Health Check': `http://localhost:${port}/api/health`
  };

  // logger.info('Server information: ', JSON.stringify(serverInfo));
  
  // Print server information
  console.log(formatServerInfo(serverInfo));
  
  // Connect to database and start server
  db.execute(`SHOW search_path;`).then(result => {
    logger.debug(chalk.green('✓'), chalk.bold('Connected to database schema:'), chalk.cyan(result.rows[0].search_path));
    logger.info('Connected to database schema: ', result.rows[0].search_path);
    // Start the server with WebSocket support
    httpServer.listen(port, () => {
      logger.debug(chalk.green('✓'), chalk.bold('Server started successfully'));
      logger.info('📡 WebSocket ready');
      
      // Extract and display routes
      setTimeout(() => {
        const routes = extractRoutes(app);
        console.log(formatRoutes(routes));
      }, 100);
    });
  }).catch(err => {
    console.error(chalk.red('✗'), chalk.bold('Failed to connect to database:'), chalk.red(err.message));
    logger.debug(chalk.yellow('!'), chalk.bold('Starting server without database connection...'));
    
    // Start the server anyway with WebSocket support
    httpServer.listen(port, () => {
      logger.debug(chalk.green('✓'), chalk.bold('Server started successfully'));
      logger.info('📡 WebSocket ready');
      
      // Extract and display routes
      setTimeout(() => {
        const routes = extractRoutes(app);
        logger.debug(formatRoutes(routes));
      }, 100);
    });
  });

  process.on('SIGTERM', async () => {
    // Close all loggers (flushes database connections)
    logger.info('Closing all loggers');
    await LoggerFactory.closeAll();
  });
}

// Start server in PRODUCTION mode (Railway, Docker, etc.)
if (process.env.NODE_ENV === 'production') {
  // Initialize WebSocket in production for Railway (which supports persistent connections)
  initializeWebSocket(httpServer);
  logger.info('WebSocket initialized');

  // Start the server
  httpServer.listen(port, '0.0.0.0', () => {
    logger.info(`🚀 Production server running on port ${port}`);
    logger.info('📡 WebSocket ready');
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await LoggerFactory.closeAll();
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}
