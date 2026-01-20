import { db } from '../db';
import { jobs, jobActivities, contacts, users, jobPhotos, JobStatus, JobPriority } from '../db/schema';
import {
  JobDTO,
  CreateJobDTO,
  UpdateJobDTO,
  JobFilters,
  JobActivityDTO,
  CreateJobActivityDTO,
  JobKanbanResponse,
  PaginationParams,
  PaginatedResponse
} from '../types/private-pages.types';
import { LoggerFactory } from '../logger';
import { eq, and, desc, asc, ilike, or, sql, count, gte, lte } from 'drizzle-orm';

const logger = LoggerFactory.getLogger('JobService');

// Status labels for Kanban view
const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  lead: 'Lead',
  quoted: 'Quoted',
  approved: 'Approved',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  invoiced: 'Invoiced',
  paid: 'Paid',
  cancelled: 'Cancelled'
};

export class JobService {
  /**
   * Generate next job number for company
   */
  private static async generateJobNumber(companyId: number): Promise<string> {
    const [result] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.companyId, companyId));

    const nextNum = (Number(result?.count) || 0) + 1;
    return `JOB-${String(nextNum).padStart(5, '0')}`;
  }

  /**
   * Get jobs with filtering and pagination
   */
  static async getJobs(
    companyId: number,
    filters: JobFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<JobDTO>> {
    try {
      logger.debug('Fetching jobs for company:', companyId, filters);

      const conditions = [eq(jobs.companyId, companyId)];

      // Search filter
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            ilike(jobs.title, searchTerm),
            ilike(jobs.jobNumber, searchTerm),
            ilike(jobs.description, searchTerm)
          )!
        );
      }

      // Status filter
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(sql`${jobs.status} = ANY(${filters.status})`);
        } else {
          conditions.push(eq(jobs.status, filters.status));
        }
      }

      // Priority filter
      if (filters.priority) {
        if (Array.isArray(filters.priority)) {
          conditions.push(sql`${jobs.priority} = ANY(${filters.priority})`);
        } else {
          conditions.push(eq(jobs.priority, filters.priority));
        }
      }

      // Contact filter
      if (filters.contactId) {
        conditions.push(eq(jobs.contactId, filters.contactId));
      }

      // Assigned user filter
      if (filters.assignedUserId) {
        conditions.push(eq(jobs.assignedUserId, filters.assignedUserId));
      }

      // Service type filter
      if (filters.serviceType) {
        conditions.push(eq(jobs.serviceType, filters.serviceType));
      }

      // Scheduled date range filter
      if (filters.scheduledDateStart) {
        conditions.push(gte(jobs.scheduledDate, new Date(filters.scheduledDateStart)));
      }
      if (filters.scheduledDateEnd) {
        conditions.push(lte(jobs.scheduledDate, new Date(filters.scheduledDateEnd)));
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        conditions.push(sql`${jobs.tags} ?| ${filters.tags}`);
      }

      // Get total count
      const [countResult] = await db
        .select({ count: count() })
        .from(jobs)
        .where(and(...conditions));

      const total = Number(countResult?.count) || 0;
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Get paginated results - always use createdAt for ordering
      const orderBy = pagination.sortOrder === 'asc'
        ? asc(jobs.createdAt)
        : desc(jobs.createdAt);

      const jobList = await db
        .select()
        .from(jobs)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      logger.debug(`Retrieved ${jobList.length} jobs`);

      return {
        data: jobList.map(this.formatResponse),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error fetching jobs:', error);
      throw error;
    }
  }

  /**
   * Get jobs in Kanban format (grouped by status)
   */
  static async getJobsKanban(companyId: number): Promise<JobKanbanResponse> {
    try {
      logger.debug('Fetching jobs kanban for company:', companyId);

      const allJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.companyId, companyId))
        .orderBy(asc(jobs.createdAt));

      const statuses: JobStatus[] = ['lead', 'quoted', 'approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'cancelled'];

      const columns = statuses.map(status => {
        const statusJobs = allJobs.filter(j => j.status === status);
        return {
          status,
          label: JOB_STATUS_LABELS[status],
          jobs: statusJobs.map(this.formatResponse),
          count: statusJobs.length
        };
      });

      return { columns };
    } catch (error) {
      logger.error('Error fetching jobs kanban:', error);
      throw error;
    }
  }

  /**
   * Get a single job by ID
   */
  static async getJobById(
    jobId: string,
    companyId: number
  ): Promise<JobDTO | null> {
    try {
      const [job] = await db
        .select()
        .from(jobs)
        .where(
          and(
            eq(jobs.id, jobId),
            eq(jobs.companyId, companyId)
          )
        );

      if (!job) {
        return null;
      }

      const result = this.formatResponse(job);

      // Get contact info
      if (job.contactId) {
        const [contact] = await db
          .select({
            id: contacts.id,
            firstName: contacts.firstName,
            lastName: contacts.lastName,
            email: contacts.email,
            phone: contacts.phone
          })
          .from(contacts)
          .where(eq(contacts.id, job.contactId));
        result.contact = contact || null;
      }

      // Get assigned user info
      if (job.assignedUserId) {
        const [user] = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName
          })
          .from(users)
          .where(eq(users.id, job.assignedUserId));
        result.assignedUser = user || null;
      }

      // Get photo count
      const [photoCount] = await db
        .select({ count: count() })
        .from(jobPhotos)
        .where(eq(jobPhotos.jobId, jobId));
      result.photoCount = Number(photoCount?.count) || 0;

      return result;
    } catch (error) {
      logger.error('Error fetching job by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new job
   */
  static async createJob(
    companyId: number,
    data: CreateJobDTO,
    createdByUserId?: number
  ): Promise<JobDTO> {
    try {
      logger.debug('Creating job:', data.title);

      const jobNumber = await this.generateJobNumber(companyId);

      const [job] = await db.insert(jobs).values({
        companyId,
        jobNumber,
        title: data.title,
        description: data.description || null,
        status: data.status || 'lead',
        priority: data.priority || 'normal',
        contactId: data.contactId || null,
        assignedUserId: data.assignedUserId || null,
        serviceType: data.serviceType || null,
        serviceCategory: data.serviceCategory || null,
        siteAddressLine1: data.siteAddressLine1 || null,
        siteAddressLine2: data.siteAddressLine2 || null,
        siteCity: data.siteCity || null,
        siteState: data.siteState || null,
        siteZip: data.siteZip || null,
        estimatedAmount: data.estimatedAmount || null,
        quotedAmount: data.quotedAmount || null,
        finalAmount: data.finalAmount || null,
        currency: data.currency || 'USD',
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        estimatedDuration: data.estimatedDuration || null,
        internalNotes: data.internalNotes || null,
        customerNotes: data.customerNotes || null,
        tags: data.tags || [],
        customFields: data.customFields || null
      }).returning();

      // Log activity
      if (createdByUserId) {
        await this.addJobActivity(job.id, createdByUserId, {
          type: 'note',
          title: 'Job created',
          description: `Job ${job.jobNumber} was created`
        });
      }

      logger.debug('Job created:', job.id);

      return this.formatResponse(job);
    } catch (error) {
      logger.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Update a job
   */
  static async updateJob(
    jobId: string,
    companyId: number,
    data: UpdateJobDTO,
    updatedByUserId?: number
  ): Promise<JobDTO | null> {
    try {
      logger.debug('Updating job:', jobId);

      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.contactId !== undefined) updateData.contactId = data.contactId;
      if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
      if (data.serviceType !== undefined) updateData.serviceType = data.serviceType;
      if (data.serviceCategory !== undefined) updateData.serviceCategory = data.serviceCategory;
      if (data.siteAddressLine1 !== undefined) updateData.siteAddressLine1 = data.siteAddressLine1;
      if (data.siteAddressLine2 !== undefined) updateData.siteAddressLine2 = data.siteAddressLine2;
      if (data.siteCity !== undefined) updateData.siteCity = data.siteCity;
      if (data.siteState !== undefined) updateData.siteState = data.siteState;
      if (data.siteZip !== undefined) updateData.siteZip = data.siteZip;
      if (data.estimatedAmount !== undefined) updateData.estimatedAmount = data.estimatedAmount;
      if (data.quotedAmount !== undefined) updateData.quotedAmount = data.quotedAmount;
      if (data.finalAmount !== undefined) updateData.finalAmount = data.finalAmount;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.scheduledDate !== undefined) updateData.scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
      if (data.estimatedDuration !== undefined) updateData.estimatedDuration = data.estimatedDuration;
      if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
      if (data.customerNotes !== undefined) updateData.customerNotes = data.customerNotes;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.customFields !== undefined) updateData.customFields = data.customFields;

      const [updated] = await db
        .update(jobs)
        .set(updateData)
        .where(
          and(
            eq(jobs.id, jobId),
            eq(jobs.companyId, companyId)
          )
        )
        .returning();

      if (!updated) {
        return null;
      }

      logger.debug('Job updated:', jobId);

      return this.formatResponse(updated);
    } catch (error) {
      logger.error('Error updating job:', error);
      throw error;
    }
  }

  /**
   * Update job status
   */
  static async updateJobStatus(
    jobId: string,
    companyId: number,
    status: JobStatus,
    updatedByUserId?: number
  ): Promise<JobDTO | null> {
    try {
      logger.debug('Updating job status:', jobId, status);

      // Get current job for activity logging
      const [currentJob] = await db
        .select()
        .from(jobs)
        .where(
          and(
            eq(jobs.id, jobId),
            eq(jobs.companyId, companyId)
          )
        );

      if (!currentJob) {
        return null;
      }

      const previousStatus = currentJob.status;

      const updateData: Record<string, any> = {
        status,
        updatedAt: new Date()
      };

      // Set actual start time when moving to in_progress
      if (status === 'in_progress' && !currentJob.actualStartTime) {
        updateData.actualStartTime = new Date();
      }

      // Set actual end time when completing
      if (status === 'completed' && !currentJob.actualEndTime) {
        updateData.actualEndTime = new Date();
      }

      const [updated] = await db
        .update(jobs)
        .set(updateData)
        .where(
          and(
            eq(jobs.id, jobId),
            eq(jobs.companyId, companyId)
          )
        )
        .returning();

      if (!updated) {
        return null;
      }

      // Log status change activity
      if (updatedByUserId) {
        await this.addJobActivity(jobId, updatedByUserId, {
          type: 'status_change',
          title: `Status changed to ${JOB_STATUS_LABELS[status]}`,
          metadata: {
            previousStatus,
            newStatus: status
          }
        });
      }

      return this.formatResponse(updated);
    } catch (error) {
      logger.error('Error updating job status:', error);
      throw error;
    }
  }

  /**
   * Delete a job
   */
  static async deleteJob(
    jobId: string,
    companyId: number
  ): Promise<boolean> {
    try {
      logger.debug('Deleting job:', jobId);

      const [deleted] = await db
        .delete(jobs)
        .where(
          and(
            eq(jobs.id, jobId),
            eq(jobs.companyId, companyId)
          )
        )
        .returning();

      logger.debug('Job deleted:', jobId);

      return !!deleted;
    } catch (error) {
      logger.error('Error deleting job:', error);
      throw error;
    }
  }

  /**
   * Get job activities
   */
  static async getJobActivities(
    jobId: string,
    limit: number = 50
  ): Promise<JobActivityDTO[]> {
    try {
      const activities = await db
        .select({
          id: jobActivities.id,
          jobId: jobActivities.jobId,
          userId: jobActivities.userId,
          type: jobActivities.type,
          title: jobActivities.title,
          description: jobActivities.description,
          metadata: jobActivities.metadata,
          createdAt: jobActivities.createdAt,
          userFirstName: users.firstName,
          userLastName: users.lastName
        })
        .from(jobActivities)
        .leftJoin(users, eq(jobActivities.userId, users.id))
        .where(eq(jobActivities.jobId, jobId))
        .orderBy(desc(jobActivities.createdAt))
        .limit(limit);

      return activities.map(a => ({
        id: a.id,
        jobId: a.jobId!,
        userId: a.userId,
        type: a.type as any,
        title: a.title,
        description: a.description,
        metadata: a.metadata as Record<string, any> | null,
        createdAt: a.createdAt!,
        user: a.userId ? {
          id: a.userId,
          firstName: a.userFirstName,
          lastName: a.userLastName
        } : null
      }));
    } catch (error) {
      logger.error('Error fetching job activities:', error);
      throw error;
    }
  }

  /**
   * Add an activity to a job
   */
  static async addJobActivity(
    jobId: string,
    userId: number,
    data: CreateJobActivityDTO
  ): Promise<JobActivityDTO> {
    try {
      const [activity] = await db.insert(jobActivities).values({
        jobId,
        userId,
        type: data.type,
        title: data.title,
        description: data.description || null,
        metadata: data.metadata || null
      }).returning();

      return {
        id: activity.id,
        jobId: activity.jobId!,
        userId: activity.userId,
        type: activity.type as any,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata as Record<string, any> | null,
        createdAt: activity.createdAt!
      };
    } catch (error) {
      logger.error('Error adding job activity:', error);
      throw error;
    }
  }

  /**
   * Format database record to response
   */
  private static formatResponse(job: typeof jobs.$inferSelect): JobDTO {
    return {
      id: job.id,
      companyId: job.companyId,
      jobNumber: job.jobNumber,
      title: job.title,
      description: job.description,
      status: (job.status as JobStatus) || 'lead',
      priority: (job.priority as JobPriority) || 'normal',
      contactId: job.contactId,
      assignedUserId: job.assignedUserId,
      serviceType: job.serviceType,
      serviceCategory: job.serviceCategory,
      siteAddressLine1: job.siteAddressLine1,
      siteAddressLine2: job.siteAddressLine2,
      siteCity: job.siteCity,
      siteState: job.siteState,
      siteZip: job.siteZip,
      estimatedAmount: job.estimatedAmount,
      quotedAmount: job.quotedAmount,
      finalAmount: job.finalAmount,
      currency: job.currency || 'USD',
      scheduledDate: job.scheduledDate,
      estimatedDuration: job.estimatedDuration,
      actualStartTime: job.actualStartTime,
      actualEndTime: job.actualEndTime,
      internalNotes: job.internalNotes,
      customerNotes: job.customerNotes,
      tags: (job.tags as string[]) || [],
      customFields: job.customFields as Record<string, any> | null,
      createdAt: job.createdAt!,
      updatedAt: job.updatedAt!
    };
  }
}
