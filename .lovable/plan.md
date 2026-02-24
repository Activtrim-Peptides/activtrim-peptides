

## Add Section Visibility Toggles

Add per-section publish/unpublish toggles so you can control which content sections appear on each product's detail page.

### What Changes

**1. Database Migration -- Add visibility columns to `product_details`**

Add boolean columns for each toggleable section, all defaulting to `true` (published):

- `show_what_is` (boolean, default true)
- `show_key_benefits` (boolean, default true)
- `show_mechanism_of_action` (boolean, default true)
- `show_quick_start_guide` (boolean, default true)
- `show_research_indications` (boolean, default true)
- `show_research_protocols` (boolean, default true)
- `show_what_to_expect` (boolean, default true)
- `show_image` (boolean, default true)

**2. Admin Panel (`src/pages/AdminPage.tsx`)**

- Add a Switch toggle next to each section header in the Content tab (e.g., "What is [Product]?" gets a toggle beside it)
- Add a Switch toggle in the Image tab to control image visibility
- Store toggle states in the form and save them to `product_details` on submit
- Sections that are toggled off will still be editable in admin (so you can prepare content before publishing), but won't show on the frontend

**3. Product Detail Page (`src/pages/ProductDetailPage.tsx`)**

- Update each section's conditional rendering to also check the corresponding `show_*` flag
- For example, the "What is" section currently checks `details?.what_is` -- it will also require `details?.show_what_is !== false`
- Same logic for image display

### Technical Details

**Migration SQL:**
```sql
ALTER TABLE public.product_details
  ADD COLUMN show_what_is boolean NOT NULL DEFAULT true,
  ADD COLUMN show_key_benefits boolean NOT NULL DEFAULT true,
  ADD COLUMN show_mechanism_of_action boolean NOT NULL DEFAULT true,
  ADD COLUMN show_quick_start_guide boolean NOT NULL DEFAULT true,
  ADD COLUMN show_research_indications boolean NOT NULL DEFAULT true,
  ADD COLUMN show_research_protocols boolean NOT NULL DEFAULT true,
  ADD COLUMN show_what_to_expect boolean NOT NULL DEFAULT true,
  ADD COLUMN show_image boolean NOT NULL DEFAULT true;
```

**Admin Content tab layout (per section):**
```text
+--------------------------------------------------+
| What is [Product]?                    [Toggle On] |
| +----------------------------------------------+ |
| | Textarea content...                          | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

**Files changed:**
- New SQL migration: add `show_*` columns to `product_details`
- `src/pages/AdminPage.tsx`: Add toggle switches per section
- `src/pages/ProductDetailPage.tsx`: Check `show_*` flags before rendering sections

