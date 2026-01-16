import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createSchema() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Reset public schema
    console.log("Resetting public schema...");
    await client.query('DROP SCHEMA IF EXISTS public CASCADE');
    await client.query('CREATE SCHEMA public');
    console.log("Public schema reset.");
    
    // Reset targeted schema
    const schema = process.env.POSTGRES_SCHEMA || 'ghl';
    if (schema !== 'public') {
        console.log(`Resetting schema "${schema}"...`);
        await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        await client.query(`CREATE SCHEMA "${schema}"`);
        console.log(`Schema "${schema}" created/reset.`);
    }
  } catch (err) {
    console.error('Error creating schema:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createSchema();
