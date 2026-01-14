-- Add is_read column to activity_log table for notification read status persistence
ALTER TABLE "activity_log" ADD COLUMN IF NOT EXISTS "is_read" boolean DEFAULT false;
