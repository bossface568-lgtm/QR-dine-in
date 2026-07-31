-- QR Dine SaaS: Migration 016 - Update Tables Schema
-- Enhances public.tables with status, floor, section, archiving, and integration placeholders

-- 1. Add missing columns to public.tables
ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'inactive')),
  ADD COLUMN IF NOT EXISTS floor TEXT,
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS current_session_id TEXT,
  ADD COLUMN IF NOT EXISTS current_order_id TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 2. Ensure existing columns have correct defaults/types
ALTER TABLE public.tables ALTER COLUMN seating_capacity SET DEFAULT 4;
ALTER TABLE public.tables ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE public.tables ALTER COLUMN is_occupied SET DEFAULT false;

-- 3. Create high-performance indexes
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON public.tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_branch_id ON public.tables(branch_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_archived_at ON public.tables(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tables_floor ON public.tables(restaurant_id, floor);
CREATE INDEX IF NOT EXISTS idx_tables_section ON public.tables(restaurant_id, section);
CREATE INDEX IF NOT EXISTS idx_tables_number_branch ON public.tables(restaurant_id, branch_id, table_number);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
