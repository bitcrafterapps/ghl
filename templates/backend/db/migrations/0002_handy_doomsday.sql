CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer,
	"user_id" integer,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_name" varchar(255),
	"action" varchar(30) NOT NULL,
	"previous_values" jsonb,
	"new_values" jsonb,
	"changed_fields" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer,
	"ghl_calendar_id" varchar(100),
	"ghl_event_id" varchar(100),
	"sync_with_ghl" boolean DEFAULT false,
	"last_ghl_sync" timestamp,
	"title" varchar(255) NOT NULL,
	"description" text,
	"event_type" varchar(50) DEFAULT 'appointment',
	"status" varchar(30) DEFAULT 'scheduled',
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"all_day" boolean DEFAULT false,
	"timezone" varchar(50) DEFAULT 'America/Los_Angeles',
	"recurrence_rule" varchar(255),
	"recurrence_end_date" timestamp,
	"parent_event_id" uuid,
	"is_recurring_instance" boolean DEFAULT false,
	"original_start_time" timestamp,
	"location" varchar(255),
	"location_address" text,
	"is_virtual" boolean DEFAULT false,
	"virtual_meeting_url" text,
	"contact_id" uuid,
	"job_id" uuid,
	"assigned_user_id" integer,
	"reminder_minutes" integer DEFAULT 30,
	"reminder_sent" boolean DEFAULT false,
	"color" varchar(7) DEFAULT '#3B82F6',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid,
	"user_id" integer,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer,
	"ghl_contact_id" varchar(100),
	"sync_with_ghl" boolean DEFAULT false,
	"last_ghl_sync" timestamp,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"email" varchar(255),
	"phone" varchar(30),
	"phone_secondary" varchar(30),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(50),
	"zip" varchar(20),
	"country" varchar(50) DEFAULT 'USA',
	"contact_company_name" varchar(255),
	"contact_job_title" varchar(100),
	"status" varchar(30) DEFAULT 'new',
	"source" varchar(50) DEFAULT 'manual',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"custom_fields" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer,
	"user_id" integer,
	"entity_type" varchar(50) NOT NULL,
	"format" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"filters" jsonb,
	"file_name" varchar(255),
	"file_url" text,
	"file_size" integer,
	"row_count" integer,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer,
	"user_id" integer,
	"entity_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"original_file_name" varchar(255),
	"file_url" text,
	"total_rows" integer,
	"success_count" integer,
	"error_count" integer,
	"errors" jsonb,
	"update_existing" boolean DEFAULT false,
	"dry_run" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_key" varchar(50),
	"recipient_email" varchar(255) NOT NULL,
	"recipient_user_id" integer,
	"subject" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"resend_id" varchar(100),
	"error" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_templates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"company_id" integer,
	"title" varchar(255),
	"description" text,
	"alt_text" varchar(255),
	"blob_url" text NOT NULL,
	"blob_pathname" varchar(500),
	"blob_content_type" varchar(100),
	"blob_size" integer,
	"thumbnail_url" text,
	"category" varchar(100),
	"tags" text[] DEFAULT '{}',
	"sort_order" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"user_id" integer,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_photo_before_after_pairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"before_photo_id" uuid,
	"after_photo_id" uuid,
	"title" varchar(255),
	"description" text,
	"sort_order" integer DEFAULT 0,
	"publish_status" varchar(30) DEFAULT 'private',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"company_id" integer,
	"uploaded_by_user_id" integer,
	"blob_url" text NOT NULL,
	"blob_pathname" varchar(500),
	"thumbnail_url" text,
	"title" varchar(255),
	"description" text,
	"alt_text" varchar(255),
	"photo_type" varchar(30) DEFAULT 'other',
	"is_before_after_pair" boolean DEFAULT false,
	"paired_photo_id" uuid,
	"sort_order" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"publish_status" varchar(30) DEFAULT 'private',
	"published_to_gallery_id" integer,
	"published_at" timestamp,
	"published_by_user_id" integer,
	"file_size" integer,
	"width" integer,
	"height" integer,
	"mime_type" varchar(50),
	"ai_tags" jsonb,
	"ai_description" text,
	"taken_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer,
	"job_number" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(30) DEFAULT 'lead',
	"priority" varchar(20) DEFAULT 'normal',
	"contact_id" uuid,
	"assigned_user_id" integer,
	"service_type" varchar(100),
	"service_category" varchar(100),
	"site_address_line1" varchar(255),
	"site_address_line2" varchar(255),
	"site_city" varchar(100),
	"site_state" varchar(50),
	"site_zip" varchar(20),
	"estimated_amount" integer,
	"quoted_amount" integer,
	"final_amount" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"scheduled_date" timestamp,
	"estimated_duration" integer,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"internal_notes" text,
	"customer_notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer,
	"event_reminder" jsonb,
	"job_status_change" jsonb,
	"new_job_assigned" jsonb,
	"contract_renewal_due" jsonb,
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"timezone" varchar(50) DEFAULT 'America/Los_Angeles',
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer,
	"user_id" integer,
	"trigger" varchar(50) NOT NULL,
	"entity_type" varchar(30),
	"entity_id" uuid,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"subject" varchar(255),
	"body" text NOT NULL,
	"recipient_email" varchar(255),
	"recipient_phone" varchar(30),
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"provider_message_id" varchar(255),
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" integer,
	"generation_id" uuid,
	"commit_sha" varchar(40) NOT NULL,
	"commit_message" text NOT NULL,
	"branch" varchar(100) NOT NULL,
	"files_count" integer DEFAULT 0 NOT NULL,
	"pr_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"company_id" integer,
	"reviewer_name" varchar(255) NOT NULL,
	"reviewer_location" varchar(255),
	"reviewer_email" varchar(255),
	"text" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"service" varchar(255),
	"source" varchar(50) DEFAULT 'manual',
	"external_id" varchar(255),
	"google_review_id" varchar(255),
	"google_posted_at" timestamp,
	"featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'published',
	"review_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer,
	"contact_id" uuid,
	"parent_job_id" uuid,
	"contract_number" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(30) DEFAULT 'draft',
	"service_type" varchar(100),
	"service_description" text,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"frequency" varchar(30) DEFAULT 'monthly',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"auto_renew" boolean DEFAULT false,
	"terms" text,
	"next_service_date" timestamp,
	"preferred_day_of_week" integer,
	"preferred_time_slot" varchar(50),
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer,
	"user_email" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_transaction_id" varchar(255),
	"provider_customer_id" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"plan_id" varchar(50),
	"plan_name" varchar(100),
	"description" text,
	"card_last4" varchar(4),
	"card_brand" varchar(20),
	"billing_name" varchar(255),
	"billing_email" varchar(255),
	"metadata" jsonb,
	"error_code" varchar(100),
	"error_message" text,
	"authorized_at" timestamp,
	"captured_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "theme" SET DEFAULT 'dark';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" varchar(20) DEFAULT 'Active' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repo_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repo_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repo_full_name" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repo_visibility" varchar(10) DEFAULT 'private';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "default_branch" varchar(100) DEFAULT 'main';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "use_feature_branches" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "auto_push_on_generate" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_push_at" timestamp;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "git_provider" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "google_oauth" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "payment_processor" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "max_projects" integer DEFAULT 3;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "max_generations" integer DEFAULT 20;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "git_connection" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_expires" timestamp;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_activities" ADD CONSTRAINT "contact_activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_activities" ADD CONSTRAINT "contact_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_exports" ADD CONSTRAINT "data_exports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_exports" ADD CONSTRAINT "data_exports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_imports" ADD CONSTRAINT "data_imports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_imports" ADD CONSTRAINT "data_imports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_activities" ADD CONSTRAINT "job_activities_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_activities" ADD CONSTRAINT "job_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photo_before_after_pairs" ADD CONSTRAINT "job_photo_before_after_pairs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photo_before_after_pairs" ADD CONSTRAINT "job_photo_before_after_pairs_before_photo_id_job_photos_id_fk" FOREIGN KEY ("before_photo_id") REFERENCES "public"."job_photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photo_before_after_pairs" ADD CONSTRAINT "job_photo_before_after_pairs_after_photo_id_job_photos_id_fk" FOREIGN KEY ("after_photo_id") REFERENCES "public"."job_photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_published_to_gallery_id_gallery_images_id_fk" FOREIGN KEY ("published_to_gallery_id") REFERENCES "public"."gallery_images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_published_by_user_id_users_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_history" ADD CONSTRAINT "push_history_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_history" ADD CONSTRAINT "push_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_history" ADD CONSTRAINT "push_history_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contracts" ADD CONSTRAINT "service_contracts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contracts" ADD CONSTRAINT "service_contracts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contracts" ADD CONSTRAINT "service_contracts_parent_job_id_jobs_id_fk" FOREIGN KEY ("parent_job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_company_idx" ON "audit_logs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "calendar_events_company_idx" ON "calendar_events" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "calendar_events_contact_idx" ON "calendar_events" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "calendar_events_job_idx" ON "calendar_events" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "calendar_events_start_time_idx" ON "calendar_events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "calendar_events_status_idx" ON "calendar_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_activities_contact_idx" ON "contact_activities" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "contact_activities_type_idx" ON "contact_activities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "contacts_company_idx" ON "contacts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "contacts_ghl_id_idx" ON "contacts" USING btree ("ghl_contact_id");--> statement-breakpoint
CREATE INDEX "contacts_status_idx" ON "contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "gallery_images_company_idx" ON "gallery_images" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "gallery_images_category_idx" ON "gallery_images" USING btree ("category");--> statement-breakpoint
CREATE INDEX "gallery_images_status_idx" ON "gallery_images" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gallery_images_sort_order_idx" ON "gallery_images" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "job_activities_job_idx" ON "job_activities" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_activities_type_idx" ON "job_activities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "job_photos_job_idx" ON "job_photos" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_photos_company_idx" ON "job_photos" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "job_photos_publish_status_idx" ON "job_photos" USING btree ("publish_status");--> statement-breakpoint
CREATE INDEX "job_photos_type_idx" ON "job_photos" USING btree ("photo_type");--> statement-breakpoint
CREATE INDEX "job_photos_sort_order_idx" ON "job_photos" USING btree ("job_id","sort_order");--> statement-breakpoint
CREATE INDEX "jobs_company_idx" ON "jobs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "jobs_contact_idx" ON "jobs" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_job_number_idx" ON "jobs" USING btree ("company_id","job_number");--> statement-breakpoint
CREATE INDEX "jobs_scheduled_date_idx" ON "jobs" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_scheduled_idx" ON "notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "push_history_project_idx" ON "push_history" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "push_history_commit_sha_idx" ON "push_history" USING btree ("commit_sha");--> statement-breakpoint
CREATE INDEX "reviews_company_idx" ON "reviews" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reviews_source_idx" ON "reviews" USING btree ("source");--> statement-breakpoint
CREATE INDEX "reviews_featured_idx" ON "reviews" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "service_contracts_company_idx" ON "service_contracts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "service_contracts_contact_idx" ON "service_contracts" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "service_contracts_status_idx" ON "service_contracts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "service_contracts_number_idx" ON "service_contracts" USING btree ("company_id","contract_number");--> statement-breakpoint
CREATE INDEX "transactions_user_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_provider_idx" ON "transactions" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_provider_txn_idx" ON "transactions" USING btree ("provider_transaction_id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;