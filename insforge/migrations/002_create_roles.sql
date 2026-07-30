-- QR Dine SaaS Database Migration
-- Table: roles

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_roles_restaurant_id ON public.roles(restaurant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_restaurant_name ON public.roles(restaurant_id, name);
