-- ============================================================
-- QR Dine SaaS Database Migration 009
-- Add extended branch management fields
-- ============================================================

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS branch_code TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS business_days JSONB DEFAULT '["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]'::jsonb,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';

-- Indexing for fast branch filtering
CREATE INDEX IF NOT EXISTS idx_branches_is_default ON public.branches(is_default);
CREATE INDEX IF NOT EXISTS idx_branches_is_archived ON public.branches(is_archived);
CREATE INDEX IF NOT EXISTS idx_branches_branch_code ON public.branches(branch_code);

-- Set default branch for existing restaurants that don't have a default set yet
UPDATE public.branches 
SET is_default = true 
WHERE id IN (
  SELECT DISTINCT ON (restaurant_id) id 
  FROM public.branches 
  ORDER BY restaurant_id, created_at ASC
)
AND NOT EXISTS (
  SELECT 1 FROM public.branches b2 WHERE b2.restaurant_id = branches.restaurant_id AND b2.is_default = true
);
