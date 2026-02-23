
-- Create product_details table
CREATE TABLE public.product_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  what_is TEXT NOT NULL DEFAULT '',
  key_benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  mechanism_of_action TEXT NOT NULL DEFAULT '',
  quick_start_guide JSONB NOT NULL DEFAULT '[]'::jsonb,
  research_indications JSONB NOT NULL DEFAULT '[]'::jsonb,
  research_protocols JSONB NOT NULL DEFAULT '[]'::jsonb,
  what_to_expect JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "Authenticated users can view product details"
  ON public.product_details FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can insert product details"
  ON public.product_details FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product details"
  ON public.product_details FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product details"
  ON public.product_details FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
