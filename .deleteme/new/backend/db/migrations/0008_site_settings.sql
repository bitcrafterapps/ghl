-- Migration: Add site_settings table for platform configuration
-- This table stores site-wide settings including LLM configuration

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'Three Bears Platform',
    site_url VARCHAR(255),
    contact_email VARCHAR(255),
    max_projects_per_user INTEGER DEFAULT 10,
    enable_registration BOOLEAN DEFAULT true,
    require_email_verification BOOLEAN DEFAULT true,
    seo JSONB DEFAULT '{}',
    llm JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default row if none exists
INSERT INTO site_settings (id, site_name) 
VALUES (1, 'Three Bears Platform')
ON CONFLICT (id) DO NOTHING;
