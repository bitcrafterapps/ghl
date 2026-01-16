"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceContractsRelations = exports.dataImports = exports.dataExports = exports.auditLogs = exports.notificationPreferences = exports.notifications = exports.jobPhotoBeforeAfterPairs = exports.jobPhotos = exports.serviceContracts = exports.jobActivities = exports.jobs = exports.calendarEvents = exports.contactActivities = exports.contacts = exports.reviews = exports.galleryImages = exports.transactions = exports.tokenUsage = exports.siteSettings = exports.pushHistory = exports.deployments = exports.chatMessages = exports.generations = exports.prdMessages = exports.prds = exports.projects = exports.emailLogs = exports.emailTemplates = exports.activityLog = exports.companyUsers = exports.companies = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    firstName: (0, pg_core_1.varchar)('firstName', { length: 255 }),
    lastName: (0, pg_core_1.varchar)('lastName', { length: 255 }),
    password: (0, pg_core_1.varchar)('password', { length: 255 }),
    roles: (0, pg_core_1.text)('roles').array().$type().default(['User']),
    emailNotify: (0, pg_core_1.boolean)('emailNotify').default(true),
    smsNotify: (0, pg_core_1.boolean)('smsNotify').default(false),
    phoneNumber: (0, pg_core_1.varchar)('phoneNumber', { length: 20 }),
    theme: (0, pg_core_1.text)('theme').notNull().default('dark'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('active'),
    companyName: (0, pg_core_1.varchar)('companyName', { length: 255 }),
    jobTitle: (0, pg_core_1.varchar)('jobTitle', { length: 255 }),
    selectedPlan: (0, pg_core_1.varchar)('selectedPlan', { length: 50 }),
    // Usage limits based on plan
    maxProjects: (0, pg_core_1.integer)('max_projects').default(3),
    maxGenerations: (0, pg_core_1.integer)('max_generations').default(20),
    // Git connection (encrypted tokens)
    gitConnection: (0, pg_core_1.jsonb)('git_connection').$type(),
    // Password reset fields
    resetPasswordToken: (0, pg_core_1.varchar)('reset_password_token', { length: 255 }),
    resetPasswordExpires: (0, pg_core_1.timestamp)('reset_password_expires'),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow()
});
exports.companies = (0, pg_core_1.pgTable)('companies', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    addressLine1: (0, pg_core_1.varchar)('addressLine1', { length: 255 }).notNull(),
    city: (0, pg_core_1.varchar)('city', { length: 255 }).notNull(),
    state: (0, pg_core_1.varchar)('state', { length: 2 }).notNull(),
    zip: (0, pg_core_1.varchar)('zip', { length: 10 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }).notNull(),
    industry: (0, pg_core_1.varchar)('industry', { length: 100 }),
    size: (0, pg_core_1.varchar)('size', { length: 50 }),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow()
});
exports.companyUsers = (0, pg_core_1.pgTable)('company_users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    companyId: (0, pg_core_1.serial)('companyId').references(() => exports.companies.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.serial)('userId').references(() => exports.users.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow()
});
exports.activityLog = (0, pg_core_1.pgTable)('activity_log', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    action: (0, pg_core_1.varchar)('action', { length: 50 }).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    entityId: (0, pg_core_1.integer)('entity_id').notNull(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    isRead: (0, pg_core_1.boolean)('is_read').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
// Email Templates table
exports.emailTemplates = (0, pg_core_1.pgTable)('email_templates', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    key: (0, pg_core_1.varchar)('key', { length: 50 }).unique().notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    subject: (0, pg_core_1.varchar)('subject', { length: 255 }).notNull(),
    body: (0, pg_core_1.text)('body').notNull(),
    enabled: (0, pg_core_1.boolean)('enabled').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Email Logs table
exports.emailLogs = (0, pg_core_1.pgTable)('email_logs', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    templateKey: (0, pg_core_1.varchar)('template_key', { length: 50 }),
    recipientEmail: (0, pg_core_1.varchar)('recipient_email', { length: 255 }).notNull(),
    recipientUserId: (0, pg_core_1.integer)('recipient_user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    subject: (0, pg_core_1.varchar)('subject', { length: 255 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'),
    resendId: (0, pg_core_1.varchar)('resend_id', { length: 100 }),
    error: (0, pg_core_1.text)('error'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.projects = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'set null' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('Active').$type(),
    visibility: (0, pg_core_1.varchar)('visibility', { length: 20 }).notNull().default('private').$type(),
    techStack: (0, pg_core_1.jsonb)('tech_stack').$type().default([]),
    hostingPreference: (0, pg_core_1.varchar)('hosting_preference', { length: 20 }).default('self-host'),
    // Git repository settings
    repoEnabled: (0, pg_core_1.boolean)('repo_enabled').default(false),
    repoUrl: (0, pg_core_1.text)('repo_url'),
    repoFullName: (0, pg_core_1.varchar)('repo_full_name', { length: 255 }),
    repoVisibility: (0, pg_core_1.varchar)('repo_visibility', { length: 10 }).default('private'),
    defaultBranch: (0, pg_core_1.varchar)('default_branch', { length: 100 }).default('main'),
    useFeatureBranches: (0, pg_core_1.boolean)('use_feature_branches').default(false),
    autoPushOnGenerate: (0, pg_core_1.boolean)('auto_push_on_generate').default(false),
    lastPushAt: (0, pg_core_1.timestamp)('last_push_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.prds = (0, pg_core_1.pgTable)('prds', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id, { onDelete: 'cascade' }),
    version: (0, pg_core_1.integer)('version').notNull().default(1),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('draft').$type(),
    sections: (0, pg_core_1.jsonb)('sections'),
    interviewProgress: (0, pg_core_1.jsonb)('interview_progress'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.prdMessages = (0, pg_core_1.pgTable)('prd_messages', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    prdId: (0, pg_core_1.uuid)('prd_id').notNull().references(() => exports.prds.id, { onDelete: 'cascade' }),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).notNull().$type(),
    content: (0, pg_core_1.text)('content').notNull(),
    messageType: (0, pg_core_1.varchar)('message_type', { length: 50 }).default('interview'),
    changesApplied: (0, pg_core_1.jsonb)('changes_applied'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.generations = (0, pg_core_1.pgTable)('generations', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    prdId: (0, pg_core_1.uuid)('prd_id').references(() => exports.prds.id, { onDelete: 'set null' }),
    prompt: (0, pg_core_1.text)('prompt').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending').$type(),
    phases: (0, pg_core_1.jsonb)('phases'),
    fileChanges: (0, pg_core_1.jsonb)('file_changes'),
    tokenUsage: (0, pg_core_1.integer)('token_usage').default(0),
    duration: (0, pg_core_1.integer)('duration'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.chatMessages = (0, pg_core_1.pgTable)('chat_messages', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id, { onDelete: 'cascade' }),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).notNull().$type(),
    content: (0, pg_core_1.text)('content').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
}, (table) => ({
    projectCreatedIdx: (0, pg_core_1.index)('chat_messages_project_created_idx').on(table.projectId, table.createdAt)
}));
exports.deployments = (0, pg_core_1.pgTable)('deployments', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id, { onDelete: 'cascade' }),
    generationId: (0, pg_core_1.uuid)('generation_id').references(() => exports.generations.id, { onDelete: 'set null' }),
    provider: (0, pg_core_1.varchar)('provider', { length: 50 }),
    environment: (0, pg_core_1.varchar)('environment', { length: 20 }).notNull().default('preview').$type(),
    url: (0, pg_core_1.text)('url'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('building').$type(),
    logs: (0, pg_core_1.text)('logs'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.pushHistory = (0, pg_core_1.pgTable)('push_history', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    generationId: (0, pg_core_1.uuid)('generation_id').references(() => exports.generations.id, { onDelete: 'set null' }),
    commitSha: (0, pg_core_1.varchar)('commit_sha', { length: 40 }).notNull(),
    commitMessage: (0, pg_core_1.text)('commit_message').notNull(),
    branch: (0, pg_core_1.varchar)('branch', { length: 100 }).notNull(),
    filesCount: (0, pg_core_1.integer)('files_count').notNull().default(0),
    prUrl: (0, pg_core_1.text)('pr_url'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
}, (table) => ({
    projectIdx: (0, pg_core_1.index)('push_history_project_idx').on(table.projectId),
    commitShaIdx: (0, pg_core_1.index)('push_history_commit_sha_idx').on(table.commitSha),
}));
exports.siteSettings = (0, pg_core_1.pgTable)('site_settings', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    siteName: (0, pg_core_1.varchar)('site_name', { length: 255 }).default('Three Bears Platform'),
    siteUrl: (0, pg_core_1.varchar)('site_url', { length: 255 }),
    contactEmail: (0, pg_core_1.varchar)('contact_email', { length: 255 }),
    maxProjectsPerUser: (0, pg_core_1.integer)('max_projects_per_user').default(10),
    enableRegistration: (0, pg_core_1.boolean)('enable_registration').default(true),
    requireEmailVerification: (0, pg_core_1.boolean)('require_email_verification').default(true),
    // SEO Settings (JSONB for flexibility)
    seo: (0, pg_core_1.jsonb)('seo').$type().default({}),
    // LLM Settings (JSONB to store API keys securely - consider encryption in real app, but plain for now based on context)
    llm: (0, pg_core_1.jsonb)('llm').$type().default({}),
    // Git Provider Settings (single provider per instance)
    gitProvider: (0, pg_core_1.jsonb)('git_provider').$type(),
    // Google OAuth Settings (for Google Docs integration)
    googleOAuth: (0, pg_core_1.jsonb)('google_oauth').$type(),
    // Payment Processor Settings (extensible for multiple providers)
    paymentProcessor: (0, pg_core_1.jsonb)('payment_processor').$type(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.tokenUsage = (0, pg_core_1.pgTable)('token_usage', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    projectId: (0, pg_core_1.uuid)('project_id').references(() => exports.projects.id, { onDelete: 'set null' }),
    model: (0, pg_core_1.varchar)('model', { length: 100 }).notNull(),
    provider: (0, pg_core_1.varchar)('provider', { length: 50 }).notNull(),
    inputTokens: (0, pg_core_1.integer)('input_tokens').default(0),
    outputTokens: (0, pg_core_1.integer)('output_tokens').default(0),
    totalTokens: (0, pg_core_1.integer)('total_tokens').default(0),
    context: (0, pg_core_1.varchar)('context', { length: 100 }), // e.g., 'agent-planning', 'generation-pipeline', 'chat'
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
}, (table) => ({
    userUsageIdx: (0, pg_core_1.index)('token_usage_user_idx').on(table.userId),
    projectUsageIdx: (0, pg_core_1.index)('token_usage_project_idx').on(table.projectId),
    createdAtIdx: (0, pg_core_1.index)('token_usage_created_at_idx').on(table.createdAt)
}));
exports.transactions = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    // User association (nullable for guest checkouts if needed in future)
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    userEmail: (0, pg_core_1.varchar)('user_email', { length: 255 }).notNull(),
    // Transaction details
    type: (0, pg_core_1.varchar)('type', { length: 20 }).notNull().$type(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending').$type(),
    // Payment provider info
    provider: (0, pg_core_1.varchar)('provider', { length: 50 }).notNull(), // stripe, square, paypal, braintree
    providerTransactionId: (0, pg_core_1.varchar)('provider_transaction_id', { length: 255 }), // External ID from provider
    providerCustomerId: (0, pg_core_1.varchar)('provider_customer_id', { length: 255 }), // Customer ID from provider
    // Financial details
    amount: (0, pg_core_1.integer)('amount').notNull(), // Amount in cents
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).notNull().default('USD'),
    // Plan/Product info
    planId: (0, pg_core_1.varchar)('plan_id', { length: 50 }), // e.g., 'pro', 'enterprise'
    planName: (0, pg_core_1.varchar)('plan_name', { length: 100 }), // e.g., 'Pro Plan'
    description: (0, pg_core_1.text)('description'),
    // Card info (last 4 digits only, for display)
    cardLast4: (0, pg_core_1.varchar)('card_last4', { length: 4 }),
    cardBrand: (0, pg_core_1.varchar)('card_brand', { length: 20 }), // visa, mastercard, amex, etc.
    // Billing info
    billingName: (0, pg_core_1.varchar)('billing_name', { length: 255 }),
    billingEmail: (0, pg_core_1.varchar)('billing_email', { length: 255 }),
    // Metadata for additional info
    metadata: (0, pg_core_1.jsonb)('metadata').$type(),
    // Error tracking
    errorCode: (0, pg_core_1.varchar)('error_code', { length: 100 }),
    errorMessage: (0, pg_core_1.text)('error_message'),
    // Timestamps
    authorizedAt: (0, pg_core_1.timestamp)('authorized_at'),
    capturedAt: (0, pg_core_1.timestamp)('captured_at'),
    refundedAt: (0, pg_core_1.timestamp)('refunded_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    userIdx: (0, pg_core_1.index)('transactions_user_idx').on(table.userId),
    statusIdx: (0, pg_core_1.index)('transactions_status_idx').on(table.status),
    providerIdx: (0, pg_core_1.index)('transactions_provider_idx').on(table.provider),
    createdAtIdx: (0, pg_core_1.index)('transactions_created_at_idx').on(table.createdAt),
    providerTxnIdx: (0, pg_core_1.index)('transactions_provider_txn_idx').on(table.providerTransactionId)
}));
// ============================================
// Gallery Images
// ============================================
exports.galleryImages = (0, pg_core_1.pgTable)('gallery_images', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    // Image metadata
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    description: (0, pg_core_1.text)('description'),
    altText: (0, pg_core_1.varchar)('alt_text', { length: 255 }),
    // Vercel Blob storage reference
    blobUrl: (0, pg_core_1.text)('blob_url').notNull(),
    blobPathname: (0, pg_core_1.varchar)('blob_pathname', { length: 500 }),
    blobContentType: (0, pg_core_1.varchar)('blob_content_type', { length: 100 }),
    blobSize: (0, pg_core_1.integer)('blob_size'),
    // Thumbnail (optional resized version)
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    // Organization
    category: (0, pg_core_1.varchar)('category', { length: 100 }),
    tags: (0, pg_core_1.text)('tags').array().$type().default([]),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    // Status
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('active').$type(),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    companyIdx: (0, pg_core_1.index)('gallery_images_company_idx').on(table.companyId),
    categoryIdx: (0, pg_core_1.index)('gallery_images_category_idx').on(table.category),
    statusIdx: (0, pg_core_1.index)('gallery_images_status_idx').on(table.status),
    sortOrderIdx: (0, pg_core_1.index)('gallery_images_sort_order_idx').on(table.sortOrder)
}));
// ============================================
// Reviews / Testimonials
// ============================================
exports.reviews = (0, pg_core_1.pgTable)('reviews', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    // Reviewer info
    reviewerName: (0, pg_core_1.varchar)('reviewer_name', { length: 255 }).notNull(),
    reviewerLocation: (0, pg_core_1.varchar)('reviewer_location', { length: 255 }),
    reviewerEmail: (0, pg_core_1.varchar)('reviewer_email', { length: 255 }),
    // Review content
    text: (0, pg_core_1.text)('text').notNull(),
    rating: (0, pg_core_1.integer)('rating').notNull().default(5),
    service: (0, pg_core_1.varchar)('service', { length: 255 }),
    // Source tracking
    source: (0, pg_core_1.varchar)('source', { length: 50 }).default('manual').$type(),
    externalId: (0, pg_core_1.varchar)('external_id', { length: 255 }),
    // Google Business integration
    googleReviewId: (0, pg_core_1.varchar)('google_review_id', { length: 255 }),
    googlePostedAt: (0, pg_core_1.timestamp)('google_posted_at'),
    // Display settings
    featured: (0, pg_core_1.boolean)('featured').default(false),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    // Status
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('published').$type(),
    // Timestamps
    reviewDate: (0, pg_core_1.timestamp)('review_date').defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    companyIdx: (0, pg_core_1.index)('reviews_company_idx').on(table.companyId),
    ratingIdx: (0, pg_core_1.index)('reviews_rating_idx').on(table.rating),
    statusIdx: (0, pg_core_1.index)('reviews_status_idx').on(table.status),
    sourceIdx: (0, pg_core_1.index)('reviews_source_idx').on(table.source),
    featuredIdx: (0, pg_core_1.index)('reviews_featured_idx').on(table.featured)
}));
exports.contacts = (0, pg_core_1.pgTable)('contacts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    // GHL Integration (future)
    ghlContactId: (0, pg_core_1.varchar)('ghl_contact_id', { length: 100 }),
    syncWithGhl: (0, pg_core_1.boolean)('sync_with_ghl').default(false),
    lastGhlSync: (0, pg_core_1.timestamp)('last_ghl_sync'),
    // Core contact info
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }).notNull(),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 30 }),
    phoneSecondary: (0, pg_core_1.varchar)('phone_secondary', { length: 30 }),
    // Address
    addressLine1: (0, pg_core_1.varchar)('address_line1', { length: 255 }),
    addressLine2: (0, pg_core_1.varchar)('address_line2', { length: 255 }),
    city: (0, pg_core_1.varchar)('city', { length: 100 }),
    state: (0, pg_core_1.varchar)('state', { length: 50 }),
    zip: (0, pg_core_1.varchar)('zip', { length: 20 }),
    country: (0, pg_core_1.varchar)('country', { length: 50 }).default('USA'),
    // Business info
    contactCompanyName: (0, pg_core_1.varchar)('contact_company_name', { length: 255 }),
    contactJobTitle: (0, pg_core_1.varchar)('contact_job_title', { length: 100 }),
    // Status & tracking
    status: (0, pg_core_1.varchar)('status', { length: 30 }).default('new').$type(),
    source: (0, pg_core_1.varchar)('source', { length: 50 }).default('manual').$type(),
    tags: (0, pg_core_1.jsonb)('tags').$type().default([]),
    customFields: (0, pg_core_1.jsonb)('custom_fields').$type(),
    // Notes
    notes: (0, pg_core_1.text)('notes'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    companyIdx: (0, pg_core_1.index)('contacts_company_idx').on(table.companyId),
    ghlIdIdx: (0, pg_core_1.index)('contacts_ghl_id_idx').on(table.ghlContactId),
    statusIdx: (0, pg_core_1.index)('contacts_status_idx').on(table.status),
    emailIdx: (0, pg_core_1.index)('contacts_email_idx').on(table.email)
}));
exports.contactActivities = (0, pg_core_1.pgTable)('contact_activities', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    contactId: (0, pg_core_1.uuid)('contact_id').references(() => exports.contacts.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull().$type(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    metadata: (0, pg_core_1.jsonb)('metadata').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
}, (table) => ({
    contactIdx: (0, pg_core_1.index)('contact_activities_contact_idx').on(table.contactId),
    typeIdx: (0, pg_core_1.index)('contact_activities_type_idx').on(table.type)
}));
exports.calendarEvents = (0, pg_core_1.pgTable)('calendar_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    // GHL Integration (future)
    ghlCalendarId: (0, pg_core_1.varchar)('ghl_calendar_id', { length: 100 }),
    ghlEventId: (0, pg_core_1.varchar)('ghl_event_id', { length: 100 }),
    syncWithGhl: (0, pg_core_1.boolean)('sync_with_ghl').default(false),
    lastGhlSync: (0, pg_core_1.timestamp)('last_ghl_sync'),
    // Event details
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    eventType: (0, pg_core_1.varchar)('event_type', { length: 50 }).default('appointment').$type(),
    status: (0, pg_core_1.varchar)('status', { length: 30 }).default('scheduled').$type(),
    // Timing
    startTime: (0, pg_core_1.timestamp)('start_time').notNull(),
    endTime: (0, pg_core_1.timestamp)('end_time').notNull(),
    allDay: (0, pg_core_1.boolean)('all_day').default(false),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 50 }).default('America/Los_Angeles'),
    // Recurrence (iCal RRULE support)
    recurrenceRule: (0, pg_core_1.varchar)('recurrence_rule', { length: 255 }),
    recurrenceEndDate: (0, pg_core_1.timestamp)('recurrence_end_date'),
    parentEventId: (0, pg_core_1.uuid)('parent_event_id'),
    isRecurringInstance: (0, pg_core_1.boolean)('is_recurring_instance').default(false),
    originalStartTime: (0, pg_core_1.timestamp)('original_start_time'),
    // Location
    location: (0, pg_core_1.varchar)('location', { length: 255 }),
    locationAddress: (0, pg_core_1.text)('location_address'),
    isVirtual: (0, pg_core_1.boolean)('is_virtual').default(false),
    virtualMeetingUrl: (0, pg_core_1.text)('virtual_meeting_url'),
    // Links
    contactId: (0, pg_core_1.uuid)('contact_id').references(() => exports.contacts.id, { onDelete: 'set null' }),
    jobId: (0, pg_core_1.uuid)('job_id'), // Will reference jobs table
    assignedUserId: (0, pg_core_1.integer)('assigned_user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    // Reminders
    reminderMinutes: (0, pg_core_1.integer)('reminder_minutes').default(30),
    reminderSent: (0, pg_core_1.boolean)('reminder_sent').default(false),
    // Styling
    color: (0, pg_core_1.varchar)('color', { length: 7 }).default('#3B82F6'),
    // Metadata
    metadata: (0, pg_core_1.jsonb)('metadata').$type(),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    companyIdx: (0, pg_core_1.index)('calendar_events_company_idx').on(table.companyId),
    contactIdx: (0, pg_core_1.index)('calendar_events_contact_idx').on(table.contactId),
    jobIdx: (0, pg_core_1.index)('calendar_events_job_idx').on(table.jobId),
    startTimeIdx: (0, pg_core_1.index)('calendar_events_start_time_idx').on(table.startTime),
    statusIdx: (0, pg_core_1.index)('calendar_events_status_idx').on(table.status)
}));
exports.jobs = (0, pg_core_1.pgTable)('jobs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    // Job identifiers
    jobNumber: (0, pg_core_1.varchar)('job_number', { length: 50 }).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    // Status & priority
    status: (0, pg_core_1.varchar)('status', { length: 30 }).default('lead').$type(),
    priority: (0, pg_core_1.varchar)('priority', { length: 20 }).default('normal').$type(),
    // Links
    contactId: (0, pg_core_1.uuid)('contact_id').references(() => exports.contacts.id, { onDelete: 'set null' }),
    assignedUserId: (0, pg_core_1.integer)('assigned_user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    // Service info
    serviceType: (0, pg_core_1.varchar)('service_type', { length: 100 }),
    serviceCategory: (0, pg_core_1.varchar)('service_category', { length: 100 }),
    // Location (job site)
    siteAddressLine1: (0, pg_core_1.varchar)('site_address_line1', { length: 255 }),
    siteAddressLine2: (0, pg_core_1.varchar)('site_address_line2', { length: 255 }),
    siteCity: (0, pg_core_1.varchar)('site_city', { length: 100 }),
    siteState: (0, pg_core_1.varchar)('site_state', { length: 50 }),
    siteZip: (0, pg_core_1.varchar)('site_zip', { length: 20 }),
    // Financial
    estimatedAmount: (0, pg_core_1.integer)('estimated_amount'), // in cents
    quotedAmount: (0, pg_core_1.integer)('quoted_amount'), // in cents
    finalAmount: (0, pg_core_1.integer)('final_amount'), // in cents
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('USD'),
    // Scheduling
    scheduledDate: (0, pg_core_1.timestamp)('scheduled_date'),
    estimatedDuration: (0, pg_core_1.integer)('estimated_duration'), // in minutes
    actualStartTime: (0, pg_core_1.timestamp)('actual_start_time'),
    actualEndTime: (0, pg_core_1.timestamp)('actual_end_time'),
    // Notes
    internalNotes: (0, pg_core_1.text)('internal_notes'),
    customerNotes: (0, pg_core_1.text)('customer_notes'),
    // Metadata
    tags: (0, pg_core_1.jsonb)('tags').$type().default([]),
    customFields: (0, pg_core_1.jsonb)('custom_fields').$type(),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    companyIdx: (0, pg_core_1.index)('jobs_company_idx').on(table.companyId),
    contactIdx: (0, pg_core_1.index)('jobs_contact_idx').on(table.contactId),
    statusIdx: (0, pg_core_1.index)('jobs_status_idx').on(table.status),
    jobNumberIdx: (0, pg_core_1.uniqueIndex)('jobs_job_number_idx').on(table.companyId, table.jobNumber),
    scheduledDateIdx: (0, pg_core_1.index)('jobs_scheduled_date_idx').on(table.scheduledDate)
}));
exports.jobActivities = (0, pg_core_1.pgTable)('job_activities', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull().$type(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    metadata: (0, pg_core_1.jsonb)('metadata').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
}, (table) => ({
    jobIdx: (0, pg_core_1.index)('job_activities_job_idx').on(table.jobId),
    typeIdx: (0, pg_core_1.index)('job_activities_type_idx').on(table.type)
}));
exports.serviceContracts = (0, pg_core_1.pgTable)('service_contracts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    contactId: (0, pg_core_1.uuid)('contact_id').references(() => exports.contacts.id, { onDelete: 'set null' }),
    parentJobId: (0, pg_core_1.uuid)('parent_job_id').references(() => exports.jobs.id, { onDelete: 'set null' }),
    // Contract details
    contractNumber: (0, pg_core_1.varchar)('contract_number', { length: 50 }).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    // Status
    status: (0, pg_core_1.varchar)('status', { length: 30 }).default('draft').$type(),
    // Service details
    serviceType: (0, pg_core_1.varchar)('service_type', { length: 100 }),
    serviceDescription: (0, pg_core_1.text)('service_description'),
    // Financial
    amount: (0, pg_core_1.integer)('amount').notNull(), // in cents
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('USD'),
    frequency: (0, pg_core_1.varchar)('frequency', { length: 30 }).default('monthly').$type(),
    // Duration
    startDate: (0, pg_core_1.timestamp)('start_date').notNull(),
    endDate: (0, pg_core_1.timestamp)('end_date'),
    autoRenew: (0, pg_core_1.boolean)('auto_renew').default(false),
    // Terms
    terms: (0, pg_core_1.text)('terms'),
    // Scheduling
    nextServiceDate: (0, pg_core_1.timestamp)('next_service_date'),
    preferredDayOfWeek: (0, pg_core_1.integer)('preferred_day_of_week'), // 0-6 (Sunday-Saturday)
    preferredTimeSlot: (0, pg_core_1.varchar)('preferred_time_slot', { length: 50 }), // 'morning', 'afternoon', 'evening'
    // Metadata
    customFields: (0, pg_core_1.jsonb)('custom_fields').$type(),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    companyIdx: (0, pg_core_1.index)('service_contracts_company_idx').on(table.companyId),
    contactIdx: (0, pg_core_1.index)('service_contracts_contact_idx').on(table.contactId),
    statusIdx: (0, pg_core_1.index)('service_contracts_status_idx').on(table.status),
    contractNumberIdx: (0, pg_core_1.uniqueIndex)('service_contracts_number_idx').on(table.companyId, table.contractNumber)
}));
exports.jobPhotos = (0, pg_core_1.pgTable)('job_photos', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id, { onDelete: 'cascade' }),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    uploadedByUserId: (0, pg_core_1.integer)('uploaded_by_user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    // Image storage (Vercel Blob)
    blobUrl: (0, pg_core_1.text)('blob_url').notNull(),
    blobPathname: (0, pg_core_1.varchar)('blob_pathname', { length: 500 }),
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    // Metadata
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    description: (0, pg_core_1.text)('description'),
    altText: (0, pg_core_1.varchar)('alt_text', { length: 255 }),
    photoType: (0, pg_core_1.varchar)('photo_type', { length: 30 }).default('other').$type(),
    // Before/After pairing
    isBeforeAfterPair: (0, pg_core_1.boolean)('is_before_after_pair').default(false),
    pairedPhotoId: (0, pg_core_1.uuid)('paired_photo_id'),
    // Ordering
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    isFeatured: (0, pg_core_1.boolean)('is_featured').default(false),
    // Gallery Publishing
    publishStatus: (0, pg_core_1.varchar)('publish_status', { length: 30 }).default('private').$type(),
    publishedToGalleryId: (0, pg_core_1.integer)('published_to_gallery_id').references(() => exports.galleryImages.id, { onDelete: 'set null' }),
    publishedAt: (0, pg_core_1.timestamp)('published_at'),
    publishedByUserId: (0, pg_core_1.integer)('published_by_user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    // Technical metadata
    fileSize: (0, pg_core_1.integer)('file_size'),
    width: (0, pg_core_1.integer)('width'),
    height: (0, pg_core_1.integer)('height'),
    mimeType: (0, pg_core_1.varchar)('mime_type', { length: 50 }),
    // AI-generated (future)
    aiTags: (0, pg_core_1.jsonb)('ai_tags').$type(),
    aiDescription: (0, pg_core_1.text)('ai_description'),
    // Timestamps
    takenAt: (0, pg_core_1.timestamp)('taken_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
}, (table) => ({
    jobIdx: (0, pg_core_1.index)('job_photos_job_idx').on(table.jobId),
    companyIdx: (0, pg_core_1.index)('job_photos_company_idx').on(table.companyId),
    publishStatusIdx: (0, pg_core_1.index)('job_photos_publish_status_idx').on(table.publishStatus),
    photoTypeIdx: (0, pg_core_1.index)('job_photos_type_idx').on(table.photoType),
    sortOrderIdx: (0, pg_core_1.index)('job_photos_sort_order_idx').on(table.jobId, table.sortOrder)
}));
// Before/After photo pairs
exports.jobPhotoBeforeAfterPairs = (0, pg_core_1.pgTable)('job_photo_before_after_pairs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id, { onDelete: 'cascade' }),
    beforePhotoId: (0, pg_core_1.uuid)('before_photo_id').references(() => exports.jobPhotos.id, { onDelete: 'cascade' }),
    afterPhotoId: (0, pg_core_1.uuid)('after_photo_id').references(() => exports.jobPhotos.id, { onDelete: 'cascade' }),
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    description: (0, pg_core_1.text)('description'),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    publishStatus: (0, pg_core_1.varchar)('publish_status', { length: 30 }).default('private').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    trigger: (0, pg_core_1.varchar)('trigger', { length: 50 }).notNull().$type(),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 30 }),
    entityId: (0, pg_core_1.uuid)('entity_id'),
    type: (0, pg_core_1.varchar)('type', { length: 20 }).notNull().$type(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('pending').$type(),
    subject: (0, pg_core_1.varchar)('subject', { length: 255 }),
    body: (0, pg_core_1.text)('body').notNull(),
    recipientEmail: (0, pg_core_1.varchar)('recipient_email', { length: 255 }),
    recipientPhone: (0, pg_core_1.varchar)('recipient_phone', { length: 30 }),
    scheduledFor: (0, pg_core_1.timestamp)('scheduled_for'),
    sentAt: (0, pg_core_1.timestamp)('sent_at'),
    providerMessageId: (0, pg_core_1.varchar)('provider_message_id', { length: 255 }),
    errorMessage: (0, pg_core_1.text)('error_message'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
}, (table) => ({
    userIdx: (0, pg_core_1.index)('notifications_user_idx').on(table.userId),
    statusIdx: (0, pg_core_1.index)('notifications_status_idx').on(table.status),
    scheduledIdx: (0, pg_core_1.index)('notifications_scheduled_idx').on(table.scheduledFor)
}));
// Notification preferences per user
exports.notificationPreferences = (0, pg_core_1.pgTable)('notification_preferences', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }).unique(),
    eventReminder: (0, pg_core_1.jsonb)('event_reminder').$type(),
    jobStatusChange: (0, pg_core_1.jsonb)('job_status_change').$type(),
    newJobAssigned: (0, pg_core_1.jsonb)('new_job_assigned').$type(),
    contractRenewalDue: (0, pg_core_1.jsonb)('contract_renewal_due').$type(),
    quietHoursStart: (0, pg_core_1.varchar)('quiet_hours_start', { length: 5 }),
    quietHoursEnd: (0, pg_core_1.varchar)('quiet_hours_end', { length: 5 }),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 50 }).default('America/Los_Angeles'),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }).notNull(),
    entityId: (0, pg_core_1.uuid)('entity_id').notNull(),
    entityName: (0, pg_core_1.varchar)('entity_name', { length: 255 }),
    action: (0, pg_core_1.varchar)('action', { length: 30 }).notNull().$type(),
    previousValues: (0, pg_core_1.jsonb)('previous_values').$type(),
    newValues: (0, pg_core_1.jsonb)('new_values').$type(),
    changedFields: (0, pg_core_1.jsonb)('changed_fields').$type(),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
}, (table) => ({
    companyIdx: (0, pg_core_1.index)('audit_logs_company_idx').on(table.companyId),
    entityIdx: (0, pg_core_1.index)('audit_logs_entity_idx').on(table.entityType, table.entityId),
    userIdx: (0, pg_core_1.index)('audit_logs_user_idx').on(table.userId),
    createdAtIdx: (0, pg_core_1.index)('audit_logs_created_at_idx').on(table.createdAt)
}));
exports.dataExports = (0, pg_core_1.pgTable)('data_exports', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }).notNull(),
    format: (0, pg_core_1.varchar)('format', { length: 10 }).notNull().$type(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('pending').$type(),
    filters: (0, pg_core_1.jsonb)('filters').$type(),
    fileName: (0, pg_core_1.varchar)('file_name', { length: 255 }),
    fileUrl: (0, pg_core_1.text)('file_url'),
    fileSize: (0, pg_core_1.integer)('file_size'),
    rowCount: (0, pg_core_1.integer)('row_count'),
    errorMessage: (0, pg_core_1.text)('error_message'),
    startedAt: (0, pg_core_1.timestamp)('started_at'),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.dataImports = (0, pg_core_1.pgTable)('data_imports', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.integer)('company_id').references(() => exports.companies.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('pending').$type(),
    originalFileName: (0, pg_core_1.varchar)('original_file_name', { length: 255 }),
    fileUrl: (0, pg_core_1.text)('file_url'),
    totalRows: (0, pg_core_1.integer)('total_rows'),
    successCount: (0, pg_core_1.integer)('success_count'),
    errorCount: (0, pg_core_1.integer)('error_count'),
    errors: (0, pg_core_1.jsonb)('errors').$type(),
    updateExisting: (0, pg_core_1.boolean)('update_existing').default(false),
    dryRun: (0, pg_core_1.boolean)('dry_run').default(false),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.serviceContractsRelations = (0, drizzle_orm_1.relations)(exports.serviceContracts, ({ one }) => ({
    contact: one(exports.contacts),
}));
