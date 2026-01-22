import { db } from '../db';
import { siteContent } from '../db/schema';
import { LoggerFactory } from '../logger';
import { eq, and } from 'drizzle-orm';

const logger = LoggerFactory.getLogger('SiteContentService');

export interface SiteContentCreateDto {
  siteId: string;
  page: string;
  section: string;
  contentKey: string;
  content: string;
}

export interface SiteContentUpdateDto {
  content: string;
}

export interface SiteContentResponse {
  id: string;
  siteId: string;
  page: string;
  section: string;
  contentKey: string;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface SiteContentQueryParams {
  siteId: string;
  page?: string;
  section?: string;
}

export class SiteContentService {
  /**
   * Get all content for a site with optional filtering
   */
  static async getContent(params: SiteContentQueryParams): Promise<SiteContentResponse[]> {
    try {
      logger.debug('Fetching site content with params:', params);

      const conditions = [eq(siteContent.siteId, params.siteId)];

      if (params.page) {
        conditions.push(eq(siteContent.page, params.page));
      }

      if (params.section) {
        conditions.push(eq(siteContent.section, params.section));
      }

      const results = await db
        .select()
        .from(siteContent)
        .where(and(...conditions));

      logger.debug(`Found ${results.length} content items`);
      return results.map(this.formatResponse);
    } catch (error) {
      logger.error('Error fetching site content:', error);
      throw error;
    }
  }

  /**
   * Get content for a specific section
   */
  static async getSectionContent(
    siteId: string,
    page: string,
    section: string
  ): Promise<SiteContentResponse[]> {
    try {
      logger.debug(`Fetching content for ${page}/${section}`);

      const results = await db
        .select()
        .from(siteContent)
        .where(
          and(
            eq(siteContent.siteId, siteId),
            eq(siteContent.page, page),
            eq(siteContent.section, section)
          )
        );

      return results.map(this.formatResponse);
    } catch (error) {
      logger.error('Error fetching section content:', error);
      throw error;
    }
  }

  /**
   * Get a single content item by key
   */
  static async getContentByKey(
    siteId: string,
    page: string,
    section: string,
    contentKey: string
  ): Promise<SiteContentResponse | null> {
    try {
      const [result] = await db
        .select()
        .from(siteContent)
        .where(
          and(
            eq(siteContent.siteId, siteId),
            eq(siteContent.page, page),
            eq(siteContent.section, section),
            eq(siteContent.contentKey, contentKey)
          )
        )
        .limit(1);

      return result ? this.formatResponse(result) : null;
    } catch (error) {
      logger.error('Error fetching content by key:', error);
      throw error;
    }
  }

  /**
   * Upsert content (create or update)
   */
  static async upsertContent(data: SiteContentCreateDto): Promise<SiteContentResponse> {
    try {
      logger.debug(`Upserting content for ${data.page}/${data.section}/${data.contentKey}`);

      // Check if content exists
      const existing = await this.getContentByKey(
        data.siteId,
        data.page,
        data.section,
        data.contentKey
      );

      if (existing) {
        // Update existing
        const [updated] = await db
          .update(siteContent)
          .set({
            content: data.content,
            updatedAt: new Date()
          })
          .where(eq(siteContent.id, existing.id))
          .returning();

        logger.debug(`Updated content ID: ${updated.id}`);
        return this.formatResponse(updated);
      } else {
        // Create new
        const [created] = await db
          .insert(siteContent)
          .values({
            siteId: data.siteId,
            page: data.page,
            section: data.section,
            contentKey: data.contentKey,
            content: data.content
          })
          .returning();

        logger.debug(`Created content ID: ${created.id}`);
        return this.formatResponse(created);
      }
    } catch (error) {
      logger.error('Error upserting content:', error);
      throw error;
    }
  }

  /**
   * Bulk upsert content for a section
   */
  static async bulkUpsertContent(
    siteId: string,
    page: string,
    section: string,
    items: Array<{ contentKey: string; content: string }>
  ): Promise<SiteContentResponse[]> {
    try {
      logger.debug(`Bulk upserting ${items.length} content items for ${page}/${section}`);

      const results: SiteContentResponse[] = [];

      for (const item of items) {
        const result = await this.upsertContent({
          siteId,
          page,
          section,
          contentKey: item.contentKey,
          content: item.content
        });
        results.push(result);
      }

      return results;
    } catch (error) {
      logger.error('Error bulk upserting content:', error);
      throw error;
    }
  }

  /**
   * Delete content by ID
   */
  static async deleteContent(id: string): Promise<boolean> {
    try {
      logger.debug(`Deleting content ID: ${id}`);

      const result = await db
        .delete(siteContent)
        .where(eq(siteContent.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      logger.error('Error deleting content:', error);
      throw error;
    }
  }

  /**
   * Delete all content for a section
   */
  static async deleteSectionContent(
    siteId: string,
    page: string,
    section: string
  ): Promise<number> {
    try {
      logger.debug(`Deleting all content for ${page}/${section}`);

      const result = await db
        .delete(siteContent)
        .where(
          and(
            eq(siteContent.siteId, siteId),
            eq(siteContent.page, page),
            eq(siteContent.section, section)
          )
        )
        .returning();

      return result.length;
    } catch (error) {
      logger.error('Error deleting section content:', error);
      throw error;
    }
  }

  /**
   * Get available pages and sections for a site
   */
  static async getAvailableSections(siteId: string): Promise<Array<{ page: string; section: string }>> {
    try {
      const results = await db
        .selectDistinct({
          page: siteContent.page,
          section: siteContent.section
        })
        .from(siteContent)
        .where(eq(siteContent.siteId, siteId));

      return results;
    } catch (error) {
      logger.error('Error fetching available sections:', error);
      throw error;
    }
  }

  private static formatResponse(record: typeof siteContent.$inferSelect): SiteContentResponse {
    return {
      id: record.id,
      siteId: record.siteId,
      page: record.page,
      section: record.section,
      contentKey: record.contentKey,
      content: record.content,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}
