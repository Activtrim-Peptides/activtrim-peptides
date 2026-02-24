

## Make Product Quick Stats Editable from Admin

The three info items at the bottom of the product header card (currently hardcoded as "Lyophilized / Dosage Form", "Subcutaneous / Administration", "2-8C / Storage") will become database-driven, editable per product from the admin panel.

### What Changes

**1. Database -- Add `quick_stats` column to `product_details`**

Add a JSONB column `quick_stats` to `product_details` storing an array of 3 items. Each item has:
- `heading` (e.g. "Typical Dosage")
- `details` (e.g. "Lyophilized")
- `description` (e.g. "Powdered form for reconstitution")
- `is_published` (boolean, default true)

Default value: empty JSON array `[]`

**2. Admin Panel (`src/pages/AdminPage.tsx`)**

- Add `quick_stats` to the `ProductDetails` interface and form state
- Add a new "Quick Stats" section in the Content tab with 3 fixed slots, each showing:
  - Heading input (labeled "Heading" in admin only)
  - Details input (labeled "Details" in admin only)
  - Description input (labeled "Description" in admin only)
  - Publish/unpublish toggle
- Save the array to `product_details.quick_stats`

**3. Product Detail Page (`src/pages/ProductDetailPage.tsx`)**

- Read `quick_stats` from `details`
- Replace the hardcoded 3-item grid with a dynamic render from the array
- Only show items where `is_published` is true
- Display: heading in **bold**, details below it, description below that -- no "Heading"/"Details"/"Description" labels on the frontend
- Keep the same icon set (Beaker, Syringe, Thermometer) mapped to positions 1/2/3

### Technical Details

**Migration SQL:**
```sql
ALTER TABLE public.product_details
  ADD COLUMN quick_stats jsonb NOT NULL DEFAULT '[]'::jsonb;
```

**Data structure per item:**
```json
{
  "heading": "Typical Dosage",
  "details": "Lyophilized",
  "description": "Powdered form requiring reconstitution",
  "is_published": true
}
```

**Frontend rendering (no labels, just the values):**
```text
+--icon--+
| **Typical Dosage**   (bold heading)
| Lyophilized          (details text)
| Powdered form...     (description text)
```

**Admin rendering (with labeled inputs):**
```text
+------------------------------------------+
| Quick Stat 1                  [Toggle On] |
| Heading:     [Typical Dosage           ]  |
| Details:     [Lyophilized              ]  |
| Description: [Powdered form...         ]  |
+------------------------------------------+
```

### Files Changed

- New SQL migration: add `quick_stats` JSONB column to `product_details`
- `src/pages/AdminPage.tsx`: Add Quick Stats editor in Content tab
- `src/pages/ProductDetailPage.tsx`: Replace hardcoded stats with dynamic rendering from database
