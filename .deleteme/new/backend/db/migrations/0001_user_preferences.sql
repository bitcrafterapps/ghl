-- Add user preferences columns
ALTER TABLE users
ADD COLUMN "emailNotify" boolean DEFAULT true,
ADD COLUMN "smsNotify" boolean DEFAULT false,
ADD COLUMN "phoneNumber" varchar(20),
ADD COLUMN "theme" text NOT NULL DEFAULT 'system';

-- Add check constraint for theme values
ALTER TABLE users
ADD CONSTRAINT theme_check CHECK ("theme" IN ('light', 'dark', 'system')); 