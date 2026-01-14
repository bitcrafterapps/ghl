import { db } from '../db';
import { companies, companyUsers, users } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { LoggerFactory } from '../logger';
import { ActivityService } from './activity.service';

const logger = LoggerFactory.getLogger('CompanyService');

export interface CompanyData {
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  industry?: string;
  size?: string;
}

export interface CompanyUserData {
  companyId: number;
  userId: number;
}

export class CompanyService {
  /**
   * Get all companies
   */
  static async getAllCompanies() {
    logger.debug('Getting all companies');
    return await db.select().from(companies);
  }

  /**
   * Get company by ID
   */
  static async getCompanyById(id: number) {
    logger.debug(`Getting company with ID: ${id}`);
    const result = await db.select().from(companies).where(eq(companies.id, id));
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get company with its users
   */
  static async getCompanyWithUsers(id: number) {
    logger.debug(`Getting company with ID: ${id} and its users`);
    
    // Get the company
    const company = await this.getCompanyById(id);
    if (!company) return null;
    
    // Get the company's users
    const companyUsersList = await db
      .select({
        userId: companyUsers.userId
      })
      .from(companyUsers)
      .where(eq(companyUsers.companyId, id));
    
    const userIds = companyUsersList.map(cu => cu.userId);
    
    // If there are no users, return just the company
    if (userIds.length === 0) {
      return { company, users: [] };
    }
    
    // Get the user details
    const usersList = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        roles: users.roles,
        status: users.status,
        jobTitle: users.jobTitle,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(
        userIds.length === 1 
          ? eq(users.id, userIds[0]) 
          : inArray(users.id, userIds)
      );
    
    // Add joinedAt date from companyUsers table
    const usersWithJoinedAt = await Promise.all(usersList.map(async (user) => {
      const [companyUser] = await db
        .select({
          createdAt: companyUsers.createdAt
        })
        .from(companyUsers)
        .where(
          and(
            eq(companyUsers.companyId, id),
            eq(companyUsers.userId, user.id)
          )
        );
      
      return {
        ...user,
        joinedAt: companyUser?.createdAt || user.createdAt
      };
    }));
    
    return { company, users: usersWithJoinedAt };
  }

  /**
   * Create a new company
   */
  static async createCompany(data: CompanyData, actorUserId?: number) {
    logger.debug(`Creating new company: ${data.name}`);
    const [company] = await db.insert(companies).values(data).returning();
    
    // Log activity if actor provided (or just system log if needed, but ActivityService requires userId)
    if (actorUserId) {
        try {
            await ActivityService.logActivity({
                type: 'company',
                action: 'created',
                title: `Company: ${company.name}`,
                entityId: company.id,
                userId: actorUserId
            });
        } catch (err) {
            logger.error('Failed to log company creation activity', err);
        }
    }
    
    return company;
  }

  /**
   * Update a company
   */
  static async updateCompany(id: number, data: Partial<CompanyData>, actorUserId?: number) {
    logger.debug(`Updating company with ID: ${id}`);
    const [company] = await db
      .update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
      
    if (company && actorUserId) {
        try {
            await ActivityService.logActivity({
                type: 'company',
                action: 'updated',
                title: `Company: ${company.name}`,
                entityId: company.id,
                userId: actorUserId
            });
        } catch (err) {
            logger.error('Failed to log company update activity', err);
        }
    }
    
    return company;
  }

  /**
   * Delete a company
   */
  static async deleteCompany(id: number, actorUserId?: number) {
    logger.debug(`Deleting company with ID: ${id}`);
    
    // Get company name first for logging
    const companyToDelete = await this.getCompanyById(id);
    
    // This will cascade delete company_users entries due to foreign key constraint
    const [company] = await db
      .delete(companies)
      .where(eq(companies.id, id))
      .returning();
      
    if (companyToDelete && actorUserId) {
        try {
            await ActivityService.logActivity({
                type: 'company',
                action: 'deleted',
                title: `Company: ${companyToDelete.name}`,
                entityId: id,
                userId: actorUserId
            });
        } catch (err) {
            logger.error('Failed to log company deletion activity', err);
        }
    }
    
    return company;
  }

  /**
   * Add a user to a company
   */
  static async addUserToCompany(companyId: number, userId: number, actorUserId?: number) {
    logger.debug(`Adding user ${userId} to company ${companyId}`);
    
    // Check if the relationship already exists
    const existing = await db
      .select()
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.userId, userId)
        )
      );
    
    if (existing.length > 0) {
      logger.debug(`User ${userId} is already in company ${companyId}`);
      return existing[0];
    }
    
    // Create the relationship
    const [relationship] = await db
      .insert(companyUsers)
      .values({ companyId, userId })
      .returning();
      
    if (actorUserId) {
        try {
            // Get company and user details for a nice message
            const company = await this.getCompanyById(companyId);
            // We can't easily get the user service here to avoid circular deps if user service imports company service
            // So we'll just log IDs or basic info
            
            if (company) {
                await ActivityService.logActivity({
                    type: 'company',
                    action: 'user_added', // This might need to be added to allowed actions or use 'updated'
                    title: `User ${userId} added to Company ${company.name}`,
                    entityId: companyId,
                    userId: actorUserId
                });
            }
        } catch (err) {
            logger.error('Failed to log user addition to company', err);
        }
    }
    
    return relationship;
  }

  /**
   * Remove a user from a company
   */
  static async removeUserFromCompany(companyId: number, userId: number, actorUserId?: number) {
    logger.debug(`Removing user ${userId} from company ${companyId}`);
    
    const [relationship] = await db
      .delete(companyUsers)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.userId, userId)
        )
      )
      .returning();
      
    if (relationship && actorUserId) {
        try {
            const company = await this.getCompanyById(companyId);
            
            if (company) {
                await ActivityService.logActivity({
                    type: 'company',
                    action: 'user_removed', // This might need to be added to allowed actions or use 'updated'
                    title: `User ${userId} removed from Company ${company.name}`,
                    entityId: companyId,
                    userId: actorUserId
                });
            }
        } catch (err) {
            logger.error('Failed to log user removal from company', err);
        }
    }
    
    return relationship;
  }

  /**
   * Get all users in a company
   */
  static async getCompanyUsers(companyId: number) {
    logger.debug(`Getting all users in company ${companyId}`);
    
    const companyUsersList = await db
      .select({
        userId: companyUsers.userId,
        createdAt: companyUsers.createdAt
      })
      .from(companyUsers)
      .where(eq(companyUsers.companyId, companyId));
    
    const userIds = companyUsersList.map(cu => cu.userId);
    
    if (userIds.length === 0) {
      return [];
    }
    
    const usersList = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        roles: users.roles,
        status: users.status,
        jobTitle: users.jobTitle,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(
        userIds.length === 1 
          ? eq(users.id, userIds[0]) 
          : inArray(users.id, userIds)
      );
      
    // Add joinedAt date from companyUsers table
    return usersList.map(user => {
      const companyUser = companyUsersList.find(cu => cu.userId === user.id);
      return {
        ...user,
        joinedAt: companyUser?.createdAt || user.createdAt
      };
    });
  }

  /**
   * Get the company ID for a user (returns first company if user belongs to multiple)
   */
  static async getUserCompanyId(userId: number): Promise<number | null> {
    logger.debug(`Getting company ID for user ${userId}`);

    const [companyUser] = await db
      .select({
        companyId: companyUsers.companyId
      })
      .from(companyUsers)
      .where(eq(companyUsers.userId, userId))
      .limit(1);

    return companyUser?.companyId || null;
  }
} 