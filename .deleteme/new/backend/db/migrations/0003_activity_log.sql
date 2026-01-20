-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'proposal', 'template', 'company', 'user'
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted'
  title VARCHAR(255) NOT NULL,
  entity_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Add comment to explain the purpose of the table
COMMENT ON TABLE activity_log IS 'Tracks user activity and changes across the system'; 