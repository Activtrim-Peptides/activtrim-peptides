DROP POLICY "Authenticated users can view products" ON public.products;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);