-- Create application logs table for the logging system
CREATE TABLE IF NOT EXISTS application_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  level VARCHAR(10) NOT NULL,
  context VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  args JSONB,
  metadata JSONB
);

-- Add index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_application_logs_timestamp ON application_logs (timestamp);

-- Add index on level for filtering by log level
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON application_logs (level);

-- Add index on context for filtering by context
CREATE INDEX IF NOT EXISTS idx_application_logs_context ON application_logs (context);

-- Add comment to the table
COMMENT ON TABLE application_logs IS 'Stores application logs from the LoggerFactory system'; 