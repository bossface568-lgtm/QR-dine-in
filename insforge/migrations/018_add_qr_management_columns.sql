-- QR Dine SaaS: Migration 018 - Add QR Management Columns
-- Tracks QR code status, versioning, generation timestamps, and regeneration history on public.tables

-- 1. Add QR tracking columns to public.tables
ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS qr_generated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS qr_last_regenerated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qr_version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS qr_status TEXT DEFAULT 'active' CHECK (qr_status IN ('active', 'expired', 'revoked', 'unregistered'));

-- 2. Backfill existing tables
UPDATE public.tables
SET qr_status = 'active',
    qr_generated_at = COALESCE(created_at, NOW()),
    qr_version = COALESCE(qr_version, 1)
WHERE qr_status IS NULL;

-- 3. Create high-performance index for qr_status queries
CREATE INDEX IF NOT EXISTS idx_tables_qr_status ON public.tables(restaurant_id, qr_status);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
