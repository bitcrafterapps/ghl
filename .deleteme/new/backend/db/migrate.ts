import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerFactory } from '../logger';
import * as dotenv from 'dotenv';
dotenv.config();

const logger = LoggerFactory.getLogger('Migrations');

async function runMigrations() {
  const schemaName = process.env.POSTGRES_SCHEMA || 'public';
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Determine SSL configuration based on connection string
  const isLocalhost = connectionString.includes('localhost') || 
                      connectionString.includes('127.0.0.1') ||
                      connectionString.includes('postgres:5432'); // Docker
  
  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });
  
  try {
    // Create and set schema
    logger.debug(`Creating schema "${schemaName}" if it doesn't exist`);
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    await pool.query(`SET search_path TO "${schemaName}", public`);

    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT name FROM migrations ORDER BY executed_at ASC'
    );
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
        const sqlContent = fs.readFileSync(
          path.join(migrationsDir, migrationFile),
          'utf8'
        );

        try {
          await pool.query('BEGIN');
          await pool.query(sqlContent);
          await pool.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [migrationFile]
          );
          await pool.query('COMMIT');
          logger.debug(`Migration ${migrationFile} completed successfully`);
        } catch (error) {
          await pool.query('ROLLBACK');
          logger.error(`Migration ${migrationFile} failed:`, error);
          throw error;
        }
      } else {
        logger.debug(`Skipping already executed migration: ${migrationFile}`);
      }
    }

    logger.debug('Migration process completed');
    return true;
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
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