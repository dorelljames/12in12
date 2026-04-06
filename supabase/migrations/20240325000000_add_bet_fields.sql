-- Add flexible date fields for bets (replacing fixed calendar months)
ALTER TABLE products ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deadline timestamptz;

-- Add motivation field: 'profit', 'impact', or 'craft'
ALTER TABLE products ADD COLUMN IF NOT EXISTS motivation text
  CHECK (motivation IN ('profit', 'impact', 'craft'));

-- Make month nullable so new bets don't need it
ALTER TABLE products ALTER COLUMN month DROP NOT NULL;

-- Backfill: set started_at from created_at for existing products
UPDATE products SET started_at = created_at WHERE started_at IS NULL;
