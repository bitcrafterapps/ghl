"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryImageService = void 0;
const blob_1 = require("@vercel/blob");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const logger_1 = require("../logger");
const drizzle_orm_1 = require("drizzle-orm");
const activity_service_1 = require("./activity.service");
const logger = logger_1.LoggerFactory.getLogger('GalleryImageService');
class GalleryImageService {
    /**
     * Upload an image to Vercel Blob storage and create database record
     */
    static uploadImage(file, filename, contentType, metadata, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                logger.debug('Uploading image to Vercel Blob:', filename);
                // Upload to Vercel Blob
                const blob = yield (0, blob_1.put)(`gallery/${Date.now()}-${filename}`, file, {
                    access: 'public',
                    contentType,
                });
                logger.debug('Blob upload successful:', blob.url);
                // Create database record
                const [image] = yield db_1.db.insert(schema_1.galleryImages).values({
                    userId: actorUserId || null,
                    companyId: metadata.companyId || null,
                    title: metadata.title || filename,
                    description: metadata.description || null,
                    altText: metadata.altText || metadata.title || filename,
                    blobUrl: blob.url,
                    blobPathname: blob.pathname,
                    blobContentType: contentType,
                    blobSize: file.length,
                    category: metadata.category || null,
                    tags: metadata.tags || [],
                    sortOrder: (_a = metadata.sortOrder) !== null && _a !== void 0 ? _a : 0,
                    status: metadata.status || 'active',
                }).returning();
                // Log activity
                if (actorUserId) {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'gallery',
                        action: 'created',
                        title: `Gallery Image: ${image.title || filename}`,
                        entityId: image.id,
                        userId: actorUserId
                    });
                }
                logger.debug('Gallery image created successfully:', image.id);
                return this.formatResponse(image);
            }
            catch (error) {
                logger.error('Error uploading gallery image:', error);
                throw error;
            }
        });
    }
    /**
     * Get all gallery images with optional filtering
     */
    static getImages() {
        return __awaiter(this, arguments, void 0, function* (params = {}) {
            try {
                logger.debug('Fetching gallery images with params:', params);
                const conditions = [];
                if (params.category) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.galleryImages.category, params.category));
                }
                if (params.status) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.galleryImages.status, params.status));
                }
                if (params.companyId) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.galleryImages.companyId, params.companyId));
                }
                let query = db_1.db.select().from(schema_1.galleryImages);
                if (conditions.length > 0) {
                    query = query.where((0, drizzle_orm_1.and)(...conditions));
                }
                query = query.orderBy((0, drizzle_orm_1.asc)(schema_1.galleryImages.sortOrder), (0, drizzle_orm_1.desc)(schema_1.galleryImages.createdAt));
                if (params.limit) {
                    query = query.limit(params.limit);
                }
                if (params.offset) {
                    query = query.offset(params.offset);
                }
                const images = yield query;
                logger.debug(`Retrieved ${images.length} gallery images`);
                return images.map(this.formatResponse);
            }
            catch (error) {
                logger.error('Error fetching gallery images:', error);
                throw error;
            }
        });
    }
    /**
     * Get a single gallery image by ID
     */
    static getImageById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [image] = yield db_1.db.select().from(schema_1.galleryImages).where((0, drizzle_orm_1.eq)(schema_1.galleryImages.id, id));
                if (!image) {
                    return null;
                }
                return this.formatResponse(image);
            }
            catch (error) {
                logger.error('Error fetching gallery image by ID:', error);
                throw error;
            }
        });
    }
    /**
     * Update gallery image metadata
     */
    static updateImage(id, data, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug('Updating gallery image:', id);
                const updateData = {
                    updatedAt: new Date()
                };
                if (data.title !== undefined)
                    updateData.title = data.title;
                if (data.description !== undefined)
                    updateData.description = data.description;
                if (data.altText !== undefined)
                    updateData.altText = data.altText;
                if (data.category !== undefined)
                    updateData.category = data.category;
                if (data.tags !== undefined)
                    updateData.tags = data.tags;
                if (data.sortOrder !== undefined)
                    updateData.sortOrder = data.sortOrder;
                if (data.status !== undefined)
                    updateData.status = data.status;
                const [updated] = yield db_1.db
                    .update(schema_1.galleryImages)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.galleryImages.id, id))
                    .returning();
                if (!updated) {
                    return null;
                }
                // Log activity
                if (actorUserId) {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'gallery',
                        action: 'updated',
                        title: `Gallery Image: ${updated.title}`,
                        entityId: updated.id,
                        userId: actorUserId
                    });
                }
                logger.debug('Gallery image updated successfully:', id);
                return this.formatResponse(updated);
            }
            catch (error) {
                logger.error('Error updating gallery image:', error);
                throw error;
            }
        });
    }
    /**
     * Delete a gallery image (removes from Blob storage and database)
     */
    static deleteImage(id, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug('Deleting gallery image:', id);
                // Get the image first
                const [image] = yield db_1.db.select().from(schema_1.galleryImages).where((0, drizzle_orm_1.eq)(schema_1.galleryImages.id, id));
                if (!image) {
                    return false;
                }
                // Delete from Vercel Blob
                if (image.blobUrl) {
                    try {
                        yield (0, blob_1.del)(image.blobUrl);
                        logger.debug('Deleted blob:', image.blobUrl);
                    }
                    catch (blobError) {
                        logger.warn('Failed to delete blob (may not exist):', blobError);
                    }
                }
                // Delete from database
                const [deleted] = yield db_1.db.delete(schema_1.galleryImages).where((0, drizzle_orm_1.eq)(schema_1.galleryImages.id, id)).returning();
                // Log activity
                if (actorUserId && deleted) {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'gallery',
                        action: 'deleted',
                        title: `Gallery Image: ${image.title}`,
                        entityId: id,
                        userId: actorUserId
                    });
                }
                logger.debug('Gallery image deleted successfully:', id);
                return !!deleted;
            }
            catch (error) {
                logger.error('Error deleting gallery image:', error);
                throw error;
            }
        });
    }
    /**
     * Bulk update image sort order
     */
    static reorderImages(data, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug('Reordering gallery images:', data.images.length);
                for (const item of data.images) {
                    yield db_1.db
                        .update(schema_1.galleryImages)
                        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                        .where((0, drizzle_orm_1.eq)(schema_1.galleryImages.id, item.id));
                }
                // Log activity
                if (actorUserId) {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'gallery',
                        action: 'updated',
                        title: `Reordered ${data.images.length} gallery images`,
                        entityId: 0,
                        userId: actorUserId
                    });
                }
                logger.debug('Gallery images reordered successfully');
            }
            catch (error) {
                logger.error('Error reordering gallery images:', error);
                throw error;
            }
        });
    }
    /**
     * Bulk delete images
     */
    static bulkDelete(ids, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug('Bulk deleting gallery images:', ids.length);
                let deletedCount = 0;
                for (const id of ids) {
                    const success = yield this.deleteImage(id, actorUserId);
                    if (success)
                        deletedCount++;
                }
                logger.debug(`Bulk deleted ${deletedCount} images`);
                return deletedCount;
            }
            catch (error) {
                logger.error('Error bulk deleting gallery images:', error);
                throw error;
            }
        });
    }
    /**
     * Get distinct categories
     */
    static getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield db_1.db
                    .selectDistinct({ category: schema_1.galleryImages.category })
                    .from(schema_1.galleryImages)
                    .where((0, drizzle_orm_1.sql) `${schema_1.galleryImages.category} IS NOT NULL`);
                return results.map(r => r.category).filter((c) => c !== null);
            }
            catch (error) {
                logger.error('Error fetching categories:', error);
                throw error;
            }
        });
    }
    /**
     * Format database record to response
     */
    static formatResponse(image) {
        var _a;
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
            sortOrder: (_a = image.sortOrder) !== null && _a !== void 0 ? _a : 0,
            status: image.status || 'active',
            createdAt: image.createdAt,
            updatedAt: image.updatedAt
        };
    }
}
exports.GalleryImageService = GalleryImageService;
