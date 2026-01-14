-- Gallery Images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,

    -- Image metadata
    title VARCHAR(255),
    description TEXT,
    alt_text VARCHAR(255),

    -- Vercel Blob storage reference (or local path in dev)
    blob_url TEXT NOT NULL,
    blob_pathname VARCHAR(500),
    blob_content_type VARCHAR(100),
    blob_size INTEGER,

    -- Thumbnail (optional resized version)
    thumbnail_url TEXT,

    -- Organization
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS gallery_images_company_idx ON gallery_images(company_id);
CREATE INDEX IF NOT EXISTS gallery_images_category_idx ON gallery_images(category);
CREATE INDEX IF NOT EXISTS gallery_images_status_idx ON gallery_images(status);
CREATE INDEX IF NOT EXISTS gallery_images_sort_order_idx ON gallery_images(sort_order);
