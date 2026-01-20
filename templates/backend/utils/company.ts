import { db } from '../db';
import { companyUsers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

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

/**
 * Check if a user has permission for a specific company
 * Returns true if the user is associated with the company
 */
export async function userHasCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const [result] = await db
    .select({ companyId: companyUsers.companyId })
    .from(companyUsers)
    .where(and(
      eq(companyUsers.userId, userId),
      eq(companyUsers.companyId, companyId)
    ))
    .limit(1);

  return !!result;
}

/**
 * Get the company ID for a user, with optional override from request
 * If targetCompanyId is provided and user has access, use that
 * Otherwise fall back to user's first company
 */
export async function resolveCompanyId(userId: number, targetCompanyId?: number | null): Promise<number | null> {
  // If a specific companyId is provided, verify user has access
  if (targetCompanyId) {
    const hasAccess = await userHasCompanyAccess(userId, targetCompanyId);
    if (hasAccess) {
      return targetCompanyId;
    }
    // User doesn't have access to the requested company - return null to indicate error
    return null;
  }

  // Fall back to user's first company
  return getUserCompanyId(userId);
}
