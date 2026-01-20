import { db } from '../db';
import { users, companies, activityLog } from '../db/schema';
import { eq, sql, and, count } from 'drizzle-orm';
import { LoggerFactory } from '../logger';

const logger = LoggerFactory.getLogger('DashboardService');

export interface DashboardStats {
  users?: number;
  companies?: number;
  pendingUsers?: number;
  notifications?: number;
}

export class DashboardService {
  static async getDashboardStats(userId: number, isSiteAdmin: boolean): Promise<DashboardStats> {
    try {
     
      const stats: DashboardStats = {
        companies: 0,
        users: 0,
        pendingUsers: 0,
        notifications: 0
      };

      // Get user and company counts if site admin
      if (isSiteAdmin) {
        const [userCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(eq(users.status, 'active'));
        
        const [pendingUserCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(eq(users.status, 'pending'));
        
        const [companyCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(companies);
        
        // Get unread notifications count (recent activity logs)
        const [notificationsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(activityLog)
          .where(
            and(
              eq(activityLog.userId, userId),
              sql`${activityLog.createdAt} > NOW() - INTERVAL '7 days'`
            )
          );
        
        stats.users = Number(userCount?.count || 0);
        stats.pendingUsers = Number(pendingUserCount?.count || 0);
        stats.companies = Number(companyCount?.count || 0);
        stats.notifications = Number(notificationsCount?.count || 0);
      } else {
        // For non-admin users, just get their notifications count
        const [notificationsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(activityLog)
          .where(
            and(
              eq(activityLog.userId, userId),
              sql`${activityLog.createdAt} > NOW() - INTERVAL '7 days'`
            )
          );
        
        stats.notifications = Number(notificationsCount?.count || 0);
      }

      return stats;
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
} 