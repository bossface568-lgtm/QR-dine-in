-- ============================================================
-- 010: Create menu_categories table
-- Category Management Module for QR Dine SaaS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Display
  image_url TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  bg_color TEXT DEFAULT '#1e293b',
  text_color TEXT DEFAULT '#f8fafc',

  -- Status
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  -- Scheduling
  available_from TIME,
  available_until TIME,
  available_days JSONB DEFAULT '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb,

  -- SEO (future)
  seo_title TEXT,
  seo_description TEXT,

  -- Audit
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant_id ON public.menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_branch_id ON public.menu_categories(branch_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_sort_order ON public.menu_categories(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_categories_is_featured ON public.menu_categories(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_menu_categories_archived_at ON public.menu_categories(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_categories_slug ON public.menu_categories(restaurant_id, slug);

-- Auto-update updated_at timestamp trigger
DROP TRIGGER IF EXISTS trigger_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER trigger_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Row-Level Security Policies for menu_categories
-- ============================================================

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- INSERT: Authenticated users can insert categories for their restaurants
CREATE POLICY menu_categories_insert_authenticated ON public.menu_categories
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- SELECT: Tenant-isolated read access
CREATE POLICY menu_categories_tenant_select ON public.menu_categories
  FOR SELECT USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- UPDATE: Owner/manager can update their restaurant's categories
CREATE POLICY menu_categories_owner_update ON public.menu_categories
  FOR UPDATE USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- DELETE: Owner can delete (soft-delete via archived_at is preferred)
CREATE POLICY menu_categories_owner_delete ON public.menu_categories
  FOR DELETE USING (
    public.is_restaurant_owner(restaurant_id)
  );
