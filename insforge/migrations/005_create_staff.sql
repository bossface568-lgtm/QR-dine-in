-- QR Dine SaaS Database Migration
-- Table: staff

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

-- Indexing for tenant and branch queries
CREATE INDEX IF NOT EXISTS idx_staff_restaurant_id ON public.staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_branch_id ON public.staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_id ON public.staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON public.staff(status);
