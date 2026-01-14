import { GalleryImageStatus } from '../db/schema';

export type { GalleryImageStatus };

// Create DTO for uploading a new image
export interface GalleryImageCreateDto {
  title?: string;
  description?: string;
  altText?: string;
  category?: string;
  tags?: string[];
  sortOrder?: number;
  status?: GalleryImageStatus;
  companyId?: number;
}

// Update DTO
export interface GalleryImageUpdateDto {
  title?: string;
  description?: string;
  altText?: string;
  category?: string;
  tags?: string[];
  sortOrder?: number;
  status?: GalleryImageStatus;
}

// Response type for gallery images
export interface GalleryImageResponse {
  id: number;
  userId: number | null;
  companyId: number | null;
  title: string | null;
  description: string | null;
  altText: string | null;
  blobUrl: string;
  blobPathname: string | null;
  blobContentType: string | null;
  blobSize: number | null;
  thumbnailUrl: string | null;
  category: string | null;
  tags: string[];
  sortOrder: number;
  status: GalleryImageStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Vercel Blob upload result
export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

// Bulk operations
export interface GalleryImageBulkUpdateDto {
  ids: number[];
  status?: GalleryImageStatus;
  category?: string;
}

export interface GalleryImageReorderDto {
  images: { id: number; sortOrder: number }[];
}

// Query parameters
export interface GalleryImageQueryParams {
  category?: string;
  status?: GalleryImageStatus;
  companyId?: number;
  limit?: number;
  offset?: number;
}
