CREATE TABLE "token_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer,
	"project_id" uuid,
	"model" varchar(100) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"input_tokens" integer DEFAULT 0,
	"output_tokens" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"context" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "token_usage" ADD CONSTRAINT "token_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage" ADD CONSTRAINT "token_usage_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "token_usage_user_idx" ON "token_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_usage_project_idx" ON "token_usage" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "token_usage_created_at_idx" ON "token_usage" USING btree ("created_at");