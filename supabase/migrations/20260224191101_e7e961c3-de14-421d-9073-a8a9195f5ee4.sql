
-- Create product_variants table
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  strength_mg INTEGER NOT NULL,
  label TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Everyone can read variants
CREATE POLICY "Anyone can view product variants"
  ON public.product_variants FOR SELECT
  USING (true);

-- Admins can manage variants
CREATE POLICY "Admins can insert product variants"
  ON public.product_variants FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product variants"
  ON public.product_variants FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product variants"
  ON public.product_variants FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add variant_id to cart_items
ALTER TABLE public.cart_items
  ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- Add variant columns to order_items
ALTER TABLE public.order_items
  ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  ADD COLUMN variant_label TEXT;

-- Index for fast lookups
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
