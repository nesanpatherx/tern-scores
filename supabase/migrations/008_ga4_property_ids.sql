-- Add GA4 property ID to portcos table
ALTER TABLE portcos ADD COLUMN IF NOT EXISTS ga4_property_id TEXT;

-- Comment for reference
COMMENT ON COLUMN portcos.ga4_property_id IS 'Google Analytics 4 Property ID (numeric, e.g. 123456789)';
