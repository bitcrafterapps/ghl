
import 'dotenv/config';
import { db } from '../db';
import { users, companies, companyUsers, jobs } from '../db/schema';
import { eq } from 'drizzle-orm';

async function debug() {
  console.log('--- DEBUGGING DB STATE ---');
  
  // 1. Check total counts
  const allUsers = await db.select().from(users);
  const allCompanies = await db.select().from(companies);
  const allCompanyUsers = await db.select().from(companyUsers);
  const allJobs = await db.select().from(jobs);

  console.log(`Total Users: ${allUsers.length}`);
  console.log(`Total Companies: ${allCompanies.length}`);
  console.log(`Total CompanyUsers Links: ${allCompanyUsers.length}`);
  console.log(`Total Jobs: ${allJobs.length}`);

  // 2. Detail Users
  console.log('\n--- Users ---');
  for (const u of allUsers) {
    console.log(`ID: ${u.id}, Email: ${u.email}, Roles: ${u.roles}, CompanyName (User Table): ${u.companyName}`);
    
    // Check Link
    const links = allCompanyUsers.filter(l => l.userId === u.id);
    if (links.length > 0) {
      console.log(`   -> Linked to CompanyIDs: ${links.map(l => l.companyId).join(', ')}`);
    } else {
      console.log(`   -> NO COMPANY LINK in company_users table`);
    }
  }

  // 3. Detail Companies
  console.log('\n--- Companies ---');
  for (const c of allCompanies) {
    console.log(`ID: ${c.id}, Name: ${c.name}`);
    const companyJobs = allJobs.filter(j => j.companyId === c.id);
    console.log(`   -> Jobs Count: ${companyJobs.length}`);
  }

  process.exit(0);
}

debug().catch(console.error);
