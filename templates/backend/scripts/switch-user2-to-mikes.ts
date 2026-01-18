
import 'dotenv/config';
import { db } from '../db';
import { users, companies, companyUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

async function switchUser2() {
  console.log('Switching user@example.com (ID 2) to Mikes Plumbing...');

  const [user2] = await db.select().from(users).where(eq(users.email, 'user@example.com'));
  const [mikes] = await db.select().from(companies).where(eq(companies.name, 'Mikes Plumbing'));

  if (!user2 || !mikes) {
    console.error('User 2 or Mikes Plumbing not found');
    process.exit(1);
  }

  // Update Link
  // Check if link exists first
  const [existing] = await db.select().from(companyUsers).where(eq(companyUsers.userId, user2.id));
  
  if (existing) {
      await db
        .update(companyUsers)
        .set({ companyId: mikes.id })
        .where(eq(companyUsers.userId, user2.id));
  } else {
      await db.insert(companyUsers).values({
          companyId: mikes.id,
          userId: user2.id
      });
  }

  // Update User Metadata (Cosmetic)
  await db
    .update(users)
    .set({ companyName: 'Mikes Plumbing' })
    .where(eq(users.id, user2.id));

  console.log(`Switched User 2 (ID: ${user2.id}) to Company: ${mikes.name} (ID: ${mikes.id})`);
  process.exit(0);
}

switchUser2().catch(console.error);
