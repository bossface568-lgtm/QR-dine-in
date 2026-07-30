-- ============================================================
-- FIX RLS INFINITE RECURSION
-- SECURITY DEFINER helper functions to break policy recursion
-- ============================================================

-- Helper function to fetch user's mapped restaurant IDs without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_restaurant_ids()
RETURNS SETOF UUID AS $$
  SELECT restaurant_id FROM public.restaurant_users WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper function to check if current user is owner of a restaurant without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(target_restaurant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_users
    WHERE restaurant_id = target_restaurant_id
      AND auth_user_id = auth.uid()
      AND is_owner = true
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Drop recursive policies
DROP POLICY IF EXISTS restaurants_tenant_select ON public.restaurants;
DROP POLICY IF EXISTS restaurants_owner_update ON public.restaurants;
DROP POLICY IF EXISTS restaurants_owner_delete ON public.restaurants;

DROP POLICY IF EXISTS roles_tenant_select ON public.roles;
DROP POLICY IF EXISTS roles_owner_update ON public.roles;
DROP POLICY IF EXISTS roles_owner_delete ON public.roles;

DROP POLICY IF EXISTS restaurant_users_tenant_select ON public.restaurant_users;
DROP POLICY IF EXISTS restaurant_users_owner_update ON public.restaurant_users;
DROP POLICY IF EXISTS restaurant_users_owner_delete ON public.restaurant_users;

DROP POLICY IF EXISTS branches_tenant_select ON public.branches;
DROP POLICY IF EXISTS branches_owner_update ON public.branches;
DROP POLICY IF EXISTS branches_owner_delete ON public.branches;

DROP POLICY IF EXISTS staff_tenant_select ON public.staff;
DROP POLICY IF EXISTS staff_owner_update ON public.staff;
DROP POLICY IF EXISTS staff_owner_delete ON public.staff;

-- 1. Restaurants
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

-- 2. Roles
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

-- 3. Restaurant Users
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

-- 4. Branches
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

-- 5. Staff
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
