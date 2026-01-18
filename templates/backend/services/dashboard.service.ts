import { db } from '../db';
import { users, companies, activityLog, jobs, serviceContracts, contacts, reviews, galleryImages, companyUsers } from '../db/schema';
import { eq, sql, and, count, inArray } from 'drizzle-orm';
import { LoggerFactory } from '../logger';
import { getUserCompanyId } from '../utils/company';

const logger = LoggerFactory.getLogger('DashboardService');

export interface DashboardStats {
  users?: number;
  companies?: number;
  pendingUsers?: number;
  notifications?: number;
  // Job Metrics
  activeJobs?: number;
  pendingJobs?: number;
  completedJobs?: number;
  totalRevenue?: number; // Cents
  jobStatusDistribution?: { status: string; count: number }[];
  // Contract Metrics
  activeContracts?: number;
  totalContracts?: number;
  contractRevenue?: number; // Cents
  // CRM Metrics
  totalContacts?: number;
  newContacts?: number; // Last 30 days
  // Review Metrics
  totalReviews?: number;
  averageRating?: number;
  // Gallery Metrics
  galleryItems?: number;
}

export class DashboardService {
  static async getDashboardStats(userId: number, isSiteAdmin: boolean): Promise<DashboardStats> {
    try {
      const stats: DashboardStats = {
        companies: 0,
        users: 0,
        pendingUsers: 0,
        notifications: 0,
        activeJobs: 0,
        pendingJobs: 0,
        completedJobs: 0,
        totalRevenue: 0,
        activeContracts: 0,
        totalContracts: 0,
        contractRevenue: 0,
        jobStatusDistribution: [],
        totalContacts: 0,
        newContacts: 0,
        totalReviews: 0,
        averageRating: 0,
        galleryItems: 0
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
          
        stats.users = Number(userCount?.count || 0);
        stats.pendingUsers = Number(pendingUserCount?.count || 0);
        stats.companies = Number(companyCount?.count || 0);
      }

      // Notification stats (common)
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

      // Company specific stats
      const companyId = await getUserCompanyId(userId);
      console.log(`[DashboardService] User ${userId} (SiteAdmin: ${isSiteAdmin}) -> Company ${companyId}`);
      
      if (companyId) {
        console.log(`[DashboardService] Fetching stats for Company ${companyId}`);
        // --- JOBS ---
        // --- JOBS ---
        // Active: scheduled, in_progress, approved
        const [activeJobsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(and(
            eq(jobs.companyId, companyId),
            inArray(jobs.status, ['scheduled', 'in_progress', 'approved'])
          ));
        console.log(`[DashboardService] Active Jobs: ${activeJobsCount?.count}`);
        logger.debug(`DashboardStats: Active Jobs Count Raw:`, activeJobsCount);
          
        // Pending: lead, quoted
        const [pendingJobsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(and(
            eq(jobs.companyId, companyId),
            inArray(jobs.status, ['lead', 'quoted'])
          ));
          
        // Completed: completed, invoiced, paid
        const [completedJobsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(and(
            eq(jobs.companyId, companyId),
            inArray(jobs.status, ['completed', 'invoiced', 'paid'])
          ));

        stats.activeJobs = Number(activeJobsCount?.count || 0);
        stats.pendingJobs = Number(pendingJobsCount?.count || 0);
        stats.completedJobs = Number(completedJobsCount?.count || 0);

        // Revenue (Paid jobs)
        const [revenueResult] = await db
          .select({ total: sql<number>`sum(${jobs.finalAmount})` })
          .from(jobs)
          .where(and(
             eq(jobs.companyId, companyId),
             eq(jobs.status, 'paid')
           ));
        stats.totalRevenue = Number(revenueResult?.total || 0);

        // --- CONTRACTS ---
        const [activeContractsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(serviceContracts)
          .where(and(
            eq(serviceContracts.companyId, companyId),
            eq(serviceContracts.status, 'active')
          ));
          
        const [totalContractsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(serviceContracts)
          .where(eq(serviceContracts.companyId, companyId));

        const [contractRevResult] = await db
          .select({ total: sql<number>`sum(${serviceContracts.amount})` })
          .from(serviceContracts)
          .where(and(
            eq(serviceContracts.companyId, companyId),
            eq(serviceContracts.status, 'active')
          ));
          
        stats.activeContracts = Number(activeContractsCount?.count || 0);
        stats.totalContracts = Number(totalContractsCount?.count || 0);
        stats.contractRevenue = Number(contractRevResult?.total || 0);
        
        // --- CONTACTS ---
        const [contactsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(contacts)
          .where(eq(contacts.companyId, companyId));
          
        const [newContactsCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(contacts)
            .where(and(
                eq(contacts.companyId, companyId),
                sql`${contacts.createdAt} > NOW() - INTERVAL '30 days'`
            ));

        stats.totalContacts = Number(contactsCount?.count || 0);
        stats.newContacts = Number(newContactsCount?.count || 0);

        // --- REVIEWS ---
        // Only count reviews that belong to this company
        const [reviewsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(eq(reviews.companyId, companyId));
          
        const [avgRatingResult] = await db
            .select({ avg: sql<number>`avg(${reviews.rating})` })
            .from(reviews)
            .where(eq(reviews.companyId, companyId));

        stats.totalReviews = Number(reviewsCount?.count || 0);
        stats.averageRating = Number(avgRatingResult?.avg || 0);

        // --- GALLERY ---
        const [galleryCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(galleryImages)
          .where(and(
              eq(galleryImages.companyId, companyId),
              eq(galleryImages.status, 'active')
          ));
          
        stats.galleryItems = Number(galleryCount?.count || 0);

        // Job Distribution
        const distribution = await db
          .select({ 
            status: jobs.status,
            count: sql<number>`count(*)::int`
          })
          .from(jobs)
          .where(eq(jobs.companyId, companyId))
          .groupBy(jobs.status);
          
        stats.jobStatusDistribution = distribution.map(d => ({ 
          status: d.status || 'unknown', 
          count: d.count 
        }));

        // --- USERS (Company) ---
        const [companyUserCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(companyUsers)
          .where(eq(companyUsers.companyId, companyId));
        stats.users = Number(companyUserCount?.count || 0);
      }

      return stats;
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
} 