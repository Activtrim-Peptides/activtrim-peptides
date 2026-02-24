

## Enhanced Admin Panel

This is a significant upgrade to the admin panel, adding full product content management, publish/unpublish controls, and image uploads.

### What You'll Get

1. **Publish/Unpublish toggle** -- Each product will have a visible published/unpublished status (using the existing `in_stock` field). You can toggle it directly from the product list or the edit form.

2. **Full product detail editing** -- When editing a product, you'll see a tabbed interface with:
   - **Basic Info** tab: Name, price, category, description, best seller, in-stock toggle (existing fields)
   - **Content** tab: What is [Product], Key Benefits (add/remove items with title + description), Mechanism of Action, Quick Start Guide (add/remove steps), Research Indications (add/remove items), Research Protocols (add/remove rows with name/dosage/frequency/duration), What to Expect (add/remove timeline items with timeframe + description)

3. **Product image upload** -- An image upload area in the edit form that lets you pick a file, uploads it to cloud storage, and saves the URL to the product.

4. **Create/Delete** -- Already working, but will be improved with the new form layout.

### Technical Details

**Storage bucket (new migration):**
- Create a `product-images` public storage bucket
- Add RLS policies so admins can upload/delete, and anyone can view

**Admin page rewrite (`src/pages/AdminPage.tsx`):**
- Refactor the form into a tabbed layout using the existing `Tabs` component
- **Basic Info tab**: Current fields + `in_stock` toggle (Switch component) for publish/unpublish
- **Content tab**: Editable fields for all `product_details` columns:
  - `what_is` -- textarea
  - `key_benefits` -- dynamic list of {title, description} items with add/remove
  - `mechanism_of_action` -- textarea
  - `quick_start_guide` -- dynamic list of {step} items with add/remove
  - `research_indications` -- dynamic list of {indication} items with add/remove
  - `research_protocols` -- dynamic list of {name, dosage, frequency, duration} rows with add/remove
  - `what_to_expect` -- dynamic list of {timeframe, description} items with add/remove
- **Image tab**: File input with preview, uploads to `product-images` bucket, saves URL to `products.image_url`
- On save: upsert both `products` and `product_details` rows (create `product_details` if it doesn't exist yet)
- Product list items show in-stock badge and thumbnail

**Product list enhancements:**
- Show a green/red dot or badge for published (in stock) vs unpublished (out of stock)
- Quick toggle button for publish/unpublish directly in the list
- Show product image thumbnail if available

**Files changed:**
- New SQL migration: create `product-images` storage bucket with RLS policies
- `src/pages/AdminPage.tsx`: Major rewrite with tabbed form, content editing, image upload, publish toggle

