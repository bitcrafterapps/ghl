-- Reviews / Testimonials table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,

    -- Reviewer info
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_location VARCHAR(255),
    reviewer_email VARCHAR(255),

    -- Review content
    text TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    service VARCHAR(255),

    -- Source tracking
    source VARCHAR(50) DEFAULT 'manual',
    external_id VARCHAR(255),

    -- Google Business integration
    google_review_id VARCHAR(255),
    google_posted_at TIMESTAMP,

    -- Display settings
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'published',

    -- Timestamps
    review_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS reviews_company_idx ON reviews(company_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews(status);
CREATE INDEX IF NOT EXISTS reviews_source_idx ON reviews(source);
CREATE INDEX IF NOT EXISTS reviews_featured_idx ON reviews(featured);
