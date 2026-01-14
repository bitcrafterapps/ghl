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
const pg_1 = require("pg");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../logger");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const logger = logger_1.LoggerFactory.getLogger('Migrations');
function runMigrations() {
    return __awaiter(this, void 0, void 0, function* () {
        const schemaName = process.env.POSTGRES_SCHEMA || 'public';
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        // Determine SSL configuration based on connection string
        const isLocalhost = connectionString.includes('localhost') ||
            connectionString.includes('127.0.0.1') ||
            connectionString.includes('postgres:5432'); // Docker
        const pool = new pg_1.Pool({
            connectionString,
            ssl: isLocalhost ? false : { rejectUnauthorized: false },
        });
        try {
            // Create and set schema
            logger.debug(`Creating schema "${schemaName}" if it doesn't exist`);
            yield pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            yield pool.query(`SET search_path TO "${schemaName}", public`);
            // Create migrations table if it doesn't exist
            yield pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
            // Get list of executed migrations
            const { rows: executedMigrations } = yield pool.query('SELECT name FROM migrations ORDER BY executed_at ASC');
            const executedMigrationNames = executedMigrations.map(row => row.name);
            // Get all migration files
            const migrationsDir = path.join(__dirname, 'migrations');
            if (!fs.existsSync(migrationsDir)) {
                logger.debug('No migrations directory found, skipping migrations');
                return true;
            }
            const migrationFiles = fs.readdirSync(migrationsDir)
                .filter(file => file.endsWith('.sql'))
                .sort();
            // Run each migration that hasn't been executed yet
            for (const migrationFile of migrationFiles) {
                if (!executedMigrationNames.includes(migrationFile)) {
                    logger.debug(`Running migration: ${migrationFile}`);
                    const sqlContent = fs.readFileSync(path.join(migrationsDir, migrationFile), 'utf8');
                    try {
                        yield pool.query('BEGIN');
                        yield pool.query(sqlContent);
                        yield pool.query('INSERT INTO migrations (name) VALUES ($1)', [migrationFile]);
                        yield pool.query('COMMIT');
                        logger.debug(`Migration ${migrationFile} completed successfully`);
                    }
                    catch (error) {
                        yield pool.query('ROLLBACK');
                        logger.error(`Migration ${migrationFile} failed:`, error);
                        throw error;
                    }
                }
                else {
                    logger.debug(`Skipping already executed migration: ${migrationFile}`);
                }
            }
            logger.debug('Migration process completed');
            return true;
        }
        catch (error) {
            logger.error('Migration failed:', error);
            throw error;
        }
        finally {
            yield pool.end();
        }
    });
}
// Run migrations if this file is being executed directly
if (require.main === module) {
    runMigrations()
        .then(() => {
        logger.debug('Migration process completed');
        process.exit(0);
    })
        .catch((error) => {
        logger.error('Migration process failed:', error);
        process.exit(1);
    });
}
