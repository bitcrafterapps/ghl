-- Git Integration Migration
-- Adds git provider configuration and repository tracking

-- Add git connection to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS git_connection JSONB;

-- Add git repository fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS repo_enabled BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS repo_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS repo_full_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS repo_visibility VARCHAR(10) DEFAULT 'private';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS default_branch VARCHAR(100) DEFAULT 'main';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS use_feature_branches BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS auto_push_on_generate BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_push_at TIMESTAMP;

-- Add git provider to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS git_provider JSONB;

-- Add index for faster lookup of projects by repo
CREATE INDEX IF NOT EXISTS projects_repo_full_name_idx ON projects(repo_full_name) WHERE repo_full_name IS NOT NULL;
