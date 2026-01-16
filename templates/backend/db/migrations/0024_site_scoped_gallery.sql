-- Add site_id column to gallery_images table
ALTER TABLE "gallery_images" ADD COLUMN "site_id" uuid;

-- Create index for site_id for faster lookups
CREATE INDEX IF NOT EXISTS "gallery_images_site_id_idx" ON "gallery_images" ("site_id");
