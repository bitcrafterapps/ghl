import { db } from '../db';
import { calendarEvents, contacts, users, CalendarEventStatus, CalendarEventType } from '../db/schema';
import {
  CalendarEventDTO,
  CreateCalendarEventDTO,
  UpdateCalendarEventDTO,
  CalendarEventFilters
} from '../types/private-pages.types';
import { LoggerFactory } from '../logger';
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm';

const logger = LoggerFactory.getLogger('CalendarService');

export class CalendarService {
  /**
   * Get events for a company within a date range
   */
  static async getEvents(
    companyId: number,
    filters: CalendarEventFilters
  ): Promise<CalendarEventDTO[]> {
    try {
      logger.debug('Fetching calendar events for company:', companyId, filters);

      const conditions = [eq(calendarEvents.companyId, companyId)];

      // Date range filter
      if (filters.startDate) {
        conditions.push(gte(calendarEvents.startTime, new Date(filters.startDate)));
      }
      if (filters.endDate) {
        conditions.push(lte(calendarEvents.endTime, new Date(filters.endDate)));
      }

      // Event type filter
      if (filters.eventType) {
        if (Array.isArray(filters.eventType)) {
          conditions.push(sql`${calendarEvents.eventType} = ANY(${filters.eventType})`);
        } else {
          conditions.push(eq(calendarEvents.eventType, filters.eventType));
        }
      }

      // Status filter
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(sql`${calendarEvents.status} = ANY(${filters.status})`);
        } else {
          conditions.push(eq(calendarEvents.status, filters.status));
        }
      }

      // Contact filter
      if (filters.contactId) {
        conditions.push(eq(calendarEvents.contactId, filters.contactId));
      }

      // Job filter
      if (filters.jobId) {
        conditions.push(eq(calendarEvents.jobId, filters.jobId));
      }

      // Assigned user filter
      if (filters.assignedUserId) {
        conditions.push(eq(calendarEvents.assignedUserId, filters.assignedUserId));
      }

      const events = await db
        .select()
        .from(calendarEvents)
        .where(and(...conditions))
        .orderBy(asc(calendarEvents.startTime));

      logger.debug(`Retrieved ${events.length} calendar events`);

      // If expand is requested, join contact and user data
      if (filters.expand) {
        const expandedEvents = await Promise.all(
          events.map(async (event) => {
            const formatted = this.formatResponse(event);

            if (event.contactId) {
              const [contact] = await db
                .select({
                  id: contacts.id,
                  firstName: contacts.firstName,
                  lastName: contacts.lastName,
                  email: contacts.email,
                  phone: contacts.phone
                })
                .from(contacts)
                .where(eq(contacts.id, event.contactId));
              formatted.contact = contact || null;
            }

            if (event.assignedUserId) {
              const [user] = await db
                .select({
                  id: users.id,
                  firstName: users.firstName,
                  lastName: users.lastName
                })
                .from(users)
                .where(eq(users.id, event.assignedUserId));
              formatted.assignedUser = user || null;
            }

            return formatted;
          })
        );
        return expandedEvents;
      }

      return events.map(this.formatResponse);
    } catch (error) {
      logger.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  /**
   * Get upcoming events for a company
   */
  static async getUpcomingEvents(
    companyId: number,
    limit: number = 10
  ): Promise<CalendarEventDTO[]> {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const events = await db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.companyId, companyId),
            gte(calendarEvents.startTime, now),
            lte(calendarEvents.startTime, sevenDaysFromNow),
            sql`${calendarEvents.status} NOT IN ('cancelled', 'completed')`
          )
        )
        .orderBy(asc(calendarEvents.startTime))
        .limit(limit);

      return events.map(this.formatResponse);
    } catch (error) {
      logger.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Get a single event by ID
   */
  static async getEventById(
    eventId: string,
    companyId: number
  ): Promise<CalendarEventDTO | null> {
    try {
      const [event] = await db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.id, eventId),
            eq(calendarEvents.companyId, companyId)
          )
        );

      if (!event) {
        return null;
      }

      return this.formatResponse(event);
    } catch (error) {
      logger.error('Error fetching event by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new calendar event
   */
  static async createEvent(
    companyId: number,
    data: CreateCalendarEventDTO
  ): Promise<CalendarEventDTO> {
    try {
      logger.debug('Creating calendar event:', data.title);

      const [event] = await db.insert(calendarEvents).values({
        companyId,
        title: data.title,
        description: data.description || null,
        eventType: data.eventType || 'appointment',
        status: data.status || 'scheduled',
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        allDay: data.allDay ?? false,
        timezone: data.timezone || 'America/Los_Angeles',
        location: data.location || null,
        locationAddress: data.locationAddress || null,
        isVirtual: data.isVirtual ?? false,
        virtualMeetingUrl: data.virtualMeetingUrl || null,
        contactId: data.contactId || null,
        jobId: data.jobId || null,
        assignedUserId: data.assignedUserId || null,
        reminderMinutes: data.reminderMinutes ?? 30,
        color: data.color || '#3B82F6',
        metadata: data.metadata || null
      }).returning();

      logger.debug('Calendar event created:', event.id);

      return this.formatResponse(event);
    } catch (error) {
      logger.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update a calendar event
   */
  static async updateEvent(
    eventId: string,
    companyId: number,
    data: UpdateCalendarEventDTO
  ): Promise<CalendarEventDTO | null> {
    try {
      logger.debug('Updating calendar event:', eventId);

      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.eventType !== undefined) updateData.eventType = data.eventType;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
      if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
      if (data.allDay !== undefined) updateData.allDay = data.allDay;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.locationAddress !== undefined) updateData.locationAddress = data.locationAddress;
      if (data.isVirtual !== undefined) updateData.isVirtual = data.isVirtual;
      if (data.virtualMeetingUrl !== undefined) updateData.virtualMeetingUrl = data.virtualMeetingUrl;
      if (data.contactId !== undefined) updateData.contactId = data.contactId;
      if (data.jobId !== undefined) updateData.jobId = data.jobId;
      if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
      if (data.reminderMinutes !== undefined) updateData.reminderMinutes = data.reminderMinutes;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;

      const [updated] = await db
        .update(calendarEvents)
        .set(updateData)
        .where(
          and(
            eq(calendarEvents.id, eventId),
            eq(calendarEvents.companyId, companyId)
          )
        )
        .returning();

      if (!updated) {
        return null;
      }

      logger.debug('Calendar event updated:', eventId);

      return this.formatResponse(updated);
    } catch (error) {
      logger.error('Error updating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update event status
   */
  static async updateEventStatus(
    eventId: string,
    companyId: number,
    status: CalendarEventStatus
  ): Promise<CalendarEventDTO | null> {
    try {
      logger.debug('Updating event status:', eventId, status);

      const [updated] = await db
        .update(calendarEvents)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(calendarEvents.id, eventId),
            eq(calendarEvents.companyId, companyId)
          )
        )
        .returning();

      if (!updated) {
        return null;
      }

      return this.formatResponse(updated);
    } catch (error) {
      logger.error('Error updating event status:', error);
      throw error;
    }
  }

  /**
   * Delete a calendar event
   */
  static async deleteEvent(
    eventId: string,
    companyId: number
  ): Promise<boolean> {
    try {
      logger.debug('Deleting calendar event:', eventId);

      const [deleted] = await db
        .delete(calendarEvents)
        .where(
          and(
            eq(calendarEvents.id, eventId),
            eq(calendarEvents.companyId, companyId)
          )
        )
        .returning();

      logger.debug('Calendar event deleted:', eventId);

      return !!deleted;
    } catch (error) {
      logger.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  /**
   * Format database record to response
   */
  private static formatResponse(event: typeof calendarEvents.$inferSelect): CalendarEventDTO {
    return {
      id: event.id,
      companyId: event.companyId,
      ghlCalendarId: event.ghlCalendarId,
      ghlEventId: event.ghlEventId,
      syncWithGhl: event.syncWithGhl ?? false,
      title: event.title,
      description: event.description,
      eventType: (event.eventType as CalendarEventType) || 'appointment',
      status: (event.status as CalendarEventStatus) || 'scheduled',
      startTime: event.startTime!,
      endTime: event.endTime!,
      allDay: event.allDay ?? false,
      timezone: event.timezone || 'America/Los_Angeles',
      recurrenceRule: event.recurrenceRule,
      recurrenceEndDate: event.recurrenceEndDate,
      parentEventId: event.parentEventId,
      isRecurringInstance: event.isRecurringInstance ?? false,
      location: event.location,
      locationAddress: event.locationAddress,
      isVirtual: event.isVirtual ?? false,
      virtualMeetingUrl: event.virtualMeetingUrl,
      contactId: event.contactId,
      jobId: event.jobId,
      assignedUserId: event.assignedUserId,
      reminderMinutes: event.reminderMinutes ?? 30,
      reminderSent: event.reminderSent ?? false,
      color: event.color || '#3B82F6',
      metadata: event.metadata as Record<string, any> | null,
      createdAt: event.createdAt!,
      updatedAt: event.updatedAt!
    };
  }
}
