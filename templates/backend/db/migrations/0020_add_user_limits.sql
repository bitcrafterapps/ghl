-- Migration: Add usage limit columns to users table
-- These columns track max projects and generations per user based on their plan

ALTER TABLE users ADD COLUMN IF NOT EXISTS max_projects INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_generations INTEGER DEFAULT 20;
