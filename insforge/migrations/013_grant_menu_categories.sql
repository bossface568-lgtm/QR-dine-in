-- ============================================================
-- 013: Grant privileges on menu_categories to BaaS roles
-- ============================================================

GRANT ALL ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_categories TO anon;
GRANT ALL ON public.menu_categories TO service_role;
GRANT ALL ON public.menu_categories TO public;

-- Grant sequence permissions if any
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, public;

-- Trigger PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
