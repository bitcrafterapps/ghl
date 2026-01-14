import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema';
import { LoggerFactory } from '../logger';
import * as dotenv from 'dotenv';
dotenv.config();

const logger = LoggerFactory.getLogger('SchemaPush');

async function pushSchema() {
  const isProd = process.env.NODE_ENV === 'production';
  const schemaName = process.env.POSTGRES_SCHEMA || 'public';
  
  logger.info('Starting schema push...');
  
  const pool = new Pool(isProd ? {
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
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    await pool.query(`SET search_path TO "${schemaName}", public`);

    // Create tables directly from schema
    logger.debug('Creating tables from schema...');
    
    // Create users table
    await pool.query(`
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
    await pool.query(`
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_users (
        id SERIAL PRIMARY KEY,
        "companyId" SERIAL REFERENCES companies(id) ON DELETE CASCADE,
        "userId" SERIAL REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
  
    logger.info('Schema push completed successfully');
  } catch (error) {
    logger.error('Schema push failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
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