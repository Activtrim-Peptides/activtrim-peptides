ALTER TABLE public.cart_items
  DROP CONSTRAINT cart_items_user_id_product_id_key;

CREATE UNIQUE INDEX cart_items_user_product_variant_key
  ON public.cart_items (user_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'));