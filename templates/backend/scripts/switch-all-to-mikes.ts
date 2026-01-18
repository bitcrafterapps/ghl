
import 'dotenv/config';
import { db } from '../db';
import { users, companies, companyUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

async function switchAllUsers() {
  console.log('Switching ALL users to Mikes Plumbing...');

  const [mikes] = await db.select().from(companies).where(eq(companies.name, 'Mikes Plumbing'));
  if (!mikes) {
    console.error('Mikes Plumbing company not found');
    process.exit(1);
  }

  const allUsers = await db.select().from(users);
  
  for (const user of allUsers) {
    // Check if link exists
    const [existing] = await db.select().from(companyUsers).where(eq(companyUsers.userId, user.id));
    
    if (existing) {
      await db
        .update(companyUsers)
        .set({ companyId: mikes.id })
        .where(eq(companyUsers.userId, user.id));
    } else {
      await db.insert(companyUsers).values({
        companyId: mikes.id,
        userId: user.id
      });
    }

    // Cosmetic update
    await db
      .update(users)
      .set({ companyName: 'Mikes Plumbing' })
      .where(eq(users.id, user.id));
      
    console.log(`Switched User ${user.email} (ID: ${user.id}) to Mikes Plumbing (ID: ${mikes.id})`);
  }

  console.log('All users switched successfully.');
  process.exit(0);
}

switchAllUsers().catch(console.error);
