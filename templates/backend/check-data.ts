require('dotenv').config();
import { db } from './db';
import { serviceContracts, jobs } from './db/schema';
import { sql } from 'drizzle-orm';

async function run() {
  try {
    const contracts = await db.select().from(serviceContracts);
    console.log('Contracts:', contracts);
    
    const companyUsers = await db.execute(sql`SELECT * FROM company_users`);
    console.log('Company Users:', companyUsers.rows);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
