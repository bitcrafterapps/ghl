-- Migration: Add Project Status
-- Description: Adds status column to projects table

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Active';

-- Add check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_status_check'
  ) THEN
    ALTER TABLE projects 
    ADD CONSTRAINT projects_status_check 
    CHECK (status IN ('Active', 'Inactive', 'Archived'));
  END IF;
END $$;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
