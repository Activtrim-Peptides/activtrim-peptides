
ALTER TABLE public.products ADD COLUMN slug text UNIQUE;

-- Generate slugs from existing product names
UPDATE public.products SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
