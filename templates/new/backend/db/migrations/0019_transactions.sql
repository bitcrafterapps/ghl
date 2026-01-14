-- Create transactions table for payment processing
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,

  -- Transaction details
  type VARCHAR(20) NOT NULL, -- 'subscription', 'one_time', 'refund'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled'

  -- Payment provider info
  provider VARCHAR(50) NOT NULL, -- stripe, square, paypal, braintree
  provider_transaction_id VARCHAR(255),
  provider_customer_id VARCHAR(255),

  -- Financial details
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Plan/Product info
  plan_id VARCHAR(50),
  plan_name VARCHAR(100),
  description TEXT,

  -- Card info (last 4 digits only)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(20),

  -- Billing info
  billing_name VARCHAR(255),
  billing_email VARCHAR(255),

  -- Metadata
  metadata JSONB,

  -- Error tracking
  error_code VARCHAR(100),
  error_message TEXT,

  -- Timestamps
  authorized_at TIMESTAMP,
  captured_at TIMESTAMP,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE INDEX IF NOT EXISTS transactions_provider_idx ON transactions(provider);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at);
CREATE INDEX IF NOT EXISTS transactions_provider_txn_idx ON transactions(provider_transaction_id);

-- Add comments for documentation
COMMENT ON TABLE transactions IS 'Payment transactions for subscriptions and one-time payments';
COMMENT ON COLUMN transactions.amount IS 'Amount in cents (e.g., $4.99 = 499)';
COMMENT ON COLUMN transactions.provider IS 'Payment provider: stripe, square, paypal, braintree';
COMMENT ON COLUMN transactions.status IS 'Transaction status: pending, authorized, captured, failed, refunded, cancelled';
