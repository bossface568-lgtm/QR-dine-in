-- ============================================================
-- QR Dine SaaS — Full Database Migration (Combined)
-- Run this ONCE in the InsForge SQL Editor or via run-raw-sql
-- ============================================================

-- ==========================================
-- 001: Create restaurants table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  restaurant_type TEXT,
  phone TEXT,
  email TEXT,
  gst_number TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON public.restaurants(status);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER trigger_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 002: Create roles table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roles_restaurant_id ON public.roles(restaurant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_restaurant_name ON public.roles(restaurant_id, name);

-- ==========================================
-- 003: Create restaurant_users table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.restaurant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_users_restaurant_id ON public.restaurant_users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_users_auth_user_id ON public.restaurant_users(auth_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_users_restaurant_auth ON public.restaurant_users(restaurant_id, auth_user_id);

-- ==========================================
-- 004: Create branches table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  opening_time TIME,
  closing_time TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branches_restaurant_id ON public.branches(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON public.branches(is_active);

DROP TRIGGER IF EXISTS trigger_branches_updated_at ON public.branches;
CREATE TRIGGER trigger_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 005: Create staff table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_restaurant_id ON public.staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_branch_id ON public.staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_id ON public.staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON public.staff(status);

-- ==========================================
-- 006: Row-Level Security Policies (Non-recursive)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER helper functions to prevent infinite RLS recursion on restaurant_users
CREATE OR REPLACE FUNCTION public.get_my_restaurant_ids()
RETURNS SETOF UUID AS $$
  SELECT restaurant_id FROM public.restaurant_users WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_restaurant_owner(target_restaurant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_users
    WHERE restaurant_id = target_restaurant_id
      AND auth_user_id = auth.uid()
      AND is_owner = true
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Restaurants Policies
CREATE POLICY restaurants_insert_authenticated ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY restaurants_tenant_select ON public.restaurants
  FOR SELECT USING (
    id IN (SELECT public.get_my_restaurant_ids())
  );

CREATE POLICY restaurants_owner_update ON public.restaurants
  FOR UPDATE USING (
    public.is_restaurant_owner(id)
  );

CREATE POLICY restaurants_owner_delete ON public.restaurants
  FOR DELETE USING (
    public.is_restaurant_owner(id)
  );

-- Roles Policies
CREATE POLICY roles_insert_authenticated ON public.roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY roles_tenant_select ON public.roles
  FOR SELECT USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

CREATE POLICY roles_owner_update ON public.roles
  FOR UPDATE USING (
    public.is_restaurant_owner(restaurant_id)
  );

CREATE POLICY roles_owner_delete ON public.roles
  FOR DELETE USING (
    public.is_restaurant_owner(restaurant_id)
  );

-- Restaurant Users Policies
CREATE POLICY restaurant_users_insert_own ON public.restaurant_users
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY restaurant_users_tenant_select ON public.restaurant_users
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

CREATE POLICY restaurant_users_owner_update ON public.restaurant_users
  FOR UPDATE USING (
    public.is_restaurant_owner(restaurant_id)
  );

CREATE POLICY restaurant_users_owner_delete ON public.restaurant_users
  FOR DELETE USING (
    public.is_restaurant_owner(restaurant_id)
  );

-- Branches Policies
CREATE POLICY branches_insert_authenticated ON public.branches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY branches_tenant_select ON public.branches
  FOR SELECT USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

CREATE POLICY branches_owner_update ON public.branches
  FOR UPDATE USING (
    public.is_restaurant_owner(restaurant_id)
  );

CREATE POLICY branches_owner_delete ON public.branches
  FOR DELETE USING (
    public.is_restaurant_owner(restaurant_id)
  );

-- Staff Policies
CREATE POLICY staff_insert_authenticated ON public.staff
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY staff_tenant_select ON public.staff
  FOR SELECT USING (
    restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

CREATE POLICY staff_owner_update ON public.staff
  FOR UPDATE USING (
    public.is_restaurant_owner(restaurant_id)
  );

CREATE POLICY staff_owner_delete ON public.staff
  FOR DELETE USING (
    public.is_restaurant_owner(restaurant_id)
  );

