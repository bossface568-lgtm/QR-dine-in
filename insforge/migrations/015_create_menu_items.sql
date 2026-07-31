-- ============================================================
-- 015: Create menu_items table
-- Menu Management Module for QR Dine SaaS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,

  -- Identity
  name TEXT NOT NULL,
  short_name TEXT,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,

  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  compare_at_price DECIMAL(10, 2),
  tax_category TEXT,

  -- Codes
  sku TEXT,
  internal_code TEXT,
  barcode TEXT,

  -- Media
  image_url TEXT,
  gallery_json JSONB DEFAULT '[]'::jsonb,

  -- Dietary & Tags
  dietary_tags JSONB DEFAULT '[]'::jsonb,
  allergens JSONB DEFAULT '[]'::jsonb,

  -- Operations
  preparation_time INTEGER,
  calories INTEGER,
  spice_level INTEGER DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'unavailable', 'hidden', 'out_of_stock', 'coming_soon', 'discontinued')),

  -- Display & Sorting
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_chef_special BOOLEAN NOT NULL DEFAULT false,
  is_seasonal BOOLEAN NOT NULL DEFAULT false,

  -- Availability Schedule
  available_from TIME,
  available_until TIME,
  available_days JSONB DEFAULT '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb,

  -- Branch Availability (empty array = all branches)
  branch_availability JSONB DEFAULT '[]'::jsonb,

  -- Extensibility
  metadata_json JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_branch_id ON public.menu_items(branch_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_slug ON public.menu_items(restaurant_id, slug);
CREATE INDEX IF NOT EXISTS idx_menu_items_status ON public.menu_items(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON public.menu_items(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_featured ON public.menu_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_menu_items_archived_at ON public.menu_items(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_items_sku ON public.menu_items(restaurant_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_items_internal_code ON public.menu_items(restaurant_id, internal_code) WHERE internal_code IS NOT NULL;

-- ============================================================
-- Auto-update updated_at timestamp trigger
-- ============================================================
DROP TRIGGER IF EXISTS trigger_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Row-Level Security Policies for menu_items
-- ============================================================

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- INSERT: Authenticated users can insert items for their restaurants
CREATE POLICY menu_items_insert_authenticated ON public.menu_items
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- SELECT: Tenant-isolated read access
CREATE POLICY menu_items_tenant_select ON public.menu_items
  FOR SELECT USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- UPDATE: Owner/manager can update their restaurant's items
CREATE POLICY menu_items_owner_update ON public.menu_items
  FOR UPDATE USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- DELETE: Owner can delete (soft-delete via archived_at is preferred)
CREATE POLICY menu_items_owner_delete ON public.menu_items
  FOR DELETE USING (
    public.is_restaurant_owner(restaurant_id)
  );

-- ============================================================
-- Grant PostgREST API access to menu_items
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT SELECT ON public.menu_items TO anon;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
