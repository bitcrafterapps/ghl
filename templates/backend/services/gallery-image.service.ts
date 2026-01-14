import { put, del, list } from '@vercel/blob';
import { db } from '../db';
import { galleryImages, GalleryImageStatus } from '../db/schema';
import {
  GalleryImageCreateDto,
  GalleryImageUpdateDto,
  GalleryImageResponse,
  GalleryImageQueryParams,
  GalleryImageReorderDto
} from '../types/gallery-image.types';
import { LoggerFactory } from '../logger';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { ActivityService } from './activity.service';
import * as fs from 'fs';
import * as path from 'path';

const logger = LoggerFactory.getLogger('GalleryImageService');

// Check if running in development mode
const isLocalDev = process.env.NODE_ENV !== 'production';
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'gallery');
const LOCAL_BASE_URL = process.env.LOCAL_UPLOADS_URL || 'http://localhost:3001/uploads/gallery';

// Ensure uploads directory exists in development
if (isLocalDev) {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    logger.info('Created local uploads directory:', UPLOADS_DIR);
  }
}

export class GalleryImageService {
  /**
   * Upload an image - uses local filesystem in development, Vercel Blob in production
   */
  static async uploadImage(
    file: Buffer,
    filename: string,
    contentType: string,
    metadata: GalleryImageCreateDto,
    actorUserId?: number
  ): Promise<GalleryImageResponse> {
    try {
      let blobUrl: string;
      let blobPathname: string;

      // Sanitize filename
      const sanitizedFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      if (isLocalDev) {
        // Local development: save to filesystem
        logger.debug('Saving image to local filesystem:', sanitizedFilename);

        const filePath = path.join(UPLOADS_DIR, sanitizedFilename);
        fs.writeFileSync(filePath, file);

        blobUrl = `${LOCAL_BASE_URL}/${sanitizedFilename}`;
        blobPathname = `gallery/${sanitizedFilename}`;

        logger.debug('Local file saved:', blobUrl);
      } else {
        // Production: upload to Vercel Blob
        logger.debug('Uploading image to Vercel Blob:', sanitizedFilename);

        const blob = await put(`gallery/${sanitizedFilename}`, file, {
          access: 'public',
          contentType,
        });

        blobUrl = blob.url;
        blobPathname = blob.pathname;

        logger.debug('Blob upload successful:', blobUrl);
      }

      // Create database record
      const [image] = await db.insert(galleryImages).values({
        userId: actorUserId || null,
        companyId: metadata.companyId || null,
        title: metadata.title || filename,
        description: metadata.description || null,
        altText: metadata.altText || metadata.title || filename,
        blobUrl,
        blobPathname,
        blobContentType: contentType,
        blobSize: file.length,
        category: metadata.category || null,
        tags: metadata.tags || [],
        sortOrder: metadata.sortOrder ?? 0,
        status: metadata.status || 'active',
      }).returning();

      // Log activity
      if (actorUserId) {
        await ActivityService.logActivity({
          type: 'gallery',
          action: 'created',
          title: `Gallery Image: ${image.title || filename}`,
          entityId: image.id,
          userId: actorUserId
        });
      }

      logger.debug('Gallery image created successfully:', image.id);

      return this.formatResponse(image);
    } catch (error) {
      logger.error('Error uploading gallery image:', error);
      throw error;
    }
  }

  /**
   * Get all gallery images with optional filtering
   */
  static async getImages(params: GalleryImageQueryParams = {}): Promise<GalleryImageResponse[]> {
    try {
      logger.debug('Fetching gallery images with params:', params);

      const conditions = [];

      if (params.category) {
        conditions.push(eq(galleryImages.category, params.category));
      }

      if (params.status) {
        conditions.push(eq(galleryImages.status, params.status));
      }

      if (params.companyId) {
        conditions.push(eq(galleryImages.companyId, params.companyId));
      }

      let query = db.select().from(galleryImages);

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      query = query.orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt)) as typeof query;

      if (params.limit) {
        query = query.limit(params.limit) as typeof query;
      }

      if (params.offset) {
        query = query.offset(params.offset) as typeof query;
      }

      const images = await query;

      logger.debug(`Retrieved ${images.length} gallery images`);

      return images.map(this.formatResponse);
    } catch (error) {
      logger.error('Error fetching gallery images:', error);
      throw error;
    }
  }

  /**
   * Get a single gallery image by ID
   */
  static async getImageById(id: number): Promise<GalleryImageResponse | null> {
    try {
      const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));

      if (!image) {
        return null;
      }

      return this.formatResponse(image);
    } catch (error) {
      logger.error('Error fetching gallery image by ID:', error);
      throw error;
    }
  }

  /**
   * Update gallery image metadata
   */
  static async updateImage(
    id: number,
    data: GalleryImageUpdateDto,
    actorUserId?: number
  ): Promise<GalleryImageResponse | null> {
    try {
      logger.debug('Updating gallery image:', id);

      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.altText !== undefined) updateData.altText = data.altText;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
      if (data.status !== undefined) updateData.status = data.status;

      const [updated] = await db
        .update(galleryImages)
        .set(updateData)
        .where(eq(galleryImages.id, id))
        .returning();

      if (!updated) {
        return null;
      }

      // Log activity
      if (actorUserId) {
        await ActivityService.logActivity({
          type: 'gallery',
          action: 'updated',
          title: `Gallery Image: ${updated.title}`,
          entityId: updated.id,
          userId: actorUserId
        });
      }

      logger.debug('Gallery image updated successfully:', id);

      return this.formatResponse(updated);
    } catch (error) {
      logger.error('Error updating gallery image:', error);
      throw error;
    }
  }

  /**
   * Delete a gallery image (removes from storage and database)
   */
  static async deleteImage(id: number, actorUserId?: number): Promise<boolean> {
    try {
      logger.debug('Deleting gallery image:', id);

      // Get the image first
      const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));

      if (!image) {
        return false;
      }

      // Delete from storage
      if (image.blobUrl) {
        try {
          if (isLocalDev && image.blobUrl.includes('localhost')) {
            // Local development: delete from filesystem
            const filename = image.blobUrl.split('/').pop();
            if (filename) {
              const filePath = path.join(UPLOADS_DIR, filename);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logger.debug('Deleted local file:', filePath);
              }
            }
          } else {
            // Production: delete from Vercel Blob
            await del(image.blobUrl);
            logger.debug('Deleted blob:', image.blobUrl);
          }
        } catch (storageError) {
          logger.warn('Failed to delete from storage (may not exist):', storageError);
        }
      }

      // Delete from database
      const [deleted] = await db.delete(galleryImages).where(eq(galleryImages.id, id)).returning();

      // Log activity
      if (actorUserId && deleted) {
        await ActivityService.logActivity({
          type: 'gallery',
          action: 'deleted',
          title: `Gallery Image: ${image.title}`,
          entityId: id,
          userId: actorUserId
        });
      }

      logger.debug('Gallery image deleted successfully:', id);

      return !!deleted;
    } catch (error) {
      logger.error('Error deleting gallery image:', error);
      throw error;
    }
  }

  /**
   * Bulk update image sort order
   */
  static async reorderImages(data: GalleryImageReorderDto, actorUserId?: number): Promise<void> {
    try {
      logger.debug('Reordering gallery images:', data.images.length);

      for (const item of data.images) {
        await db
          .update(galleryImages)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(galleryImages.id, item.id));
      }

      // Log activity
      if (actorUserId) {
        await ActivityService.logActivity({
          type: 'gallery',
          action: 'updated',
          title: `Reordered ${data.images.length} gallery images`,
          entityId: 0,
          userId: actorUserId
        });
      }

      logger.debug('Gallery images reordered successfully');
    } catch (error) {
      logger.error('Error reordering gallery images:', error);
      throw error;
    }
  }

  /**
   * Bulk delete images
   */
  static async bulkDelete(ids: number[], actorUserId?: number): Promise<number> {
    try {
      logger.debug('Bulk deleting gallery images:', ids.length);

      let deletedCount = 0;

      for (const id of ids) {
        const success = await this.deleteImage(id, actorUserId);
        if (success) deletedCount++;
      }

      logger.debug(`Bulk deleted ${deletedCount} images`);

      return deletedCount;
    } catch (error) {
      logger.error('Error bulk deleting gallery images:', error);
      throw error;
    }
  }

  /**
   * Get distinct categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const results = await db
        .selectDistinct({ category: galleryImages.category })
        .from(galleryImages)
        .where(sql`${galleryImages.category} IS NOT NULL`);

      return results.map(r => r.category).filter((c): c is string => c !== null);
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Format database record to response
   */
  private static formatResponse(image: typeof galleryImages.$inferSelect): GalleryImageResponse {
    return {
      id: image.id,
      userId: image.userId,
      companyId: image.companyId,
      title: image.title,
      description: image.description,
      altText: image.altText,
      blobUrl: image.blobUrl,
      blobPathname: image.blobPathname,
      blobContentType: image.blobContentType,
      blobSize: image.blobSize,
      thumbnailUrl: image.thumbnailUrl,
      category: image.category,
      tags: image.tags || [],
      sortOrder: image.sortOrder ?? 0,
      status: (image.status as GalleryImageStatus) || 'active',
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    };
  }
}
