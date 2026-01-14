-- Add status, companyName, jobTitle, and selectedPlan fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "companyName" VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "jobTitle" VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "selectedPlan" VARCHAR(50);

-- Update existing users to have 'active' status if NULL
UPDATE users SET status = 'active' WHERE status IS NULL; 