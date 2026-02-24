ALTER TABLE public.product_details
  ADD COLUMN quick_stats jsonb NOT NULL DEFAULT '[]'::jsonb;