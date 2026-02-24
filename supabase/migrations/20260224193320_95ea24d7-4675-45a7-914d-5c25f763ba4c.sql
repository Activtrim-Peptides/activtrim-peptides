
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  friendly_name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-uppercase code on insert/update
CREATE OR REPLACE FUNCTION public.uppercase_promo_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := UPPER(NEW.code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_uppercase_promo_code
  BEFORE INSERT OR UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.uppercase_promo_code();

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view promo codes"
  ON public.promo_codes FOR SELECT USING (true);
CREATE POLICY "Admins can insert promo codes"
  ON public.promo_codes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update promo codes"
  ON public.promo_codes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete promo codes"
  ON public.promo_codes FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

ALTER TABLE public.orders
  ADD COLUMN promo_code TEXT,
  ADD COLUMN discount_amount NUMERIC DEFAULT 0;
