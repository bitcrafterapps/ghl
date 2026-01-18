import { pgTable, serial, varchar, timestamp, text, boolean, jsonb, integer, index, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export type ThemeType = 'light' | 'dark' | 'system';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('firstName', { length: 255 }),
  lastName: varchar('lastName', { length: 255 }),
  password: varchar('password', { length: 255 }),
  roles: text('roles').array().$type<string[]>().default(['User']),
  emailNotify: boolean('emailNotify').default(true),
  smsNotify: boolean('smsNotify').default(false),
  phoneNumber: varchar('phoneNumber', { length: 20 }),
  theme: text('theme').notNull().default('dark'),
  status: varchar('status', { length: 20 }).default('active'),
  companyName: varchar('companyName', { length: 255 }),
  jobTitle: varchar('jobTitle', { length: 255 }),
  selectedPlan: varchar('selectedPlan', { length: 50 }),
  // Usage limits based on plan
  maxProjects: integer('max_projects').default(3),
  maxGenerations: integer('max_generations').default(20),
  // Git connection (encrypted tokens)
  gitConnection: jsonb('git_connection').$type<{
    provider: 'github' | 'gitlab';
    accessToken: string;    // Encrypted
    refreshToken?: string;  // Encrypted
    username: string;
    avatarUrl?: string;
    connectedAt: string;
  }>(),
  // Password reset fields
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  addressLine1: varchar('addressLine1', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 2 }).notNull(),
  zip: varchar('zip', { length: 10 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  size: varchar('size', { length: 50 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

export const companyUsers = pgTable('company_users', {
  id: serial('id').primaryKey(),
  companyId: serial('companyId').references(() => companies.id, { onDelete: 'cascade' }),
  userId: serial('userId').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  entityId: integer('entity_id').notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Email Templates table
export const emailTemplates = pgTable('email_templates', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Email Logs table
export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  templateKey: varchar('template_key', { length: 50 }),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  recipientUserId: integer('recipient_user_id').references(() => users.id, { onDelete: 'set null' }),
  subject: varchar('subject', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  resendId: varchar('resend_id', { length: 100 }),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow()
});

// ============================================
// Builder Tables
// ============================================

export type ProjectVisibility = 'private' | 'public';
export type ProjectStatus = 'Active' | 'Inactive' | 'Archived';
export type PrdStatus = 'draft' | 'interviewing' | 'review' | 'approved';
export type MessageRole = 'user' | 'assistant';
export type GenerationStatus = 'pending' | 'running' | 'completed' | 'failed';
export type DeploymentEnvironment = 'preview' | 'staging' | 'production';
export type DeploymentStatus = 'building' | 'deployed' | 'failed';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('Active').$type<ProjectStatus>(),
  visibility: varchar('visibility', { length: 20 }).notNull().default('private').$type<ProjectVisibility>(),
  techStack: jsonb('tech_stack').$type<string[]>().default([]),
  hostingPreference: varchar('hosting_preference', { length: 20 }).default('self-host'),
  // Git repository settings
  repoEnabled: boolean('repo_enabled').default(false),
  repoUrl: text('repo_url'),
  repoFullName: varchar('repo_full_name', { length: 255 }),
  repoVisibility: varchar('repo_visibility', { length: 10 }).default('private'),
  defaultBranch: varchar('default_branch', { length: 100 }).default('main'),
  useFeatureBranches: boolean('use_feature_branches').default(false),
  autoPushOnGenerate: boolean('auto_push_on_generate').default(false),
  lastPushAt: timestamp('last_push_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const prds = pgTable('prds', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  status: varchar('status', { length: 20 }).notNull().default('draft').$type<PrdStatus>(),
  sections: jsonb('sections'),
  interviewProgress: jsonb('interview_progress'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const prdMessages = pgTable('prd_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  prdId: uuid('prd_id').notNull().references(() => prds.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().$type<MessageRole>(),
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 50 }).default('interview'),
  changesApplied: jsonb('changes_applied'),
  createdAt: timestamp('created_at').defaultNow()
});

export const generations = pgTable('generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  prdId: uuid('prd_id').references(() => prds.id, { onDelete: 'set null' }),
  prompt: text('prompt').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending').$type<GenerationStatus>(),
  phases: jsonb('phases'),
  fileChanges: jsonb('file_changes'),
  tokenUsage: integer('token_usage').default(0),
  duration: integer('duration'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().$type<MessageRole>(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  projectCreatedIdx: index('chat_messages_project_created_idx').on(table.projectId, table.createdAt)
}));

export const deployments = pgTable('deployments', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  generationId: uuid('generation_id').references(() => generations.id, { onDelete: 'set null' }),
  provider: varchar('provider', { length: 50 }),
  environment: varchar('environment', { length: 20 }).notNull().default('preview').$type<DeploymentEnvironment>(),
  url: text('url'),
  status: varchar('status', { length: 20 }).notNull().default('building').$type<DeploymentStatus>(),
  logs: text('logs'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const pushHistory = pgTable('push_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  generationId: uuid('generation_id').references(() => generations.id, { onDelete: 'set null' }),
  commitSha: varchar('commit_sha', { length: 40 }).notNull(),
  commitMessage: text('commit_message').notNull(),
  branch: varchar('branch', { length: 100 }).notNull(),
  filesCount: integer('files_count').notNull().default(0),
  prUrl: text('pr_url'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  projectIdx: index('push_history_project_idx').on(table.projectId),
  commitShaIdx: index('push_history_commit_sha_idx').on(table.commitSha),
}));

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  siteName: varchar('site_name', { length: 255 }).default('Three Bears Platform'),
  siteUrl: varchar('site_url', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  maxProjectsPerUser: integer('max_projects_per_user').default(10),
  enableRegistration: boolean('enable_registration').default(true),
  requireEmailVerification: boolean('require_email_verification').default(true),
  
  // SEO Settings (JSONB for flexibility)
  seo: jsonb('seo').$type<{
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
    twitterHandle?: string;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    enableRobots?: boolean;
    enableSitemap?: boolean;
  }>().default({}),

  // LLM Settings (JSONB to store API keys securely - consider encryption in real app, but plain for now based on context)
  llm: jsonb('llm').$type<{
    openaiApiKey?: string;
    anthropicApiKey?: string;
    geminiApiKey?: string;
    openaiModel?: string;
    anthropicModel?: string;
    geminiModel?: string;
    providerChain?: string[];
  }>().default({}),

  // Git Provider Settings (single provider per instance)
  gitProvider: jsonb('git_provider').$type<{
    type: 'github' | 'gitlab';
    enabled: boolean;
    clientId: string;
    clientSecret: string;      // Encrypted
    instanceUrl?: string;      // For GH Enterprise / self-hosted GitLab
    defaultRepoVisibility: 'public' | 'private';
  }>(),

  // Google OAuth Settings (for Google Docs integration)
  googleOAuth: jsonb('google_oauth').$type<{
    enabled: boolean;
    clientId: string;
    clientSecret: string;
  }>(),

  // Payment Processor Settings (extensible for multiple providers)
  paymentProcessor: jsonb('payment_processor').$type<{
    enabled: boolean;
    provider: 'stripe' | 'square' | 'paypal' | 'braintree';
    testMode: boolean;
    defaultCurrency: string;
    // Provider-specific credentials stored as a flexible object
    credentials: {
      // Stripe
      stripePublishableKey?: string;
      stripeSecretKey?: string;
      stripeWebhookSecret?: string;
      // Square
      squareApplicationId?: string;
      squareAccessToken?: string;
      squareLocationId?: string;
      // PayPal
      paypalClientId?: string;
      paypalClientSecret?: string;
      // Braintree
      braintreeMerchantId?: string;
      braintreePublicKey?: string;
      braintreePrivateKey?: string;
    };
  }>(),

  updatedAt: timestamp('updated_at').defaultNow()
});

export const tokenUsage = pgTable('token_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  model: varchar('model', { length: 100 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),
  context: varchar('context', { length: 100 }), // e.g., 'agent-planning', 'generation-pipeline', 'chat'
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  userUsageIdx: index('token_usage_user_idx').on(table.userId),
  projectUsageIdx: index('token_usage_project_idx').on(table.projectId),
  createdAtIdx: index('token_usage_created_at_idx').on(table.createdAt)
}));

// ============================================
// Payment Transactions
// ============================================

export type TransactionStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
export type TransactionType = 'subscription' | 'one_time' | 'refund';

// ============================================
// Gallery & Reviews Types
// ============================================

export type GalleryImageStatus = 'active' | 'inactive' | 'pending';
export type ReviewStatus = 'published' | 'draft' | 'pending' | 'rejected';
export type ReviewSource = 'manual' | 'google' | 'yelp' | 'facebook';

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  // User association (nullable for guest checkouts if needed in future)
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  userEmail: varchar('user_email', { length: 255 }).notNull(),

  // Transaction details
  type: varchar('type', { length: 20 }).notNull().$type<TransactionType>(),
  status: varchar('status', { length: 20 }).notNull().default('pending').$type<TransactionStatus>(),

  // Payment provider info
  provider: varchar('provider', { length: 50 }).notNull(), // stripe, square, paypal, braintree
  providerTransactionId: varchar('provider_transaction_id', { length: 255 }), // External ID from provider
  providerCustomerId: varchar('provider_customer_id', { length: 255 }), // Customer ID from provider

  // Financial details
  amount: integer('amount').notNull(), // Amount in cents
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),

  // Plan/Product info
  planId: varchar('plan_id', { length: 50 }), // e.g., 'pro', 'enterprise'
  planName: varchar('plan_name', { length: 100 }), // e.g., 'Pro Plan'
  description: text('description'),

  // Card info (last 4 digits only, for display)
  cardLast4: varchar('card_last4', { length: 4 }),
  cardBrand: varchar('card_brand', { length: 20 }), // visa, mastercard, amex, etc.

  // Billing info
  billingName: varchar('billing_name', { length: 255 }),
  billingEmail: varchar('billing_email', { length: 255 }),

  // Metadata for additional info
  metadata: jsonb('metadata').$type<Record<string, any>>(),

  // Error tracking
  errorCode: varchar('error_code', { length: 100 }),
  errorMessage: text('error_message'),

  // Timestamps
  authorizedAt: timestamp('authorized_at'),
  capturedAt: timestamp('captured_at'),
  refundedAt: timestamp('refunded_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdx: index('transactions_user_idx').on(table.userId),
  statusIdx: index('transactions_status_idx').on(table.status),
  providerIdx: index('transactions_provider_idx').on(table.provider),
  createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
  providerTxnIdx: index('transactions_provider_txn_idx').on(table.providerTransactionId)
}));

// ============================================
// Gallery Images
// ============================================

export const galleryImages = pgTable('gallery_images', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),

  // Image metadata
  title: varchar('title', { length: 255 }),
  description: text('description'),
  altText: varchar('alt_text', { length: 255 }),

  // Vercel Blob storage reference
  blobUrl: text('blob_url').notNull(),
  blobPathname: varchar('blob_pathname', { length: 500 }),
  blobContentType: varchar('blob_content_type', { length: 100 }),
  blobSize: integer('blob_size'),

  // Thumbnail (optional resized version)
  thumbnailUrl: text('thumbnail_url'),

  // Organization
  category: varchar('category', { length: 100 }),
  tags: text('tags').array().$type<string[]>().default([]),
  sortOrder: integer('sort_order').default(0),

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<GalleryImageStatus>(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  
  // Site Scoping
  siteId: uuid('site_id'),
}, (table) => ({
  companyIdx: index('gallery_images_company_idx').on(table.companyId),
  categoryIdx: index('gallery_images_category_idx').on(table.category),
  statusIdx: index('gallery_images_status_idx').on(table.status),
  sortOrderIdx: index('gallery_images_sort_order_idx').on(table.sortOrder),
  siteIdIdx: index('gallery_images_site_id_idx').on(table.siteId)
}));

// ============================================
// Reviews / Testimonials
// ============================================

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),

  // Site scoping for multi-tenant support
  siteId: uuid('site_id'),

  // Reviewer info
  reviewerName: varchar('reviewer_name', { length: 255 }).notNull(),
  reviewerLocation: varchar('reviewer_location', { length: 255 }),
  reviewerEmail: varchar('reviewer_email', { length: 255 }),

  // Review content
  text: text('text').notNull(),
  rating: integer('rating').notNull().default(5),
  service: varchar('service', { length: 255 }),

  // Source tracking
  source: varchar('source', { length: 50 }).default('manual').$type<ReviewSource>(),
  externalId: varchar('external_id', { length: 255 }),

  // Google Business integration
  googleReviewId: varchar('google_review_id', { length: 255 }),
  googlePostedAt: timestamp('google_posted_at'),

  // Display settings
  featured: boolean('featured').default(false),
  sortOrder: integer('sort_order').default(0),

  // Status
  status: varchar('status', { length: 20 }).default('published').$type<ReviewStatus>(),

  // Timestamps
  reviewDate: timestamp('review_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  companyIdx: index('reviews_company_idx').on(table.companyId),
  siteIdx: index('reviews_site_idx').on(table.siteId),
  ratingIdx: index('reviews_rating_idx').on(table.rating),
  statusIdx: index('reviews_status_idx').on(table.status),
  sourceIdx: index('reviews_source_idx').on(table.source),
  featuredIdx: index('reviews_featured_idx').on(table.featured)
}));

// ============================================
// Contacts (Local + GHL Sync Ready)
// ============================================

export type ContactStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type ContactSource = 'website_form' | 'phone_call' | 'referral' | 'ghl_sync' | 'manual' | 'other';

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  
  // GHL Integration (future)
  ghlContactId: varchar('ghl_contact_id', { length: 100 }),
  syncWithGhl: boolean('sync_with_ghl').default(false),
  lastGhlSync: timestamp('last_ghl_sync'),
  
  // Core contact info
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  phoneSecondary: varchar('phone_secondary', { length: 30 }),
  
  // Address
  addressLine1: varchar('address_line1', { length: 255 }),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zip: varchar('zip', { length: 20 }),
  country: varchar('country', { length: 50 }).default('USA'),
  
  // Business info
  contactCompanyName: varchar('contact_company_name', { length: 255 }),
  contactJobTitle: varchar('contact_job_title', { length: 100 }),
  
  // Status & tracking
  status: varchar('status', { length: 30 }).default('new').$type<ContactStatus>(),
  source: varchar('source', { length: 50 }).default('manual').$type<ContactSource>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  customFields: jsonb('custom_fields').$type<Record<string, any>>(),
  
  // Notes
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  companyIdx: index('contacts_company_idx').on(table.companyId),
  ghlIdIdx: index('contacts_ghl_id_idx').on(table.ghlContactId),
  statusIdx: index('contacts_status_idx').on(table.status),
  emailIdx: index('contacts_email_idx').on(table.email)
}));

// ============================================
// Contact Activities
// ============================================

export type ContactActivityType = 'note' | 'call' | 'email' | 'meeting' | 'form_submit' | 'status_change' | 'job_created';

export const contactActivities = pgTable('contact_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  type: varchar('type', { length: 50 }).notNull().$type<ContactActivityType>(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  contactIdx: index('contact_activities_contact_idx').on(table.contactId),
  typeIdx: index('contact_activities_type_idx').on(table.type)
}));

// ============================================
// Calendar Events (Local + GHL Sync Ready)
// ============================================

export type CalendarEventType = 'appointment' | 'estimate' | 'job_scheduled' | 'follow_up' | 'meeting' | 'other';
export type CalendarEventStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  
  // GHL Integration (future)
  ghlCalendarId: varchar('ghl_calendar_id', { length: 100 }),
  ghlEventId: varchar('ghl_event_id', { length: 100 }),
  syncWithGhl: boolean('sync_with_ghl').default(false),
  lastGhlSync: timestamp('last_ghl_sync'),
  
  // Event details
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  eventType: varchar('event_type', { length: 50 }).default('appointment').$type<CalendarEventType>(),
  status: varchar('status', { length: 30 }).default('scheduled').$type<CalendarEventStatus>(),
  
  // Timing
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  allDay: boolean('all_day').default(false),
  timezone: varchar('timezone', { length: 50 }).default('America/Los_Angeles'),
  
  // Recurrence (iCal RRULE support)
  recurrenceRule: varchar('recurrence_rule', { length: 255 }),
  recurrenceEndDate: timestamp('recurrence_end_date'),
  parentEventId: uuid('parent_event_id'),
  isRecurringInstance: boolean('is_recurring_instance').default(false),
  originalStartTime: timestamp('original_start_time'),
  
  // Location
  location: varchar('location', { length: 255 }),
  locationAddress: text('location_address'),
  isVirtual: boolean('is_virtual').default(false),
  virtualMeetingUrl: text('virtual_meeting_url'),
  
  // Links
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  jobId: uuid('job_id'),  // Will reference jobs table
  assignedUserId: integer('assigned_user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // Reminders
  reminderMinutes: integer('reminder_minutes').default(30),
  reminderSent: boolean('reminder_sent').default(false),
  
  // Styling
  color: varchar('color', { length: 7 }).default('#3B82F6'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  companyIdx: index('calendar_events_company_idx').on(table.companyId),
  contactIdx: index('calendar_events_contact_idx').on(table.contactId),
  jobIdx: index('calendar_events_job_idx').on(table.jobId),
  startTimeIdx: index('calendar_events_start_time_idx').on(table.startTime),
  statusIdx: index('calendar_events_status_idx').on(table.status)
}));

// ============================================
// Jobs / Work Orders
// ============================================

export type JobStatus = 'lead' | 'quoted' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'invoiced' | 'paid' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  
  // Job identifiers
  jobNumber: varchar('job_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  // Status & priority
  status: varchar('status', { length: 30 }).default('lead').$type<JobStatus>(),
  priority: varchar('priority', { length: 20 }).default('normal').$type<JobPriority>(),
  
  // Links
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  assignedUserId: integer('assigned_user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // Service info
  serviceType: varchar('service_type', { length: 100 }),
  serviceCategory: varchar('service_category', { length: 100 }),
  
  // Location (job site)
  siteAddressLine1: varchar('site_address_line1', { length: 255 }),
  siteAddressLine2: varchar('site_address_line2', { length: 255 }),
  siteCity: varchar('site_city', { length: 100 }),
  siteState: varchar('site_state', { length: 50 }),
  siteZip: varchar('site_zip', { length: 20 }),
  
  // Financial
  estimatedAmount: integer('estimated_amount'), // in cents
  quotedAmount: integer('quoted_amount'),       // in cents
  finalAmount: integer('final_amount'),         // in cents
  currency: varchar('currency', { length: 3 }).default('USD'),
  
  // Scheduling
  scheduledDate: timestamp('scheduled_date'),
  estimatedDuration: integer('estimated_duration'), // in minutes
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  
  // Notes
  internalNotes: text('internal_notes'),
  customerNotes: text('customer_notes'),
  
  // Metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  customFields: jsonb('custom_fields').$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  companyIdx: index('jobs_company_idx').on(table.companyId),
  contactIdx: index('jobs_contact_idx').on(table.contactId),
  statusIdx: index('jobs_status_idx').on(table.status),
  jobNumberIdx: uniqueIndex('jobs_job_number_idx').on(table.companyId, table.jobNumber),
  scheduledDateIdx: index('jobs_scheduled_date_idx').on(table.scheduledDate)
}));

// ============================================
// Job Activities / Timeline
// ============================================

export type JobActivityType = 'note' | 'status_change' | 'assignment' | 'quote_sent' | 'payment_received' | 'photo_added' | 'schedule_change';

export const jobActivities = pgTable('job_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  type: varchar('type', { length: 50 }).notNull().$type<JobActivityType>(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  jobIdx: index('job_activities_job_idx').on(table.jobId),
  typeIdx: index('job_activities_type_idx').on(table.type)
}));

// ============================================
// Service Contracts
// ============================================

export type ContractStatus = 'draft' | 'pending' | 'active' | 'paused' | 'expired' | 'cancelled' | 'pending_renewal';
export type ContractFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';

export const serviceContracts = pgTable('service_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  parentJobId: uuid('parent_job_id').references(() => jobs.id, { onDelete: 'set null' }),
  
  // Contract details
  contractNumber: varchar('contract_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  // Status
  status: varchar('status', { length: 30 }).default('draft').$type<ContractStatus>(),
  
  // Service details
  serviceType: varchar('service_type', { length: 100 }),
  serviceDescription: text('service_description'),
  
  // Financial
  amount: integer('amount').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).default('USD'),
  billingFrequency: varchar('frequency', { length: 30 }).default('monthly').$type<ContractFrequency>(),
  serviceFrequency: varchar('service_frequency', { length: 30 }).default('monthly').$type<ContractFrequency>(),
  
  // Duration
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').default(false),
  
  // Terms
  terms: text('terms'),
  
  // Scheduling
  nextServiceDate: timestamp('next_service_date'),
  preferredDayOfWeek: integer('preferred_day_of_week'), // 0-6 (Sunday-Saturday)
  preferredTimeSlot: varchar('preferred_time_slot', { length: 50 }), // 'morning', 'afternoon', 'evening'
  
  // Metadata
  customFields: jsonb('custom_fields').$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  companyIdx: index('service_contracts_company_idx').on(table.companyId),
  contactIdx: index('service_contracts_contact_idx').on(table.contactId),
  statusIdx: index('service_contracts_status_idx').on(table.status),
  contractNumberIdx: uniqueIndex('service_contracts_number_idx').on(table.companyId, table.contractNumber)
}));

// ============================================
// Job Photos (with Gallery Publishing)
// ============================================

export type JobPhotoType = 'before' | 'during' | 'after' | 'detail' | 'issue' | 'materials' | 'other';
export type PhotoPublishStatus = 'private' | 'pending_review' | 'published' | 'rejected';

export const jobPhotos = pgTable('job_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  uploadedByUserId: integer('uploaded_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // Image storage (Vercel Blob)
  blobUrl: text('blob_url').notNull(),
  blobPathname: varchar('blob_pathname', { length: 500 }),
  thumbnailUrl: text('thumbnail_url'),
  
  // Metadata
  title: varchar('title', { length: 255 }),
  description: text('description'),
  altText: varchar('alt_text', { length: 255 }),
  photoType: varchar('photo_type', { length: 30 }).default('other').$type<JobPhotoType>(),
  
  // Before/After pairing
  isBeforeAfterPair: boolean('is_before_after_pair').default(false),
  pairedPhotoId: uuid('paired_photo_id'),
  
  // Ordering
  sortOrder: integer('sort_order').default(0),
  isFeatured: boolean('is_featured').default(false),
  
  // Gallery Publishing
  publishStatus: varchar('publish_status', { length: 30 }).default('private').$type<PhotoPublishStatus>(),
  publishedToGalleryId: integer('published_to_gallery_id').references(() => galleryImages.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at'),
  publishedByUserId: integer('published_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // Technical metadata
  fileSize: integer('file_size'),
  width: integer('width'),
  height: integer('height'),
  mimeType: varchar('mime_type', { length: 50 }),
  
  // AI-generated (future)
  aiTags: jsonb('ai_tags').$type<string[]>(),
  aiDescription: text('ai_description'),
  
  // Timestamps
  takenAt: timestamp('taken_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  jobIdx: index('job_photos_job_idx').on(table.jobId),
  companyIdx: index('job_photos_company_idx').on(table.companyId),
  publishStatusIdx: index('job_photos_publish_status_idx').on(table.publishStatus),
  photoTypeIdx: index('job_photos_type_idx').on(table.photoType),
  sortOrderIdx: index('job_photos_sort_order_idx').on(table.jobId, table.sortOrder)
}));

// Before/After photo pairs
export const jobPhotoBeforeAfterPairs = pgTable('job_photo_before_after_pairs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
  beforePhotoId: uuid('before_photo_id').references(() => jobPhotos.id, { onDelete: 'cascade' }),
  afterPhotoId: uuid('after_photo_id').references(() => jobPhotos.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  publishStatus: varchar('publish_status', { length: 30 }).default('private').$type<PhotoPublishStatus>(),
  createdAt: timestamp('created_at').defaultNow()
});

// ============================================
// Notifications
// ============================================

export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type NotificationTrigger = 'event_reminder' | 'job_status_change' | 'new_job_assigned' | 'contract_renewal_due' | 'contact_follow_up';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  trigger: varchar('trigger', { length: 50 }).notNull().$type<NotificationTrigger>(),
  entityType: varchar('entity_type', { length: 30 }),
  entityId: uuid('entity_id'),
  
  type: varchar('type', { length: 20 }).notNull().$type<NotificationType>(),
  status: varchar('status', { length: 20 }).default('pending').$type<NotificationStatus>(),
  
  subject: varchar('subject', { length: 255 }),
  body: text('body').notNull(),
  
  recipientEmail: varchar('recipient_email', { length: 255 }),
  recipientPhone: varchar('recipient_phone', { length: 30 }),
  
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  
  providerMessageId: varchar('provider_message_id', { length: 255 }),
  errorMessage: text('error_message'),
  
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  statusIdx: index('notifications_status_idx').on(table.status),
  scheduledIdx: index('notifications_scheduled_idx').on(table.scheduledFor)
}));

// Notification preferences per user
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  eventReminder: jsonb('event_reminder').$type<{ email: boolean; sms: boolean; minutesBefore: number }>(),
  jobStatusChange: jsonb('job_status_change').$type<{ email: boolean; sms: boolean }>(),
  newJobAssigned: jsonb('new_job_assigned').$type<{ email: boolean; sms: boolean }>(),
  contractRenewalDue: jsonb('contract_renewal_due').$type<{ email: boolean; sms: boolean; daysBefore: number }>(),
  
  quietHoursStart: varchar('quiet_hours_start', { length: 5 }),
  quietHoursEnd: varchar('quiet_hours_end', { length: 5 }),
  timezone: varchar('timezone', { length: 50 }).default('America/Los_Angeles'),
  
  updatedAt: timestamp('updated_at').defaultNow()
});

// ============================================
// Audit Logs
// ============================================

export type AuditAction = 'create' | 'update' | 'delete' | 'status_change' | 'assignment' | 'export' | 'import';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  entityName: varchar('entity_name', { length: 255 }),
  
  action: varchar('action', { length: 30 }).notNull().$type<AuditAction>(),
  
  previousValues: jsonb('previous_values').$type<Record<string, any>>(),
  newValues: jsonb('new_values').$type<Record<string, any>>(),
  changedFields: jsonb('changed_fields').$type<string[]>(),
  
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  companyIdx: index('audit_logs_company_idx').on(table.companyId),
  entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  userIdx: index('audit_logs_user_idx').on(table.userId),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt)
}));

// ============================================
// Exports & Imports
// ============================================

export type ExportFormat = 'csv' | 'xlsx' | 'json';
export type ExportImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export const dataExports = pgTable('data_exports', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  format: varchar('format', { length: 10 }).notNull().$type<ExportFormat>(),
  status: varchar('status', { length: 20 }).default('pending').$type<ExportImportStatus>(),
  
  filters: jsonb('filters').$type<Record<string, any>>(),
  
  fileName: varchar('file_name', { length: 255 }),
  fileUrl: text('file_url'),
  fileSize: integer('file_size'),
  rowCount: integer('row_count'),
  
  errorMessage: text('error_message'),
  
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at'),
  
  createdAt: timestamp('created_at').defaultNow()
});

export const dataImports = pgTable('data_imports', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').$type<ExportImportStatus>(),
  
  originalFileName: varchar('original_file_name', { length: 255 }),
  fileUrl: text('file_url'),
  
  totalRows: integer('total_rows'),
  successCount: integer('success_count'),
  errorCount: integer('error_count'),
  errors: jsonb('errors').$type<Array<{ row: number; field: string; message: string }>>(),
  
  updateExisting: boolean('update_existing').default(false),
  dryRun: boolean('dry_run').default(false),
  
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export const serviceContractsRelations = relations(serviceContracts, ({ one }) => ({
  contact: one(contacts),
}));