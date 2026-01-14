import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { LoggerFactory } from "../logger";

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
const logger = LoggerFactory.getLogger("Database");

// Get connection string and schema
const connectionString = process.env.DATABASE_URL;
const schemaName = process.env.POSTGRES_SCHEMA || "public";

// Debug: Log if DATABASE_URL is set (for troubleshooting Railway deployments)
if (!connectionString) {
  logger.error("DATABASE_URL environment variable is NOT SET!");
  logger.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('PG')).join(', '));
} else {
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
} catch (e) {
  logger.warn("Could not parse DATABASE_URL to determine host.");
}

// Force sslmode=require if connecting to a remote database
let secureConnectionString = connectionString;
if (secureConnectionString && !isLocalDatabase && !secureConnectionString.includes("sslmode=")) {
  secureConnectionString += (secureConnectionString.includes("?") ? "&" : "?") + "sslmode=require";
  logger.debug("Appended sslmode=require to connection string for remote database");
}

let pool: Pool | null = null;

// Get or create the PG pool
const getPool = (): Pool => {
  if (!pool) {
    if (!secureConnectionString) throw new Error("DATABASE_URL is not set");
    
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
    
    pool = new Pool(poolConfig);

    pool.on("connect", async (client) => {
      await client.query(`SET search_path TO ${schemaName}, public`);
    });
  }
  return pool;
};

// Initialize database connection
const createDbConnection = () => {
  logger.info(`Using standard pg driver (Local: ${isLocalDatabase})`);
  return drizzle(getPool());
};

export const db = createDbConnection();

// Health check function
export async function checkDbConnection() {
  try {
    const p = getPool();
    await p.query("SELECT 1");
    return true;
  } catch (error: any) {
    logger.error("Health check failed:", error.message);
    if (error.message?.includes("SSL") || error.message?.includes("insecure")) {
        logger.error("SSL/Connection Error detected. Ensure DATABASE_URL includes ?sslmode=require");
    }
    return false;
  }
}

// Initialize database
export const initializeDatabase = async () => {
  const connected = await checkDbConnection();
  if (connected) logger.debug("Database initialized");
  return connected;
};

// Export pool getter for legacy compatibility
export { getPool };
