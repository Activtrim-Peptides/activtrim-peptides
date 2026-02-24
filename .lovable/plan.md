

## Add FAQ Management to Admin Panel

Currently, FAQs are hardcoded in `src/pages/FAQPage.tsx`. This plan moves them to the database so you can create, edit, delete, and publish/unpublish FAQ items from the admin panel.

### What Changes

**1. Database -- Two new tables**

- **`faq_sections`** -- Stores FAQ category headers (e.g., "General Research Questions")
  - `id` (uuid, primary key)
  - `title` (text) -- section name
  - `sort_order` (integer, default 0) -- controls display order
  - `is_published` (boolean, default true) -- publish/unpublish toggle
  - `created_at` (timestamp)

- **`faq_items`** -- Stores individual Q&A pairs
  - `id` (uuid, primary key)
  - `section_id` (uuid, foreign key to `faq_sections`)
  - `question` (text)
  - `answer` (text)
  - `sort_order` (integer, default 0) -- controls display order within section
  - `is_published` (boolean, default true) -- publish/unpublish toggle
  - `created_at` (timestamp)

- RLS policies: Admins get full CRUD; authenticated users get read-only access to published items.

**2. Seed existing FAQ data**

Insert the current hardcoded FAQ sections and items into the new tables so nothing is lost.

**3. Admin Panel (`src/pages/AdminPage.tsx`)**

Add a new top-level tab (alongside the product management) or a dedicated section for FAQ management with:

- List of FAQ sections with expand/collapse to see items
- Create/edit/delete sections
- Create/edit/delete individual Q&A items within each section
- Publish/unpublish toggle for both sections and individual items
- Drag or sort-order input to control display order

**4. FAQ Page (`src/pages/FAQPage.tsx`)**

- Remove the hardcoded `faqSections` array
- Fetch sections and items from the database on load
- Only show sections where `is_published = true` and items where `is_published = true`
- Order by `sort_order`

### Technical Details

**Migration SQL:**
```sql
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

-- Read access for authenticated users
CREATE POLICY "Authenticated users can view published FAQ sections"
  ON public.faq_sections FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view published FAQ items"
  ON public.faq_items FOR SELECT USING (true);

-- Admin full access
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
```

**Seed data** (separate insert migration with all current hardcoded Q&As).

**Admin UI approach:**
- A new "FAQ" tab in the admin panel alongside product management
- Each section shown as an expandable card with its items listed inside
- Inline editing for questions and answers
- Toggle switches for publish/unpublish on both sections and items
- Numeric sort order field to control ordering

**FAQ page query:**
```typescript
const { data: sections } = await supabase
  .from("faq_sections")
  .select("*, faq_items(*)")
  .eq("is_published", true)
  .order("sort_order");
// Then filter faq_items client-side for is_published = true
```

### Files Changed

- New SQL migration: create `faq_sections` and `faq_items` tables with RLS
- New SQL migration: seed existing FAQ data
- `src/pages/AdminPage.tsx`: Add FAQ management tab with CRUD and publish toggles
- `src/pages/FAQPage.tsx`: Replace hardcoded data with database queries

