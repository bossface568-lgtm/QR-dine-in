-- QR Dine SaaS Database Migration
-- Policies: Row-Level Security (RLS) for multi-tenant isolation

-- Enable RLS on all 5 tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants FORCE ROW LEVEL SECURITY;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_users FORCE ROW LEVEL SECURITY;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches FORCE ROW LEVEL SECURITY;

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff FORCE ROW LEVEL SECURITY;

-- 1. Restaurants Policies
-- Select: active users belonging to the restaurant can view it
CREATE POLICY restaurants_tenant_select ON public.restaurants
  FOR SELECT USING (
    id IN (
      SELECT restaurant_id FROM public.restaurant_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Owner management
CREATE POLICY restaurants_owner_all ON public.restaurants
  FOR ALL USING (
    id IN (
      SELECT restaurant_id FROM public.restaurant_users
      WHERE auth_user_id = auth.uid() AND is_owner = true
    )
  );

-- 2. Roles Policies
CREATE POLICY roles_tenant_all ON public.roles
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- 3. Restaurant Users Policies
-- Users can view other user mappings in their own restaurant
CREATE POLICY restaurant_users_tenant_select ON public.restaurant_users
  FOR SELECT USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Only owners can manage mapping records
CREATE POLICY restaurant_users_owner_all ON public.restaurant_users
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_users
      WHERE auth_user_id = auth.uid() AND is_owner = true
    )
  );

-- 4. Branches Policies
CREATE POLICY branches_tenant_all ON public.branches
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- 5. Staff Policies
CREATE POLICY staff_tenant_all ON public.staff
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_users
      WHERE auth_user_id = auth.uid()
    )
  );
