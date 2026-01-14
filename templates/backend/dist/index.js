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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const http_1 = require("http");
const db_1 = require("./db");
const swagger_1 = require("./config/swagger");
const auth_middleware_1 = require("./middleware/auth.middleware");
const compatibility_middleware_1 = require("./middleware/v1/compatibility.middleware");
const db_2 = require("./db");
const v1_1 = __importDefault(require("./api/v1"));
const banner_1 = require("./utils/banner");
const routeExtractor_1 = require("./utils/routeExtractor");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_config_1 = require("./config/logger-config");
const logger_1 = require("./logger");
const websocket_1 = require("./websocket");
// Get package.json version
const packageJsonPath = path_1.default.join(__dirname, 'package.json');
const packageJson = fs_1.default.existsSync(packageJsonPath)
    ? JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf8'))
    : { name: 'API Server', version: '1.0.0' };
(0, logger_config_1.configureLogger)();
const logger = logger_1.LoggerFactory.getLogger('App');
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
app.use(compatibility_middleware_1.normalizeRequest);
// Serve uploaded files in development mode
if (process.env.NODE_ENV !== 'production') {
    const uploadsPath = path_1.default.join(process.cwd(), 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs_1.default.existsSync(uploadsPath)) {
        fs_1.default.mkdirSync(uploadsPath, { recursive: true });
    }
    // Add CORS/CORP headers for static files to work with COEP
    app.use('/uploads', (req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    }, express.static(uploadsPath));
    logger.info('Serving static files from:', uploadsPath);
}
// Request logging middleware
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.debug(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    // Add X-Response-Time header for client-side performance monitoring
    const originalEnd = res.end;
    // @ts-ignore
    res.end = function (...args) {
        const duration = Date.now() - start;
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('Server-Timing', `total;dur=${duration}`);
        // @ts-ignore
        originalEnd.apply(res, args);
    };
    next();
});
// Health check endpoints - BEFORE auth middleware
app.get('/api/health/ping', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cache-Control', 'no-cache');
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.get('/api/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const TIMEOUT_MS = 3000; // 3 second timeout
    logger.debug('Health check started');
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database health check timeout')), TIMEOUT_MS);
        });
        const dbCheckPromise = (() => __awaiter(void 0, void 0, void 0, function* () {
            logger.debug('Database check starting');
            const isConnected = yield (0, db_1.checkDbConnection)();
            logger.debug(`Database check completed: ${isConnected ? 'Connected' : 'Disconnected'}`);
            return isConnected;
        }))();
        const isConnected = yield Promise.race([dbCheckPromise, timeoutPromise]);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Cache-Control', 'no-cache');
        res.json({
            status: isConnected ? 'OK' : 'Database Error',
            timestamp: new Date().toISOString(),
            database: isConnected ? 'Connected' : 'Disconnected',
            environment: process.env.NODE_ENV || 'development'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Health check failed';
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'Error',
            message: errorMessage,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
}));
// Swagger documentation route - BEFORE auth middleware
app.get("/api-docs", (req, res) => {
    // Lazy-load swagger spec to improve cold start time
    const swaggerSpec = swaggerJsdoc((0, swagger_1.createSwaggerConfig)(port));
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
app.use('/api/v1', v1_1.default); // Mount v1 routes at /api/v1
// Auth middleware for protected routes - AFTER mounting v1 routes
app.use((req, res, next) => {
    // Skip auth for health and docs routes, and user registration/company creation routes
    if (req.path.startsWith('/api/health') ||
        req.path.startsWith('/api-docs') ||
        req.path.startsWith('/api/auth/login') ||
        (req.path === '/api/v1/users' && req.method === 'POST') ||
        (req.path === '/api/v1/companies' && req.method === 'POST') ||
        req.path.startsWith('/api/v1/site-settings/public')) {
        return next();
    }
    return (0, auth_middleware_1.authMiddleware)(req, res, next);
});
const port = Number(process.env.PORT) || 3001;
logger.info(`Starting server on port ${port}`);
// const swaggerSpec = swaggerJsdoc(createSwaggerConfig(port)); // Setup moved to route handler
// Error handling middleware
app.use((err, req, res, next) => {
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
const httpServer = (0, http_1.createServer)(app);
// Initialize WebSocket - ONLY IN DEVELOPMENT
// Vercel Serverless cannot host a persistent socket server
if (process.env.NODE_ENV !== 'production') {
    (0, websocket_1.initializeWebSocket)(httpServer);
    logger.info('WebSocket initialized (Development only)');
}
// Start server in development mode
if (process.env.NODE_ENV !== 'production') {
    // Display banner and server info
    console.log((0, banner_1.generateBanner)(packageJson.name, packageJson.version));
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
    console.log((0, banner_1.formatServerInfo)(serverInfo));
    // Connect to database and start server
    db_2.db.execute(`SHOW search_path;`).then(result => {
        logger.debug(chalk_1.default.green('✓'), chalk_1.default.bold('Connected to database schema:'), chalk_1.default.cyan(result.rows[0].search_path));
        logger.info('Connected to database schema: ', result.rows[0].search_path);
        // Start the server with WebSocket support
        httpServer.listen(port, () => {
            logger.debug(chalk_1.default.green('✓'), chalk_1.default.bold('Server started successfully'));
            logger.info('📡 WebSocket ready');
            // Extract and display routes
            setTimeout(() => {
                const routes = (0, routeExtractor_1.extractRoutes)(app);
                console.log((0, banner_1.formatRoutes)(routes));
            }, 100);
        });
    }).catch(err => {
        console.error(chalk_1.default.red('✗'), chalk_1.default.bold('Failed to connect to database:'), chalk_1.default.red(err.message));
        logger.debug(chalk_1.default.yellow('!'), chalk_1.default.bold('Starting server without database connection...'));
        // Start the server anyway with WebSocket support
        httpServer.listen(port, () => {
            logger.debug(chalk_1.default.green('✓'), chalk_1.default.bold('Server started successfully'));
            logger.info('📡 WebSocket ready');
            // Extract and display routes
            setTimeout(() => {
                const routes = (0, routeExtractor_1.extractRoutes)(app);
                logger.debug((0, banner_1.formatRoutes)(routes));
            }, 100);
        });
    });
    process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
        // Close all loggers (flushes database connections)
        logger.info('Closing all loggers');
        yield logger_1.LoggerFactory.closeAll();
    }));
}
// Start server in PRODUCTION mode (Railway, Docker, etc.)
if (process.env.NODE_ENV === 'production') {
    // Initialize WebSocket in production for Railway (which supports persistent connections)
    (0, websocket_1.initializeWebSocket)(httpServer);
    logger.info('WebSocket initialized');
    // Start the server
    httpServer.listen(port, '0.0.0.0', () => {
        logger.info(`🚀 Production server running on port ${port}`);
        logger.info('📡 WebSocket ready');
    });
    process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('SIGTERM received, shutting down gracefully');
        yield logger_1.LoggerFactory.closeAll();
        httpServer.close(() => {
            logger.info('Server closed');
            process.exit(0);
        });
    }));
}
