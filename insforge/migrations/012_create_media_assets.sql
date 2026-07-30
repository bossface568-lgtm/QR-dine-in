-- ============================================================
-- 012: Create media_assets table
-- Reusable Media Foundation for QR Dine SaaS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  
  -- Entity Association
  entity_type TEXT NOT NULL CHECK (entity_type IN ('logo', 'category', 'menu', 'banner', 'staff', 'offer', 'qr', 'marketing')),
  entity_id UUID,

  -- Storage Information
  bucket TEXT NOT NULL DEFAULT 'menu-images',
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  
  -- Variants JSON: { "thumb": "url...", "small": "url...", "medium": "url...", "large": "url..." }
  variants_json JSONB DEFAULT '{}'::jsonb,

  -- File Metadata
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/webp',
  width INTEGER,
  height INTEGER,

  -- Audit & Soft-Delete
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_restaurant_id ON public.media_assets(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_entity ON public.media_assets(restaurant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_storage_path ON public.media_assets(storage_path);
CREATE INDEX IF NOT EXISTS idx_media_assets_deleted_at ON public.media_assets(deleted_at) WHERE deleted_at IS NOT NULL;

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS trigger_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER trigger_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Row-Level Security Policies
-- ============================================================

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- INSERT: Authenticated users can insert media for their restaurant
CREATE POLICY media_assets_insert_authenticated ON public.media_assets
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- SELECT: Tenant-isolated read access
CREATE POLICY media_assets_tenant_select ON public.media_assets
  FOR SELECT USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- UPDATE: Owner/manager can update media metadata for their restaurant
CREATE POLICY media_assets_owner_update ON public.media_assets
  FOR UPDATE USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- DELETE: Owner/manager can delete media records
CREATE POLICY media_assets_owner_delete ON public.media_assets
  FOR DELETE USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );
