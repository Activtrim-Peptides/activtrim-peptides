
-- Make user_id nullable on contact_inquiries
ALTER TABLE public.contact_inquiries ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert their own inquiries" ON public.contact_inquiries;

-- Allow anyone (including anon) to insert contact inquiries
CREATE POLICY "Anyone can insert inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (true);
