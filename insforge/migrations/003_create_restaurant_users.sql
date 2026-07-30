-- QR Dine SaaS Database Migration
-- Table: restaurant_users

CREATE TABLE IF NOT EXISTS public.restaurant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_users_restaurant_id ON public.restaurant_users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_users_auth_user_id ON public.restaurant_users(auth_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_users_restaurant_auth ON public.restaurant_users(restaurant_id, auth_user_id);
