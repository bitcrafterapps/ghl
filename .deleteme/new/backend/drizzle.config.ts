import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DATABASE || 'postgres',
    ssl: process.env.NODE_ENV === 'production',
  },
  schemaFilter: process.env.POSTGRES_SCHEMA || 'public',
  verbose: true,
  strict: true,
} satisfies Config; 