

## Product Detail Pages for Each Peptide

### Overview
Create a dedicated detail page for every peptide product, accessible at `/app/product/:id`. Each page will follow the reference screenshot's structure -- a long-form, section-based layout with rich research content stored in the database.

### Database Changes

Add a new `product_details` table to store extended content per product:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| product_id | uuid (FK -> products) | One-to-one link |
| what_is | text | "What is [Peptide]?" section content |
| key_benefits | jsonb | Array of benefit items (title + description) |
| mechanism_of_action | text | Mechanism explanation |
| quick_start_guide | jsonb | Array of steps |
| research_indications | jsonb | Array of indication items |
| research_protocols | jsonb | Array of protocol entries (with dosage, frequency, duration fields) |
| what_to_expect | jsonb | Array of timeline entries (timeframe + description) |

RLS: Readable by all authenticated users (same as `products`). Admin-writable.

Seed this table with research-appropriate content for all 18 existing peptides.

### New Files

1. **`src/pages/ProductDetailPage.tsx`**
   - Fetches product from `products` joined with `product_details` by product ID (from URL param)
   - Renders the following sections in order, each in a dark card with orange-red accent icons:
     - **Header area**: Product name, category badge, price, "Add to Cart" button, and quick stats row (similar to the reference: dosage form, administration, storage temp)
     - **What is [Peptide]?** -- paragraph content with a numbered icon
     - **Key Benefits** -- grid of benefit cards
     - **Mechanism of Action** -- text content, optionally with a placeholder chart/diagram area
     - **Quick Start Guide** -- numbered step list
     - **Research Indications** -- list of indication items
     - **Research Protocols** -- table with columns for protocol name, dosage, frequency, duration
     - **What to Expect** -- timeline-style list with timeframes
   - Sidebar (desktop): Product price card with "Add to Cart", category, stock status, and related products from the same category
   - Fully responsive (single column on mobile, two-column on desktop)
   - Dark theme consistent with the rest of the site

2. **`src/components/ProductDetailSection.tsx`** (optional helper)
   - Reusable section wrapper with numbered icon, title, and content slot -- matching the reference's numbered section style

### Routing Update

In `src/App.tsx`, add inside the `/app` route group:
```
<Route path="product/:id" element={<ProductDetailPage />} />
```

### Navigation / Linking

- Update `ProductCard.tsx` to make the product name/image area clickable, linking to `/app/product/:id`
- Add a "View Details" link or make the card itself navigable (while keeping the "Add to Cart" button functional without navigating)

### Technical Details

- Use `useParams()` to extract the product ID from the URL
- Single Supabase query joining `products` with `product_details` via `product_id`
- Loading skeleton while data fetches
- 404-style fallback if product not found
- SEO: Use `react-helmet-async` to set page title to the peptide name
- Related products: query 3-4 products from the same category (excluding current)

### Migration SQL Summary

```text
1. CREATE TABLE product_details (with all columns above, FK to products)
2. Enable RLS -- authenticated read, admin write
3. INSERT seed data for all 18 peptides with realistic research content
```

