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
const logger_1 = require("../logger");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const logger = logger_1.LoggerFactory.getLogger('SchemaPush');
function pushSchema() {
    return __awaiter(this, void 0, void 0, function* () {
        const isProd = process.env.NODE_ENV === 'production';
        const schemaName = process.env.POSTGRES_SCHEMA || 'public';
        logger.info('Starting schema push...');
        const pool = new pg_1.Pool(isProd ? {
            connectionString: process.env.DATABASE_URL_UNPOOLED,
            ssl: {
                requestCert: true,
                rejectUnauthorized: true
            }
        } : {
            host: process.env.POSTGRES_HOST,
            port: 5432,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE || 'postgres'
        });
        try {
            // Create and set schema
            logger.debug(`Creating schema "${schemaName}" if it doesn't exist`);
            yield pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            yield pool.query(`SET search_path TO "${schemaName}", public`);
            // Create tables directly from schema
            logger.debug('Creating tables from schema...');
            // Create users table
            yield pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        "firstName" VARCHAR(255),
        "lastName" VARCHAR(255),
        password VARCHAR(255),
        roles TEXT[] DEFAULT '{"User"}',
        "emailNotify" BOOLEAN DEFAULT TRUE,
        "smsNotify" BOOLEAN DEFAULT FALSE,
        "phoneNumber" VARCHAR(20),
        theme TEXT DEFAULT 'system' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
            // Create companies table
            yield pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "addressLine1" VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        state VARCHAR(2) NOT NULL,
        zip VARCHAR(10) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
            // Create company_users table
            yield pool.query(`
      CREATE TABLE IF NOT EXISTS company_users (
        id SERIAL PRIMARY KEY,
        "companyId" SERIAL REFERENCES companies(id) ON DELETE CASCADE,
        "userId" SERIAL REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
            logger.info('Schema push completed successfully');
        }
        catch (error) {
            logger.error('Schema push failed:', error);
            throw error;
        }
        finally {
            yield pool.end();
        }
    });
}
// Run schema push if this file is being executed directly
if (require.main === module) {
    pushSchema()
        .then(() => {
        logger.info('Schema push process completed');
        process.exit(0);
    })
        .catch((error) => {
        logger.error('Schema push process failed:', error);
        process.exit(1);
    });
}
