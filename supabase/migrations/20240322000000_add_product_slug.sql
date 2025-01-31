-- Add slug column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products (slug);

-- Add not null constraint after we've added slugs to existing records
-- This will be done in a separate migration after we populate existing records 