-- Add Google OAuth settings to site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS google_oauth JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN site_settings.google_oauth IS 'Google OAuth settings for Google Docs integration: { enabled: boolean, clientId: string, clientSecret: string }';
