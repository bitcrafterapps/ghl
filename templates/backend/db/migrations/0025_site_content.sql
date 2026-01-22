-- Site Content table for self-publishing feature
CREATE TABLE IF NOT EXISTS "site_content" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "site_id" uuid NOT NULL,
  "page" varchar(50) NOT NULL,
  "section" varchar(50) NOT NULL,
  "content_key" varchar(50) NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS "site_content_site_idx" ON "site_content" ("site_id");
CREATE INDEX IF NOT EXISTS "site_content_page_idx" ON "site_content" ("site_id", "page");
CREATE INDEX IF NOT EXISTS "site_content_section_idx" ON "site_content" ("site_id", "page", "section");
CREATE UNIQUE INDEX IF NOT EXISTS "site_content_unique_key_idx" ON "site_content" ("site_id", "page", "section", "content_key");

-- Function to insert default content for a new site
CREATE OR REPLACE FUNCTION insert_default_site_content(p_site_id uuid)
RETURNS void AS $$
BEGIN
  -- Hero Section
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'landing', 'hero', 'headline', '<span>Your City''s Most Trusted</span> <span class="text-primary">Service</span> <span>Experts</span>'),
    (p_site_id, 'landing', 'hero', 'subheadline', '<p>Professional services with years of experience. Licensed, insured, and committed to your satisfaction.</p>')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;

  -- Services Section
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'landing', 'services', 'badge', 'Our Services'),
    (p_site_id, 'landing', 'services', 'headline', 'Professional Solutions'),
    (p_site_id, 'landing', 'services', 'description', '<p>From installations to maintenance, we provide comprehensive services for residential and commercial properties.</p>')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;

  -- Why Choose Us Section
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'landing', 'why-choose-us', 'badge', 'Why Choose Us'),
    (p_site_id, 'landing', 'why-choose-us', 'headline', 'Why Customers Trust Us'),
    (p_site_id, 'landing', 'why-choose-us', 'description', '<p>We''re committed to providing exceptional services with integrity, professionalism, and outstanding results.</p>')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;

  -- Services Page
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'services', 'hero', 'headline', 'Our {industry} Services'),
    (p_site_id, 'services', 'hero', 'description', '<p>Professional {industry} solutions for residential and commercial properties in {primary_city} and surrounding areas.</p>'),
    (p_site_id, 'services', 'services-list', 'badge', 'What We Offer'),
    (p_site_id, 'services', 'services-list', 'headline', 'Browse Our Services'),
    (p_site_id, 'services', 'services-list', 'description', '<p>Use the arrows or click on a service to explore what we offer.</p>'),
    (p_site_id, 'services', 'cta', 'headline', 'Need {industry} Help?'),
    (p_site_id, 'services', 'cta', 'description', '<p>Contact us today for a free estimate. Our expert team is ready to help with all your {industry} needs.</p>')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;

  -- Gallery Page
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'gallery', 'hero', 'headline', 'Our Work Gallery'),
    (p_site_id, 'gallery', 'hero', 'description', '<p>Browse our portfolio of completed {industry} projects. Quality workmanship you can trust.</p>'),
    (p_site_id, 'gallery', 'portfolio', 'badge', 'Our Portfolio'),
    (p_site_id, 'gallery', 'portfolio', 'headline', '{industry} Project'),
    (p_site_id, 'gallery', 'portfolio', 'description', '<p>Use the arrows to browse or click an image to view details.</p>')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;

  -- About Page
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'about', 'hero', 'headline', 'About {company_name}'),
    (p_site_id, 'about', 'hero', 'description', '<p>Your trusted {industry} professionals in {primary_city} with over {years_in_business} years of experience.</p>'),
    (p_site_id, 'about', 'story', 'headline', 'Committed to Excellence in {industry}'),
    (p_site_id, 'about', 'story', 'content', '<p>{company_name} has been proudly serving {primary_city} and surrounding communities for over {years_in_business} years.</p><p>Our commitment to quality workmanship and exceptional customer service has made us a trusted name in {industry} services.</p>'),
    (p_site_id, 'about', 'values', 'headline', 'Our Values'),
    (p_site_id, 'about', 'values', 'description', '<p>These core principles guide everything we do at {company_name}.</p>'),
    (p_site_id, 'about', 'team', 'headline', 'Meet Our Team'),
    (p_site_id, 'about', 'team', 'description', '<p>Expert professionals dedicated to delivering exceptional service.</p>'),
    (p_site_id, 'about', 'cta', 'headline', 'Ready to Work With Us?'),
    (p_site_id, 'about', 'cta', 'description', '<p>Experience the {company_name} difference. Contact us today for a free estimate.</p>')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;

  -- Reviews Page
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'reviews', 'hero', 'headline', 'Customer Reviews'),
    (p_site_id, 'reviews', 'hero', 'description', '<p>See what our customers are saying about {company_name}. We''re proud of our service!</p>'),
    (p_site_id, 'reviews', 'testimonials', 'badge', 'Testimonials'),
    (p_site_id, 'reviews', 'testimonials', 'headline', 'Customer Review'),
    (p_site_id, 'reviews', 'testimonials', 'description', '<p>Use the arrows to browse what our customers have to say.</p>'),
    (p_site_id, 'reviews', 'leave-review', 'headline', 'Had a Great Experience?'),
    (p_site_id, 'reviews', 'leave-review', 'description', '<p>We''d love to hear from you! Leave us a review and let others know about your experience with {company_name}.</p>'),
    (p_site_id, 'reviews', 'cta', 'headline', 'Join Our Happy Customers'),
    (p_site_id, 'reviews', 'cta', 'description', '<p>Experience the quality service that''s earned us 5-star reviews.</p>')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;

  -- Promotions Page
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'promotions', 'hero', 'headline', 'Current Promotions'),
    (p_site_id, 'promotions', 'hero', 'description', '<p>Save on your next service with {company_name}! Use these exclusive promo codes at checkout.</p>'),
    (p_site_id, 'promotions', 'promos', 'badge', 'Limited Time Offers'),
    (p_site_id, 'promotions', 'promos', 'headline', 'Use These Codes & Save'),
    (p_site_id, 'promotions', 'promos', 'description', '<p>Click on any code to copy it. Mention the code when booking or enter it during checkout.</p>'),
    (p_site_id, 'promotions', 'cta', 'headline', 'Ready to Save?'),
    (p_site_id, 'promotions', 'cta', 'description', '<p>Book your service today and use one of our promo codes to save on quality service.</p>')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;

  -- Contact Page
  INSERT INTO site_content (site_id, page, section, content_key, content)
  VALUES
    (p_site_id, 'contact', 'hero', 'headline', 'Contact Us'),
    (p_site_id, 'contact', 'hero', 'description', '<p>Have questions or need a quote? We''re here to help. Reach out to us today!</p>'),
    (p_site_id, 'contact', 'get-in-touch', 'headline', 'Get in Touch'),
    (p_site_id, 'contact', 'get-in-touch', 'description', '<p>We''d love to hear from you. Whether you have a question about our services, need a quote, or want to schedule an appointment, our team is ready to help.</p>'),
    (p_site_id, 'contact', 'form', 'headline', 'Send Us a Message')
  ON CONFLICT (site_id, page, section, content_key) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
