-- Add industry and size columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS "industry" VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS "size" VARCHAR(50);

-- Update industry and size columns from existing company data if possible
UPDATE companies SET industry = 'technology' WHERE industry IS NULL;
UPDATE companies SET size = '1-10' WHERE size IS NULL; 