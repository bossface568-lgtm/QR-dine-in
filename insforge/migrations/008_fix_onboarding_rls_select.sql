-- ============================================================
-- FIX ONBOARDING RLS SELECT PERMISSIONS
-- Allows authenticated users to SELECT inserted rows during onboarding
-- ============================================================

-- Drop restrictive select policies
DROP POLICY IF EXISTS restaurants_tenant_select ON public.restaurants;
DROP POLICY IF EXISTS restaurants_select_policy ON public.restaurants;

DROP POLICY IF EXISTS roles_tenant_select ON public.roles;
DROP POLICY IF EXISTS roles_select_policy ON public.roles;

DROP POLICY IF EXISTS restaurant_users_tenant_select ON public.restaurant_users;
DROP POLICY IF EXISTS restaurant_users_select_policy ON public.restaurant_users;

DROP POLICY IF EXISTS branches_tenant_select ON public.branches;
DROP POLICY IF EXISTS branches_select_policy ON public.branches;

DROP POLICY IF EXISTS staff_tenant_select ON public.staff;
DROP POLICY IF EXISTS staff_select_policy ON public.staff;

-- 1. Restaurants: Public active lookup + authenticated select
CREATE POLICY restaurants_select_policy ON public.restaurants
  FOR SELECT USING (
    status = 'active'
    OR auth.uid() IS NOT NULL
  );

-- 2. Roles: Authenticated select
CREATE POLICY roles_select_policy ON public.roles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- 3. Restaurant Users: Own user mapping OR tenant members
CREATE POLICY restaurant_users_select_policy ON public.restaurant_users
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR restaurant_id IN (SELECT public.get_my_restaurant_ids())
  );

-- 4. Branches: Active branch lookup + authenticated select
CREATE POLICY branches_select_policy ON public.branches
  FOR SELECT USING (
    is_active = true
    OR auth.uid() IS NOT NULL
  );

-- 5. Staff: Authenticated select
CREATE POLICY staff_select_policy ON public.staff
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );
