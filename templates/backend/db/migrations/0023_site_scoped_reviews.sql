-- Add siteId column to reviews table for multi-tenant site scoping
-- Each generated site will have a unique UUID to scope its reviews

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS site_id UUID;

-- Add index for faster queries by site_id
CREATE INDEX IF NOT EXISTS idx_reviews_site_id ON reviews(site_id);

-- Add composite index for common query pattern (site_id + status)
CREATE INDEX IF NOT EXISTS idx_reviews_site_status ON reviews(site_id, status);
