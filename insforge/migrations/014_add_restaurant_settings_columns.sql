-- ============================================================
-- QR Dine SaaS Database Migration 014
-- Add restaurant settings columns to restaurants table
-- ============================================================

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS business_registration TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#f97316',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#0f172a',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#06b6d4',
  ADD COLUMN IF NOT EXISTS opening_time TIME,
  ADD COLUMN IF NOT EXISTS closing_time TIME,
  ADD COLUMN IF NOT EXISTS business_days JSONB DEFAULT '["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]'::jsonb,
  ADD COLUMN IF NOT EXISTS business_address TEXT,
  ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
  ADD COLUMN IF NOT EXISTS time_format TEXT DEFAULT '12h',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'IN',
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS accept_orders BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_table_ordering BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS kitchen_display_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS kitchen_alerts BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS order_alerts BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS settings_json JSONB DEFAULT '{}'::jsonb;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
