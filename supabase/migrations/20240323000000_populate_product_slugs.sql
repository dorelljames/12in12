-- Create a function to generate a slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert to lowercase, replace special chars with empty string, replace spaces with hyphens
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(title),
        '[^a-zA-Z0-9\s-]',
        '',
        'g'
      ),
      '\s+',
      '-',
      'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to make a slug unique
CREATE OR REPLACE FUNCTION make_slug_unique(base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 1;
BEGIN
  new_slug := base_slug;
  -- Keep checking until we find a unique slug
  WHILE EXISTS (SELECT 1 FROM products WHERE slug = new_slug) LOOP
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing products with slugs
DO $$
DECLARE
  product RECORD;
BEGIN
  FOR product IN SELECT id, title FROM products WHERE slug IS NULL LOOP
    UPDATE products
    SET slug = make_slug_unique(generate_slug(product.title))
    WHERE id = product.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add not null constraint now that all records have slugs
ALTER TABLE products ALTER COLUMN slug SET NOT NULL; 