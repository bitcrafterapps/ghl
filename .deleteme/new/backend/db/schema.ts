import { pgTable, serial, varchar, timestamp, text, boolean, jsonb, integer, index, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

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
// Promo Codes
// ============================================

export type PromoCodeStatus = 'active' | 'inactive' | 'expired';
export type PromoCodeDiscountType = 'percentage' | 'fixed_amount';

export const promoCodes = pgTable('promo_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),

  // Code details
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Discount configuration
  discountType: varchar('discount_type', { length: 20 }).notNull().$type<PromoCodeDiscountType>(),
  discountValue: integer('discount_value').notNull(), // Percentage (0-100) or cents for fixed amount

  // Usage limits
  maxUses: integer('max_uses'), // null = unlimited
  usedCount: integer('used_count').default(0),
  maxUsesPerCustomer: integer('max_uses_per_customer').default(1),

  // Minimum requirements
  minimumOrderAmount: integer('minimum_order_amount'), // in cents

  // Validity period
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<PromoCodeStatus>(),

  // Display settings
  isPublic: boolean('is_public').default(false), // Show on public promo codes page
  sortOrder: integer('sort_order').default(0),

  // Applicable services (null = all services)
  applicableServices: jsonb('applicable_services').$type<string[]>(),

  // Terms and conditions
  terms: text('terms'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  companyIdx: index('promo_codes_company_idx').on(table.companyId),
  codeIdx: index('promo_codes_code_idx').on(table.code),
  statusIdx: index('promo_codes_status_idx').on(table.status),
  startDateIdx: index('promo_codes_start_date_idx').on(table.startDate),
  endDateIdx: index('promo_codes_end_date_idx').on(table.endDate),
  isPublicIdx: index('promo_codes_is_public_idx').on(table.isPublic),
  companyCodeIdx: uniqueIndex('promo_codes_company_code_idx').on(table.companyId, table.code)
}));