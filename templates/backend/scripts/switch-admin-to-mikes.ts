
import 'dotenv/config';
import { db } from '../db';
import { users, companies, companyUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

async function switchAdmin() {
  console.log('Switching admin@example.com to Mikes Plumbing...');

  const [admin] = await db.select().from(users).where(eq(users.email, 'admin@example.com'));
  const [mikes] = await db.select().from(companies).where(eq(companies.name, 'Mikes Plumbing'));

  if (!admin || !mikes) {
    console.error('Admin or Mikes Plumbing not found');
    process.exit(1);
  }

  // Update Link
  await db
    .update(companyUsers)
    .set({ companyId: mikes.id })
    .where(eq(companyUsers.userId, admin.id));

  // Update User Metadata (Cosmetic)
  await db
    .update(users)
    .set({ companyName: 'Mikes Plumbing' })
    .where(eq(users.id, admin.id));

  console.log(`Switched Admin (ID: ${admin.id}) to Company: ${mikes.name} (ID: ${mikes.id})`);
  process.exit(0);
}

switchAdmin().catch(console.error);
