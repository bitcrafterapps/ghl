"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactions = exports.tokenUsage = exports.siteSettings = exports.pushHistory = exports.deployments = exports.chatMessages = exports.generations = exports.prdMessages = exports.prds = exports.projects = exports.emailLogs = exports.emailTemplates = exports.activityLog = exports.companyUsers = exports.companies = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
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
    theme: (0, pg_core_1.text)('theme').notNull().default('system'),
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
