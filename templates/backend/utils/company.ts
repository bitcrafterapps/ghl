import { db } from '../db';
import { companyUsers, users, companies } from '../db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Check if user is a Site Admin (has full access to all companies)
 */
export async function isSiteAdmin(userId: number): Promise<boolean> {
  const [user] = await db
    .select({ roles: users.roles })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.roles?.includes('Site Admin') || false;
}

/**
 * Get the company ID for a user
 * Returns the first company the user belongs to, or null if not associated with any company
 * Site Admins get the first company in the system if not associated with any
 */
export async function getUserCompanyId(userId: number): Promise<number | null> {
  // First check if user is directly associated with a company
  const [result] = await db
    .select({ companyId: companyUsers.companyId })
    .from(companyUsers)
    .where(eq(companyUsers.userId, userId))
    .limit(1);

  if (result?.companyId) {
    return result.companyId;
  }

  // If user is a Site Admin, return the first company in the system
  const isAdmin = await isSiteAdmin(userId);
  if (isAdmin) {
    const [firstCompany] = await db
      .select({ id: companies.id })
      .from(companies)
      .limit(1);
    return firstCompany?.id || null;
  }

  return null;
}

/**
 * Check if a user has permission for a specific company
 * Returns true if the user is associated with the company OR is a Site Admin
 */
export async function userHasCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  // Site Admins have access to all companies
  const isAdmin = await isSiteAdmin(userId);
  if (isAdmin) {
    return true;
  }

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
 * Site Admins can access any company
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

  // Fall back to user's first company (or first system company for Site Admins)
  return getUserCompanyId(userId);
}
