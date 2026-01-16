// ============================================
// Private Pages Types
// Contacts, Calendar, Jobs, Service Contracts
// ============================================

import type {
  ContactStatus,
  ContactSource,
  ContactActivityType,
  CalendarEventType,
  CalendarEventStatus,
  JobStatus,
  JobPriority,
  JobActivityType,
  ContractStatus,
  ContractFrequency,
  JobPhotoType,
  PhotoPublishStatus,
  NotificationType,
  NotificationStatus,
  NotificationTrigger,
  AuditAction,
  ExportFormat,
  ExportImportStatus
} from '../db/schema';

// ============================================
// Pagination
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Contact Types
// ============================================

export interface ContactDTO {
  id: string;
  companyId: number | null;
  ghlContactId?: string | null;
  syncWithGhl: boolean;
  lastGhlSync?: Date | null;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneSecondary?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  contactCompanyName?: string | null;
  contactJobTitle?: string | null;
  status: ContactStatus;
  source: ContactSource;
  tags: string[];
  customFields?: Record<string, any> | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactDTO {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  contactCompanyName?: string;
  contactJobTitle?: string;
  status?: ContactStatus;
  source?: ContactSource;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
}

export interface UpdateContactDTO extends Partial<CreateContactDTO> {}

export interface ContactFilters {
  search?: string;
  status?: ContactStatus | ContactStatus[];
  source?: ContactSource | ContactSource[];
  tags?: string[];
  companyId?: number;
}

export interface ContactActivityDTO {
  id: string;
  contactId: string;
  userId: number | null;
  type: ContactActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface CreateContactActivityDTO {
  type: ContactActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

// ============================================
// Calendar Types
// ============================================

export interface CalendarEventDTO {
  id: string;
  companyId: number | null;
  ghlCalendarId?: string | null;
  ghlEventId?: string | null;
  syncWithGhl: boolean;
  title: string;
  description?: string | null;
  eventType: CalendarEventType;
  status: CalendarEventStatus;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  timezone: string;
  recurrenceRule?: string | null;
  recurrenceEndDate?: Date | null;
  parentEventId?: string | null;
  isRecurringInstance: boolean;
  location?: string | null;
  locationAddress?: string | null;
  isVirtual: boolean;
  virtualMeetingUrl?: string | null;
  contactId?: string | null;
  jobId?: string | null;
  assignedUserId?: number | null;
  reminderMinutes: number;
  reminderSent: boolean;
  color: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  // Joined fields
  contact?: Pick<ContactDTO, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'> | null;
  assignedUser?: { id: number; firstName: string | null; lastName: string | null } | null;
}

export interface CreateCalendarEventDTO {
  title: string;
  description?: string;
  eventType?: CalendarEventType;
  status?: CalendarEventStatus;
  startTime: Date | string;
  endTime: Date | string;
  allDay?: boolean;
  timezone?: string;
  recurrence?: RecurrenceConfig;
  location?: string;
  locationAddress?: string;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;
  contactId?: string;
  jobId?: string;
  assignedUserId?: number;
  reminderMinutes?: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCalendarEventDTO extends Partial<CreateCalendarEventDTO> {}

export interface CalendarEventFilters {
  startDate: Date | string;
  endDate: Date | string;
  eventType?: CalendarEventType | CalendarEventType[];
  status?: CalendarEventStatus | CalendarEventStatus[];
  contactId?: string;
  jobId?: string;
  assignedUserId?: number;
  expand?: boolean; // Expand recurring events
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[]; // 0-6 for weekly
  dayOfMonth?: number;   // 1-31 for monthly
  endType: 'never' | 'after_count' | 'on_date';
  occurrences?: number;
  endDate?: Date | string;
}

export type RecurrenceScope = 'single' | 'future' | 'all';

// ============================================
// Job Types
// ============================================

export interface JobDTO {
  id: string;
  companyId: number | null;
  jobNumber: string;
  title: string;
  description?: string | null;
  status: JobStatus;
  priority: JobPriority;
  contactId?: string | null;
  assignedUserId?: number | null;
  serviceType?: string | null;
  serviceCategory?: string | null;
  siteAddressLine1?: string | null;
  siteAddressLine2?: string | null;
  siteCity?: string | null;
  siteState?: string | null;
  siteZip?: string | null;
  estimatedAmount?: number | null;
  quotedAmount?: number | null;
  finalAmount?: number | null;
  currency: string;
  scheduledDate?: Date | null;
  estimatedDuration?: number | null;
  actualStartTime?: Date | null;
  actualEndTime?: Date | null;
  internalNotes?: string | null;
  customerNotes?: string | null;
  tags: string[];
  customFields?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  // Joined fields
  contact?: Pick<ContactDTO, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'> | null;
  assignedUser?: { id: number; firstName: string | null; lastName: string | null } | null;
  photoCount?: number;
}

export interface CreateJobDTO {
  title: string;
  description?: string;
  status?: JobStatus;
  priority?: JobPriority;
  contactId?: string;
  assignedUserId?: number;
  serviceType?: string;
  serviceCategory?: string;
  siteAddressLine1?: string;
  siteAddressLine2?: string;
  siteCity?: string;
  siteState?: string;
  siteZip?: string;
  estimatedAmount?: number;
  quotedAmount?: number;
  finalAmount?: number;
  currency?: string;
  scheduledDate?: Date | string;
  estimatedDuration?: number;
  internalNotes?: string;
  customerNotes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> {}

export interface JobFilters {
  search?: string;
  status?: JobStatus | JobStatus[];
  priority?: JobPriority | JobPriority[];
  contactId?: string;
  assignedUserId?: number;
  serviceType?: string;
  serviceCategory?: string;
  scheduledDateStart?: Date | string;
  scheduledDateEnd?: Date | string;
  tags?: string[];
  companyId?: number;
}

export interface JobActivityDTO {
  id: string;
  jobId: string;
  userId: number | null;
  type: JobActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface CreateJobActivityDTO {
  type: JobActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface JobKanbanResponse {
  columns: {
    status: JobStatus;
    label: string;
    jobs: JobDTO[];
    count: number;
  }[];
}

// ============================================
// Service Contract Types
// ============================================

export interface ServiceContractDTO {
  id: string;
  companyId: number | null;
  contactId?: string | null;
  parentJobId?: string | null;
  contractNumber: string;
  title: string;
  description?: string | null;
  status: ContractStatus;
  serviceType?: string | null;
  serviceDescription?: string | null;
  amount: number;
  currency: string;
  frequency: ContractFrequency;
  startDate: Date;
  endDate?: Date | null;
  autoRenew: boolean;
  terms?: string | null;
  nextServiceDate?: Date | null;
  preferredDayOfWeek?: number | null;
  preferredTimeSlot?: string | null;
  customFields?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  // Joined fields
  contact?: Pick<ContactDTO, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'> | null;
}

export interface CreateServiceContractDTO {
  contactId?: string;
  parentJobId?: string;
  title: string;
  description?: string;
  status?: ContractStatus;
  serviceType?: string;
  serviceDescription?: string;
  amount: number;
  currency?: string;
  frequency?: ContractFrequency;
  startDate: Date | string;
  endDate?: Date | string;
  autoRenew?: boolean;
  terms?: string;
  nextServiceDate?: Date | string;
  preferredDayOfWeek?: number;
  preferredTimeSlot?: string;
  customFields?: Record<string, any>;
}

export interface UpdateServiceContractDTO extends Partial<CreateServiceContractDTO> {}

export interface ServiceContractFilters extends PaginationParams {
  status?: ContractStatus | ContractStatus[];
  contactId?: string;
  frequency?: ContractFrequency;
  serviceType?: string;
  startDateStart?: Date | string;
  startDateEnd?: Date | string;
  companyId?: number;
  search?: string;
  expiringWithinDays?: number;
}

// ============================================
// Job Photo Types
// ============================================

export interface JobPhotoDTO {
  id: string;
  jobId: string;
  companyId: number | null;
  uploadedByUserId?: number | null;
  blobUrl: string;
  blobPathname?: string | null;
  thumbnailUrl?: string | null;
  title?: string | null;
  description?: string | null;
  altText?: string | null;
  photoType: JobPhotoType;
  isBeforeAfterPair: boolean;
  pairedPhotoId?: string | null;
  sortOrder: number;
  isFeatured: boolean;
  publishStatus: PhotoPublishStatus;
  publishedToGalleryId?: number | null;
  publishedAt?: Date | null;
  publishedByUserId?: number | null;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  aiTags?: string[] | null;
  aiDescription?: string | null;
  takenAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Joined
  uploadedBy?: { id: number; firstName: string | null; lastName: string | null } | null;
}

export interface CreateJobPhotoDTO {
  blobUrl: string;
  blobPathname?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  altText?: string;
  photoType?: JobPhotoType;
  sortOrder?: number;
  isFeatured?: boolean;
  fileSize?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  takenAt?: Date | string;
}

export interface UpdateJobPhotoDTO extends Partial<CreateJobPhotoDTO> {}

export interface PublishPhotosDTO {
  photoIds: string[];
  category?: string;
  serviceSlug?: string;
}

export interface BeforeAfterPairDTO {
  id: string;
  jobId: string;
  beforePhotoId: string;
  afterPhotoId: string;
  title?: string | null;
  description?: string | null;
  sortOrder: number;
  publishStatus: PhotoPublishStatus;
  createdAt: Date;
  beforePhoto?: JobPhotoDTO;
  afterPhoto?: JobPhotoDTO;
}

export interface CreateBeforeAfterPairDTO {
  beforePhotoId: string;
  afterPhotoId: string;
  title?: string;
  description?: string;
}

// ============================================
// Error Codes
// ============================================

export const ERROR_CODES = {
  // Contacts
  CONTACT_NOT_FOUND: 'CONTACT_NOT_FOUND',
  CONTACT_CREATE_FAILED: 'CONTACT_CREATE_FAILED',
  CONTACT_UPDATE_FAILED: 'CONTACT_UPDATE_FAILED',
  CONTACT_DELETE_FAILED: 'CONTACT_DELETE_FAILED',
  CONTACT_DUPLICATE_EMAIL: 'CONTACT_DUPLICATE_EMAIL',
  
  // Jobs
  JOB_NOT_FOUND: 'JOB_NOT_FOUND',
  JOB_CREATE_FAILED: 'JOB_CREATE_FAILED',
  JOB_UPDATE_FAILED: 'JOB_UPDATE_FAILED',
  JOB_DELETE_FAILED: 'JOB_DELETE_FAILED',
  JOB_NUMBER_EXISTS: 'JOB_NUMBER_EXISTS',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  
  // Calendar
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  EVENT_CREATE_FAILED: 'EVENT_CREATE_FAILED',
  EVENT_UPDATE_FAILED: 'EVENT_UPDATE_FAILED',
  EVENT_DELETE_FAILED: 'EVENT_DELETE_FAILED',
  EVENT_TIME_CONFLICT: 'EVENT_TIME_CONFLICT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  
  // Contracts
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  CONTRACT_CREATE_FAILED: 'CONTRACT_CREATE_FAILED',
  CONTRACT_UPDATE_FAILED: 'CONTRACT_UPDATE_FAILED',
  CONTRACT_DELETE_FAILED: 'CONTRACT_DELETE_FAILED',
  CONTRACT_NUMBER_EXISTS: 'CONTRACT_NUMBER_EXISTS',
  
  // Photos
  PHOTO_NOT_FOUND: 'PHOTO_NOT_FOUND',
  PHOTO_UPLOAD_FAILED: 'PHOTO_UPLOAD_FAILED',
  PHOTO_UPDATE_FAILED: 'PHOTO_UPDATE_FAILED',
  PHOTO_DELETE_FAILED: 'PHOTO_DELETE_FAILED',
  PHOTO_PUBLISH_FAILED: 'PHOTO_PUBLISH_FAILED',
  PHOTO_UNPUBLISH_FAILED: 'PHOTO_UNPUBLISH_FAILED',
  PHOTO_ALREADY_PUBLISHED: 'PHOTO_ALREADY_PUBLISHED',
  INVALID_BEFORE_AFTER_PAIR: 'INVALID_BEFORE_AFTER_PAIR',
  
  // General
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
