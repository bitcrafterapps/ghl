import { db } from '../db';
import { companyUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get the company ID for a user
 * Returns the first company the user belongs to, or null if not associated with any company
 */
export async function getUserCompanyId(userId: number): Promise<number | null> {
  const [result] = await db
    .select({ companyId: companyUsers.companyId })
    .from(companyUsers)
    .where(eq(companyUsers.userId, userId))
    .limit(1);
  
  return result?.companyId || null;
}
