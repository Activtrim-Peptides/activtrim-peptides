ALTER TABLE public.product_details
  ADD COLUMN show_what_is boolean NOT NULL DEFAULT true,
  ADD COLUMN show_key_benefits boolean NOT NULL DEFAULT true,
  ADD COLUMN show_mechanism_of_action boolean NOT NULL DEFAULT true,
  ADD COLUMN show_quick_start_guide boolean NOT NULL DEFAULT true,
  ADD COLUMN show_research_indications boolean NOT NULL DEFAULT true,
  ADD COLUMN show_research_protocols boolean NOT NULL DEFAULT true,
  ADD COLUMN show_what_to_expect boolean NOT NULL DEFAULT true,
  ADD COLUMN show_image boolean NOT NULL DEFAULT true;