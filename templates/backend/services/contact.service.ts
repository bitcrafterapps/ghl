import { db } from '../db';
import { contacts, contactActivities, jobs, users, ContactStatus, ContactSource } from '../db/schema';
import {
  ContactDTO,
  CreateContactDTO,
  UpdateContactDTO,
  ContactFilters,
  ContactActivityDTO,
  CreateContactActivityDTO,
  PaginationParams,
  PaginatedResponse
} from '../types/private-pages.types';
import { LoggerFactory } from '../logger';
import { eq, and, desc, asc, ilike, or, sql, count } from 'drizzle-orm';

const logger = LoggerFactory.getLogger('ContactService');

export class ContactService {
  /**
   * Get contacts with filtering and pagination
   */
  static async getContacts(
    companyId: number,
    filters: ContactFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<ContactDTO>> {
    try {
      logger.debug('Fetching contacts for company:', companyId, filters);

      const conditions = [eq(contacts.companyId, companyId)];

      // Search filter
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            ilike(contacts.firstName, searchTerm),
            ilike(contacts.lastName, searchTerm),
            ilike(contacts.email, searchTerm),
            ilike(contacts.phone, searchTerm),
            ilike(contacts.contactCompanyName, searchTerm)
          )!
        );
      }

      // Status filter
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(sql`${contacts.status} = ANY(${filters.status})`);
        } else {
          conditions.push(eq(contacts.status, filters.status));
        }
      }

      // Source filter
      if (filters.source) {
        if (Array.isArray(filters.source)) {
          conditions.push(sql`${contacts.source} = ANY(${filters.source})`);
        } else {
          conditions.push(eq(contacts.source, filters.source));
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        conditions.push(sql`${contacts.tags} ?| ${filters.tags}`);
      }

      // Get total count
      const [countResult] = await db
        .select({ count: count() })
        .from(contacts)
        .where(and(...conditions));

      const total = Number(countResult?.count) || 0;
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Get paginated results - always use createdAt for ordering
      const orderBy = pagination.sortOrder === 'asc'
        ? asc(contacts.createdAt)
        : desc(contacts.createdAt);

      const contactList = await db
        .select()
        .from(contacts)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      logger.debug(`Retrieved ${contactList.length} contacts`);

      return {
        data: contactList.map(this.formatResponse),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error fetching contacts:', error);
      throw error;
    }
  }

  /**
   * Get a single contact by ID
   */
  static async getContactById(
    contactId: string,
    companyId: number
  ): Promise<ContactDTO | null> {
    try {
      const [contact] = await db
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.id, contactId),
            eq(contacts.companyId, companyId)
          )
        );

      if (!contact) {
        return null;
      }

      return this.formatResponse(contact);
    } catch (error) {
      logger.error('Error fetching contact by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new contact
   */
  static async createContact(
    companyId: number,
    data: CreateContactDTO,
    createdByUserId?: number
  ): Promise<ContactDTO> {
    try {
      logger.debug('Creating contact:', data.firstName, data.lastName);

      const [contact] = await db.insert(contacts).values({
        companyId,
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email || null,
        phone: data.phone || null,
        phoneSecondary: data.phoneSecondary || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        country: data.country || 'USA',
        contactCompanyName: data.contactCompanyName || null,
        contactJobTitle: data.contactJobTitle || null,
        status: data.status || 'new',
        source: data.source || 'manual',
        tags: data.tags || [],
        customFields: data.customFields || null,
        notes: data.notes || null
      }).returning();

      // Log activity
      if (createdByUserId) {
        await this.addContactActivity(contact.id, createdByUserId, {
          type: 'note',
          title: 'Contact created',
          description: `Contact ${contact.firstName} ${contact.lastName || ''} was created`
        });
      }

      logger.debug('Contact created:', contact.id);

      return this.formatResponse(contact);
    } catch (error) {
      logger.error('Error creating contact:', error);
      throw error;
    }
  }

  /**
   * Update a contact
   */
  static async updateContact(
    contactId: string,
    companyId: number,
    data: UpdateContactDTO,
    updatedByUserId?: number
  ): Promise<ContactDTO | null> {
    try {
      logger.debug('Updating contact:', contactId);

      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.phoneSecondary !== undefined) updateData.phoneSecondary = data.phoneSecondary;
      if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1;
      if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;
      if (data.zip !== undefined) updateData.zip = data.zip;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.contactCompanyName !== undefined) updateData.contactCompanyName = data.contactCompanyName;
      if (data.contactJobTitle !== undefined) updateData.contactJobTitle = data.contactJobTitle;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.customFields !== undefined) updateData.customFields = data.customFields;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const [updated] = await db
        .update(contacts)
        .set(updateData)
        .where(
          and(
            eq(contacts.id, contactId),
            eq(contacts.companyId, companyId)
          )
        )
        .returning();

      if (!updated) {
        return null;
      }

      logger.debug('Contact updated:', contactId);

      return this.formatResponse(updated);
    } catch (error) {
      logger.error('Error updating contact:', error);
      throw error;
    }
  }

  /**
   * Delete a contact
   */
  static async deleteContact(
    contactId: string,
    companyId: number
  ): Promise<boolean> {
    try {
      logger.debug('Deleting contact:', contactId);

      const [deleted] = await db
        .delete(contacts)
        .where(
          and(
            eq(contacts.id, contactId),
            eq(contacts.companyId, companyId)
          )
        )
        .returning();

      logger.debug('Contact deleted:', contactId);

      return !!deleted;
    } catch (error) {
      logger.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * Get contact activities
   */
  static async getContactActivities(
    contactId: string,
    limit: number = 50
  ): Promise<ContactActivityDTO[]> {
    try {
      const activities = await db
        .select({
          id: contactActivities.id,
          contactId: contactActivities.contactId,
          userId: contactActivities.userId,
          type: contactActivities.type,
          title: contactActivities.title,
          description: contactActivities.description,
          metadata: contactActivities.metadata,
          createdAt: contactActivities.createdAt,
          userFirstName: users.firstName,
          userLastName: users.lastName
        })
        .from(contactActivities)
        .leftJoin(users, eq(contactActivities.userId, users.id))
        .where(eq(contactActivities.contactId, contactId))
        .orderBy(desc(contactActivities.createdAt))
        .limit(limit);

      return activities.map(a => ({
        id: a.id,
        contactId: a.contactId!,
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
      logger.error('Error fetching contact activities:', error);
      throw error;
    }
  }

  /**
   * Add an activity to a contact
   */
  static async addContactActivity(
    contactId: string,
    userId: number,
    data: CreateContactActivityDTO
  ): Promise<ContactActivityDTO> {
    try {
      const [activity] = await db.insert(contactActivities).values({
        contactId,
        userId,
        type: data.type,
        title: data.title,
        description: data.description || null,
        metadata: data.metadata || null
      }).returning();

      return {
        id: activity.id,
        contactId: activity.contactId!,
        userId: activity.userId,
        type: activity.type as any,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata as Record<string, any> | null,
        createdAt: activity.createdAt!
      };
    } catch (error) {
      logger.error('Error adding contact activity:', error);
      throw error;
    }
  }

  /**
   * Get jobs linked to a contact
   */
  static async getContactJobs(
    contactId: string,
    companyId: number
  ): Promise<any[]> {
    try {
      const jobList = await db
        .select()
        .from(jobs)
        .where(
          and(
            eq(jobs.contactId, contactId),
            eq(jobs.companyId, companyId)
          )
        )
        .orderBy(desc(jobs.createdAt));

      return jobList;
    } catch (error) {
      logger.error('Error fetching contact jobs:', error);
      throw error;
    }
  }

  /**
   * Format database record to response
   */
  private static formatResponse(contact: typeof contacts.$inferSelect): ContactDTO {
    return {
      id: contact.id,
      companyId: contact.companyId,
      ghlContactId: contact.ghlContactId,
      syncWithGhl: contact.syncWithGhl ?? false,
      lastGhlSync: contact.lastGhlSync,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      phoneSecondary: contact.phoneSecondary,
      addressLine1: contact.addressLine1,
      addressLine2: contact.addressLine2,
      city: contact.city,
      state: contact.state,
      zip: contact.zip,
      country: contact.country,
      contactCompanyName: contact.contactCompanyName,
      contactJobTitle: contact.contactJobTitle,
      status: (contact.status as ContactStatus) || 'new',
      source: (contact.source as ContactSource) || 'manual',
      tags: (contact.tags as string[]) || [],
      customFields: contact.customFields as Record<string, any> | null,
      notes: contact.notes,
      createdAt: contact.createdAt!,
      updatedAt: contact.updatedAt!
    };
  }
}
