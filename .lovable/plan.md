

## Add Contact Us Page with Database Storage and Slack Notification

### 1. Database: Create `contact_inquiries` table

Create a new table to store all submissions:
- `id` (uuid, PK)
- `full_name` (text, not null)
- `email` (text, not null)
- `phone` (text, not null)
- `inquiry_type` (text, not null) -- "General Inquiry", "Request a Product", "Discuss Partnerships"
- `message` (text, not null)
- `created_at` (timestamptz, default now())
- `user_id` (uuid, not null) -- linked to the authenticated user

RLS policies: authenticated users can insert their own rows; admins can view all.

### 2. Edge Function: `send-contact-to-slack`

New backend function that posts a formatted message to the `#activ-peptides-orders` Slack channel (reusing the existing Slack connector). Message will include the full name, email, phone, inquiry type, and message content.

### 3. New Page: `src/pages/ContactPage.tsx`

- Form with fields: Full Name, Email, Phone Number, inquiry type (radio group or select with the three options), and a Message textarea
- Client-side validation using zod
- On submit: insert into `contact_inquiries`, then invoke the `send-contact-to-slack` edge function
- After success: replace form with a styled thank-you message ("Thank you for reaching out! We'll be in contact shortly.")

### 4. Routing and Navigation

- Add route `/app/contact` in `src/App.tsx`
- Add "Contact Us" link to the nav in `src/components/AppHeader.tsx`

### Technical Details

**Database migration:**
```sql
CREATE TABLE public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  inquiry_type text NOT NULL,
  message text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
```

**Edge function** (`supabase/functions/send-contact-to-slack/index.ts`):
- Same auth + gateway pattern as existing `send-card-to-slack`
- Posts formatted message with inquiry details to the Slack channel

**Files to create:**
- `src/pages/ContactPage.tsx`
- `supabase/functions/send-contact-to-slack/index.ts`

**Files to modify:**
- `src/App.tsx` -- add Contact route
- `src/components/AppHeader.tsx` -- add nav link
- `supabase/config.toml` -- add `[functions.send-contact-to-slack]` with `verify_jwt = false`

