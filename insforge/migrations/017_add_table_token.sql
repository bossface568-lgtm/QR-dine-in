-- QR Dine SaaS: Migration 017 - Add Table Token
-- Adds unique, permanent, URL-safe table_token to public.tables and backfills existing rows

-- 1. Add table_token column
ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS table_token TEXT UNIQUE;

-- 2. Backfill existing tables with a unique 7-character uppercase alphanumeric token
UPDATE public.tables
SET table_token = upper(substring(md5(id::text || clock_timestamp()::text || random()::text) from 1 for 7))
WHERE table_token IS NULL;

-- 3. Make table_token NOT NULL for future inserts (default generated in code or trigger)
ALTER TABLE public.tables
  ALTER COLUMN table_token SET NOT NULL;

-- 4. High-performance index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_tables_table_token ON public.tables(table_token);

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
