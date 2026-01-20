import { db } from '../db';
import { jobPhotos, jobPhotoBeforeAfterPairs, galleryImages, jobs, users, JobPhotoType, PhotoPublishStatus } from '../db/schema';
import {
  JobPhotoDTO,
  CreateJobPhotoDTO,
  UpdateJobPhotoDTO,
  PublishPhotosDTO,
  BeforeAfterPairDTO,
  CreateBeforeAfterPairDTO
} from '../types/private-pages.types';
import { LoggerFactory } from '../logger';
import { eq, and, desc, asc } from 'drizzle-orm';

const logger = LoggerFactory.getLogger('JobPhotoService');

export class JobPhotoService {
  /**
   * Get all photos for a job
   */
  static async getJobPhotos(
    jobId: string,
    companyId: number
  ): Promise<JobPhotoDTO[]> {
    try {
      logger.debug('Fetching photos for job:', jobId);

      const photos = await db
        .select()
        .from(jobPhotos)
        .where(
          and(
            eq(jobPhotos.jobId, jobId),
            eq(jobPhotos.companyId, companyId)
          )
        )
        .orderBy(asc(jobPhotos.sortOrder), desc(jobPhotos.createdAt));

      return photos.map(this.formatResponse);
    } catch (error) {
      logger.error('Error fetching job photos:', error);
      throw error;
    }
  }

  /**
   * Get a single photo by ID
   */
  static async getPhotoById(
    photoId: string,
    companyId: number
  ): Promise<JobPhotoDTO | null> {
    try {
      const [photo] = await db
        .select()
        .from(jobPhotos)
        .where(
          and(
            eq(jobPhotos.id, photoId),
            eq(jobPhotos.companyId, companyId)
          )
        );

      if (!photo) {
        return null;
      }

      return this.formatResponse(photo);
    } catch (error) {
      logger.error('Error fetching photo by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new job photo
   */
  static async createJobPhoto(
    jobId: string,
    companyId: number,
    uploadedByUserId: number,
    data: CreateJobPhotoDTO
  ): Promise<JobPhotoDTO> {
    try {
      logger.debug('Creating job photo for job:', jobId);

      // Get current max sort order
      const existingPhotos = await db
        .select({ sortOrder: jobPhotos.sortOrder })
        .from(jobPhotos)
        .where(eq(jobPhotos.jobId, jobId))
        .orderBy(desc(jobPhotos.sortOrder))
        .limit(1);

      const nextSortOrder = (existingPhotos[0]?.sortOrder ?? -1) + 1;

      const [photo] = await db.insert(jobPhotos).values({
        jobId,
        companyId,
        uploadedByUserId,
        blobUrl: data.blobUrl,
        blobPathname: data.blobPathname || null,
        thumbnailUrl: data.thumbnailUrl || null,
        title: data.title || null,
        description: data.description || null,
        altText: data.altText || null,
        photoType: data.photoType || 'other',
        sortOrder: data.sortOrder ?? nextSortOrder,
        isFeatured: data.isFeatured ?? false,
        fileSize: data.fileSize || null,
        width: data.width || null,
        height: data.height || null,
        mimeType: data.mimeType || null,
        takenAt: data.takenAt ? new Date(data.takenAt) : null
      }).returning();

      logger.debug('Job photo created:', photo.id);

      return this.formatResponse(photo);
    } catch (error) {
      logger.error('Error creating job photo:', error);
      throw error;
    }
  }

  /**
   * Update a job photo
   */
  static async updateJobPhoto(
    photoId: string,
    companyId: number,
    data: UpdateJobPhotoDTO
  ): Promise<JobPhotoDTO | null> {
    try {
      logger.debug('Updating job photo:', photoId);

      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (data.blobUrl !== undefined) updateData.blobUrl = data.blobUrl;
      if (data.blobPathname !== undefined) updateData.blobPathname = data.blobPathname;
      if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.altText !== undefined) updateData.altText = data.altText;
      if (data.photoType !== undefined) updateData.photoType = data.photoType;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
      if (data.takenAt !== undefined) updateData.takenAt = data.takenAt ? new Date(data.takenAt) : null;

      const [updated] = await db
        .update(jobPhotos)
        .set(updateData)
        .where(
          and(
            eq(jobPhotos.id, photoId),
            eq(jobPhotos.companyId, companyId)
          )
        )
        .returning();

      if (!updated) {
        return null;
      }

      logger.debug('Job photo updated:', photoId);

      return this.formatResponse(updated);
    } catch (error) {
      logger.error('Error updating job photo:', error);
      throw error;
    }
  }

  /**
   * Delete a job photo
   */
  static async deleteJobPhoto(
    photoId: string,
    companyId: number
  ): Promise<boolean> {
    try {
      logger.debug('Deleting job photo:', photoId);

      const [deleted] = await db
        .delete(jobPhotos)
        .where(
          and(
            eq(jobPhotos.id, photoId),
            eq(jobPhotos.companyId, companyId)
          )
        )
        .returning();

      logger.debug('Job photo deleted:', photoId);

      return !!deleted;
    } catch (error) {
      logger.error('Error deleting job photo:', error);
      throw error;
    }
  }

  /**
   * Reorder photos for a job
   */
  static async reorderPhotos(
    jobId: string,
    companyId: number,
    photoIds: string[]
  ): Promise<void> {
    try {
      logger.debug('Reordering photos for job:', jobId);

      await Promise.all(
        photoIds.map((photoId, index) =>
          db
            .update(jobPhotos)
            .set({ sortOrder: index, updatedAt: new Date() })
            .where(
              and(
                eq(jobPhotos.id, photoId),
                eq(jobPhotos.jobId, jobId),
                eq(jobPhotos.companyId, companyId)
              )
            )
        )
      );

      logger.debug('Photos reordered successfully');
    } catch (error) {
      logger.error('Error reordering photos:', error);
      throw error;
    }
  }

  /**
   * Get before/after pairs for a job
   */
  static async getBeforeAfterPairs(
    jobId: string,
    companyId: number
  ): Promise<BeforeAfterPairDTO[]> {
    try {
      logger.debug('Fetching before/after pairs for job:', jobId);

      const pairs = await db
        .select()
        .from(jobPhotoBeforeAfterPairs)
        .where(eq(jobPhotoBeforeAfterPairs.jobId, jobId))
        .orderBy(asc(jobPhotoBeforeAfterPairs.sortOrder));

      // Fetch photo details for each pair
      const pairsWithPhotos = await Promise.all(
        pairs.map(async (pair) => {
          const [beforePhoto] = pair.beforePhotoId
            ? await db
                .select()
                .from(jobPhotos)
                .where(eq(jobPhotos.id, pair.beforePhotoId))
            : [null];

          const [afterPhoto] = pair.afterPhotoId
            ? await db
                .select()
                .from(jobPhotos)
                .where(eq(jobPhotos.id, pair.afterPhotoId))
            : [null];

          return {
            id: pair.id,
            jobId: pair.jobId!,
            beforePhotoId: pair.beforePhotoId!,
            afterPhotoId: pair.afterPhotoId!,
            title: pair.title,
            description: pair.description,
            sortOrder: pair.sortOrder ?? 0,
            publishStatus: (pair.publishStatus as PhotoPublishStatus) || 'private',
            createdAt: pair.createdAt!,
            beforePhoto: beforePhoto ? this.formatResponse(beforePhoto) : undefined,
            afterPhoto: afterPhoto ? this.formatResponse(afterPhoto) : undefined
          };
        })
      );

      return pairsWithPhotos;
    } catch (error) {
      logger.error('Error fetching before/after pairs:', error);
      throw error;
    }
  }

  /**
   * Create a before/after pair
   */
  static async createBeforeAfterPair(
    jobId: string,
    companyId: number,
    data: CreateBeforeAfterPairDTO
  ): Promise<BeforeAfterPairDTO> {
    try {
      logger.debug('Creating before/after pair for job:', jobId);

      // Verify both photos exist and belong to this job
      const [beforePhoto] = await db
        .select()
        .from(jobPhotos)
        .where(
          and(
            eq(jobPhotos.id, data.beforePhotoId),
            eq(jobPhotos.jobId, jobId),
            eq(jobPhotos.companyId, companyId)
          )
        );

      const [afterPhoto] = await db
        .select()
        .from(jobPhotos)
        .where(
          and(
            eq(jobPhotos.id, data.afterPhotoId),
            eq(jobPhotos.jobId, jobId),
            eq(jobPhotos.companyId, companyId)
          )
        );

      if (!beforePhoto || !afterPhoto) {
        throw new Error('Before and after photos must exist and belong to this job');
      }

      // Get next sort order
      const existingPairs = await db
        .select({ sortOrder: jobPhotoBeforeAfterPairs.sortOrder })
        .from(jobPhotoBeforeAfterPairs)
        .where(eq(jobPhotoBeforeAfterPairs.jobId, jobId))
        .orderBy(desc(jobPhotoBeforeAfterPairs.sortOrder))
        .limit(1);

      const nextSortOrder = (existingPairs[0]?.sortOrder ?? -1) + 1;

      const [pair] = await db.insert(jobPhotoBeforeAfterPairs).values({
        jobId,
        beforePhotoId: data.beforePhotoId,
        afterPhotoId: data.afterPhotoId,
        title: data.title || null,
        description: data.description || null,
        sortOrder: nextSortOrder
      }).returning();

      // Update photos to mark them as part of a pair
      await db
        .update(jobPhotos)
        .set({ isBeforeAfterPair: true, pairedPhotoId: data.afterPhotoId })
        .where(eq(jobPhotos.id, data.beforePhotoId));

      await db
        .update(jobPhotos)
        .set({ isBeforeAfterPair: true, pairedPhotoId: data.beforePhotoId })
        .where(eq(jobPhotos.id, data.afterPhotoId));

      logger.debug('Before/after pair created:', pair.id);

      return {
        id: pair.id,
        jobId: pair.jobId!,
        beforePhotoId: pair.beforePhotoId!,
        afterPhotoId: pair.afterPhotoId!,
        title: pair.title,
        description: pair.description,
        sortOrder: pair.sortOrder ?? 0,
        publishStatus: (pair.publishStatus as PhotoPublishStatus) || 'private',
        createdAt: pair.createdAt!,
        beforePhoto: this.formatResponse(beforePhoto),
        afterPhoto: this.formatResponse(afterPhoto)
      };
    } catch (error) {
      logger.error('Error creating before/after pair:', error);
      throw error;
    }
  }

  /**
   * Publish photos to gallery
   */
  static async publishPhotosToGallery(
    companyId: number,
    publishedByUserId: number,
    data: PublishPhotosDTO
  ): Promise<{ published: string[]; errors: string[] }> {
    try {
      logger.debug('Publishing photos to gallery:', data.photoIds);

      const published: string[] = [];
      const errors: string[] = [];

      for (const photoId of data.photoIds) {
        try {
          // Get the photo
          const [photo] = await db
            .select()
            .from(jobPhotos)
            .where(
              and(
                eq(jobPhotos.id, photoId),
                eq(jobPhotos.companyId, companyId)
              )
            );

          if (!photo) {
            errors.push(`Photo ${photoId} not found`);
            continue;
          }

          if (photo.publishStatus === 'published') {
            errors.push(`Photo ${photoId} is already published`);
            continue;
          }

          // Create gallery image
          const [galleryImage] = await db.insert(galleryImages).values({
            userId: publishedByUserId,
            companyId,
            title: photo.title,
            description: photo.description,
            altText: photo.altText,
            blobUrl: photo.blobUrl,
            blobPathname: photo.blobPathname,
            thumbnailUrl: photo.thumbnailUrl,
            category: data.category || null,
            status: 'active'
          }).returning();

          // Update photo publish status
          await db
            .update(jobPhotos)
            .set({
              publishStatus: 'published',
              publishedToGalleryId: galleryImage.id,
              publishedAt: new Date(),
              publishedByUserId,
              updatedAt: new Date()
            })
            .where(eq(jobPhotos.id, photoId));

          published.push(photoId);
        } catch (err) {
          logger.error(`Error publishing photo ${photoId}:`, err);
          errors.push(`Failed to publish photo ${photoId}`);
        }
      }

      logger.debug(`Published ${published.length} photos, ${errors.length} errors`);

      return { published, errors };
    } catch (error) {
      logger.error('Error publishing photos to gallery:', error);
      throw error;
    }
  }

  /**
   * Unpublish a photo from gallery
   */
  static async unpublishPhoto(
    photoId: string,
    companyId: number
  ): Promise<boolean> {
    try {
      logger.debug('Unpublishing photo:', photoId);

      const [photo] = await db
        .select()
        .from(jobPhotos)
        .where(
          and(
            eq(jobPhotos.id, photoId),
            eq(jobPhotos.companyId, companyId)
          )
        );

      if (!photo || photo.publishStatus !== 'published') {
        return false;
      }

      // Delete gallery image if it exists
      if (photo.publishedToGalleryId) {
        await db
          .delete(galleryImages)
          .where(eq(galleryImages.id, photo.publishedToGalleryId));
      }

      // Update photo
      await db
        .update(jobPhotos)
        .set({
          publishStatus: 'private',
          publishedToGalleryId: null,
          publishedAt: null,
          publishedByUserId: null,
          updatedAt: new Date()
        })
        .where(eq(jobPhotos.id, photoId));

      logger.debug('Photo unpublished:', photoId);

      return true;
    } catch (error) {
      logger.error('Error unpublishing photo:', error);
      throw error;
    }
  }

  /**
   * Format database record to response
   */
  private static formatResponse(photo: typeof jobPhotos.$inferSelect): JobPhotoDTO {
    return {
      id: photo.id,
      jobId: photo.jobId!,
      companyId: photo.companyId,
      uploadedByUserId: photo.uploadedByUserId,
      blobUrl: photo.blobUrl,
      blobPathname: photo.blobPathname,
      thumbnailUrl: photo.thumbnailUrl,
      title: photo.title,
      description: photo.description,
      altText: photo.altText,
      photoType: (photo.photoType as JobPhotoType) || 'other',
      isBeforeAfterPair: photo.isBeforeAfterPair ?? false,
      pairedPhotoId: photo.pairedPhotoId,
      sortOrder: photo.sortOrder ?? 0,
      isFeatured: photo.isFeatured ?? false,
      publishStatus: (photo.publishStatus as PhotoPublishStatus) || 'private',
      publishedToGalleryId: photo.publishedToGalleryId,
      publishedAt: photo.publishedAt,
      publishedByUserId: photo.publishedByUserId,
      fileSize: photo.fileSize,
      width: photo.width,
      height: photo.height,
      mimeType: photo.mimeType,
      aiTags: photo.aiTags as string[] | null,
      aiDescription: photo.aiDescription,
      takenAt: photo.takenAt,
      createdAt: photo.createdAt!,
      updatedAt: photo.updatedAt!
    };
  }
}
