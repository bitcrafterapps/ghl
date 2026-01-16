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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = exports.initializeDatabase = exports.db = void 0;
exports.checkDbConnection = checkDbConnection;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const logger_1 = require("../logger");
// CRITICAL: Clear Railway's PG* environment variables that override our DATABASE_URL
// The pg library reads PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE globally
// and these take precedence over connectionString in Pool config
if (process.env.DATABASE_URL) {
    console.log('[DB] Clearing PG* env vars to prevent override. PGHOST was:', process.env.PGHOST, 'PGPORT was:', process.env.PGPORT);
    delete process.env.PGHOST;
    delete process.env.PGPORT;
    delete process.env.PGUSER;
    delete process.env.PGPASSWORD;
    delete process.env.PGDATABASE;
}
// Custom logger for database operations
const logger = logger_1.LoggerFactory.getLogger("Database");
// Get connection string and schema
const connectionString = process.env.DATABASE_URL;
const schemaName = process.env.POSTGRES_SCHEMA || "public";
// Debug: Log if DATABASE_URL is set (for troubleshooting Railway deployments)
if (!connectionString) {
    logger.error("DATABASE_URL environment variable is NOT SET!");
    logger.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('PG')).join(', '));
}
else {
    logger.info("DATABASE_URL is set, length:", connectionString.length);
}
// Check if this is a local database
let isLocalDatabase = false;
try {
    if (connectionString) {
        const url = new URL(connectionString);
        const host = url.hostname;
        // Check for localhost, 127.0.0.1, or docker service names like 'postgres' or 'db'
        isLocalDatabase = host === 'localhost' || host === '127.0.0.1' || host === 'postgres' || host === 'db';
        logger.debug(`Database Host: ${host}, Is Local: ${isLocalDatabase}`);
    }
}
catch (e) {
    logger.warn("Could not parse DATABASE_URL to determine host.");
}
// Force sslmode=require if connecting to a remote database
let secureConnectionString = connectionString;
if (secureConnectionString && !isLocalDatabase && !secureConnectionString.includes("sslmode=")) {
    secureConnectionString += (secureConnectionString.includes("?") ? "&" : "?") + "sslmode=require";
    logger.debug("Appended sslmode=require to connection string for remote database");
}
let pool = null;
// Get or create the PG pool
const getPool = () => {
    if (!pool) {
        if (!secureConnectionString)
            throw new Error("DATABASE_URL is not set");
        logger.debug(`Creating pg pool (Local: ${isLocalDatabase})`);
        // Parse the connection string to extract components
        // This prevents PG* environment variables (PGHOST, PGPORT, etc.) from overriding our connection string
        const url = new URL(secureConnectionString);
        const poolConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 5432,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading '/'
            // Remote databases require SSL, localhost doesn't
            ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
        };
        logger.debug(`Pool config: host=${poolConfig.host}, port=${poolConfig.port}, database=${poolConfig.database}`);
        pool = new pg_1.Pool(poolConfig);
        pool.on("connect", (client) => __awaiter(void 0, void 0, void 0, function* () {
            yield client.query(`SET search_path TO ${schemaName}, public`);
        }));
    }
    return pool;
};
exports.getPool = getPool;
const schema = __importStar(require("./schema"));
// Initialize database connection
const createDbConnection = () => {
    logger.info(`Using standard pg driver (Local: ${isLocalDatabase})`);
    return (0, node_postgres_1.drizzle)(getPool(), { schema });
};
exports.db = createDbConnection();
// Health check function
function checkDbConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const p = getPool();
            yield p.query("SELECT 1");
            return true;
        }
        catch (error) {
            logger.error("Health check failed:", error.message);
            if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("SSL")) || ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes("insecure"))) {
                logger.error("SSL/Connection Error detected. Ensure DATABASE_URL includes ?sslmode=require");
            }
            return false;
        }
    });
}
// Initialize database
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const connected = yield checkDbConnection();
    if (connected)
        logger.debug("Database initialized");
    return connected;
});
exports.initializeDatabase = initializeDatabase;
