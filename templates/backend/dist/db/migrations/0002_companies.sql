-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "addressLine1" VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state CHAR(2) NOT NULL,
  zip VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create company_users join table
CREATE TABLE IF NOT EXISTS company_users (
  id SERIAL PRIMARY KEY,
  "companyId" INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("companyId", "userId")
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON company_users("companyId");
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON company_users("userId"); 