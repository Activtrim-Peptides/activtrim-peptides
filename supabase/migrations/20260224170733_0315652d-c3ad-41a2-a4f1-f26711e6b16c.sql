
CREATE TABLE public.faq_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.faq_sections(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view FAQ sections"
  ON public.faq_sections FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view FAQ items"
  ON public.faq_items FOR SELECT USING (true);

CREATE POLICY "Admins can insert FAQ sections"
  ON public.faq_sections FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update FAQ sections"
  ON public.faq_sections FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete FAQ sections"
  ON public.faq_sections FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert FAQ items"
  ON public.faq_items FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update FAQ items"
  ON public.faq_items FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete FAQ items"
  ON public.faq_items FOR DELETE USING (has_role(auth.uid(), 'admin'));
