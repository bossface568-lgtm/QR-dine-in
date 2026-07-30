-- QR Dine SaaS Database Migration
-- Table: branches

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

-- Indexing for tenant queries
CREATE INDEX IF NOT EXISTS idx_branches_restaurant_id ON public.branches(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON public.branches(is_active);

-- Updated_at trigger execution
DROP TRIGGER IF EXISTS trigger_branches_updated_at ON public.branches;
CREATE TRIGGER trigger_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
