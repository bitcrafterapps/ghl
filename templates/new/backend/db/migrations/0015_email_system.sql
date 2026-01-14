-- Email Templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  "key" VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  template_key VARCHAR(50),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  resend_id VARCHAR(100),
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX idx_email_templates_key ON email_templates("key");

-- Insert default welcome email template
INSERT INTO email_templates ("key", name, subject, body, enabled) VALUES
(
  'welcome',
  'Welcome Email',
  'Welcome to ThreeBears.ai, {{firstName}}!',
  '<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">🐻 ThreeBears.ai</h1>
  </div>
  
  <h2 style="color: #18181b;">Welcome aboard, {{firstName}}! 🎉</h2>
  
  <p style="color: #3f3f46; line-height: 1.6;">
    Thank you for joining ThreeBears.ai! We''re excited to have you as part of our community.
  </p>
  
  <p style="color: #3f3f46; line-height: 1.6;">
    With ThreeBears, you can:
  </p>
  
  <ul style="color: #3f3f46; line-height: 1.8;">
    <li>Create detailed Product Requirements Documents with AI assistance</li>
    <li>Generate full-stack applications from your PRDs</li>
    <li>Deploy your applications with one click</li>
    <li>Collaborate with your team on projects</li>
  </ul>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{appUrl}}/projects/new" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
      Create Your First Project
    </a>
  </div>
  
  <p style="color: #71717a; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
    If you have any questions, just reply to this email. We''re always happy to help!
  </p>
  
  <p style="color: #71717a; font-size: 14px;">
    — The ThreeBears Team
  </p>
</div>',
  true
) ON CONFLICT ("key") DO NOTHING;
