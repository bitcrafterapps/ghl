// Job Photo Types
export type PhotoType = 'before' | 'after' | 'progress' | 'completed' | 'issue' | 'materials' | 'other';

export interface JobPhoto {
  id: string;
  jobId: string;
  companyId: number;
  
  // Photo Details
  blobUrl: string;
  thumbnailUrl?: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  
  // Metadata
  photoType: PhotoType;
  title?: string;
  description?: string;
  caption?: string;
  
  // Ordering
  sortOrder: number;
  
  // Before/After Pair
  beforeAfterId?: string;
  
  // Gallery Publishing
  publishedToGallery?: boolean;
  galleryImageId?: number;
  publishedAt?: Date | string;
  
  // Location
  latitude?: number;
  longitude?: number;
  
  // Timestamps
  takenAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Relations
  job?: {
    id: string;
    title: string;
    jobNumber: string;
  };
}

export interface BeforeAfterPair {
  id: string;
  jobId: string;
  beforePhotoId: string;
  afterPhotoId: string;
  title?: string;
  description?: string;
  publishedToGallery?: boolean;
  sortOrder: number;
  createdAt: Date | string;
  
  beforePhoto?: JobPhoto;
  afterPhoto?: JobPhoto;
}

export interface CreateJobPhotoDTO {
  jobId: string;
  photoType?: PhotoType;
  title?: string;
  description?: string;
  caption?: string;
  sortOrder?: number;
}

export interface UpdateJobPhotoDTO {
  photoType?: PhotoType;
  title?: string;
  description?: string;
  caption?: string;
  sortOrder?: number;
}

export interface PhotoFilters {
  jobId?: string;
  photoType?: PhotoType;
  publishedToGallery?: boolean;
}

// Photo Type Colors
export const PHOTO_TYPE_COLORS: Record<PhotoType, { bg: string; text: string; border: string; label: string }> = {
  before: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Before' },
  after: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'After' },
  progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Progress' },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Completed' },
  issue: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Issue' },
  materials: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Materials' },
  other: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Other' },
};
