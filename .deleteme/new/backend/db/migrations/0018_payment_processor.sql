-- Add Payment Processor settings to site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS payment_processor JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN site_settings.payment_processor IS 'Payment processor settings: { enabled: boolean, provider: string, testMode: boolean, defaultCurrency: string, credentials: { ... provider-specific keys } }';
