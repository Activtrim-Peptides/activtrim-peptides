

## Multi-Strength Product Variants + Best Seller Badge Fix

### Overview

Products will support multiple strength options (e.g., 5mg, 10mg) each with their own price and stock. The smallest strength is always selected by default. Strength selector buttons will appear on the Shop page (ProductCard) and Product Detail page. The Best Seller badge positioning will also be fixed to stop overlapping the category badge.

---

### 1. Database Changes

**New table: `product_variants`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| product_id | uuid | FK to products.id, NOT NULL |
| strength_mg | integer | e.g. 5, 10, 15 |
| label | text | Display label e.g. "5mg", "10mg" |
| price | numeric | Price for this variant |
| stock_quantity | integer | Stock for this variant, default 0 |
| sort_order | integer | For ordering buttons, default 0 |
| created_at | timestamptz | default now() |

RLS: Authenticated users can SELECT; admins can INSERT/UPDATE/DELETE.

**Modify `cart_items`**: Add nullable `variant_id` (uuid) column referencing product_variants.id. Existing cart items without a variant will still work.

**Modify `order_items`**: Add nullable `variant_id` (uuid) and `variant_label` (text) columns so orders record which strength was purchased.

---

### 2. Product Card Changes (Shop page, Best Sellers page)

**File: `src/components/ProductCard.tsx`**

- Fetch variants for each product (or receive them as props from parent query).
- Show small pill/toggle buttons for each strength above the price (e.g., `5mg | 10mg`).
- Default to the first (smallest sort_order) variant.
- Price display updates when a different strength is selected.
- "Add to Cart" passes the selected variant_id.
- Move the "Best Seller" badge below the category badge or offset it so they don't overlap. Adjust positioning from `right-3 top-3` to `right-3 top-10` (or use a different layout approach).

---

### 3. Product Detail Page Changes

**File: `src/pages/ProductDetailPage.tsx`**

- Fetch product_variants for the product.
- Display strength selector buttons in the header card (next to or above the price).
- Price updates dynamically when selecting a different strength.
- "Add to Cart" passes the selected variant_id.
- Sidebar purchase card also shows the strength selector and dynamic price.

---

### 4. Cart System Changes

**File: `src/hooks/useCart.tsx`**

- Update `addToCart` signature: `addToCart(productId: string, variantId?: string)`.
- Cart items with different variants of the same product are treated as separate line items.
- `fetchCart` query joins `product_variants` to get variant label for display.
- Update `CartItem` interface to include optional `variant` info (label, price).
- Subtotal calculation uses variant price when available, falls back to product price.

**File: `src/components/CartDrawer.tsx`**

- Display variant label (e.g., "10mg") next to product name in cart items.
- Use variant price for line item totals.

---

### 5. Checkout Changes

**File: `src/pages/CheckoutPage.tsx`**

- Display variant label next to product name in the order summary.
- When creating order_items, include variant_id and variant_label.
- Use variant price for price_at_time.

---

### 6. Shop Page + Best Sellers Page Changes

**Files: `src/pages/ShopPage.tsx`, `src/pages/BestSellersPage.tsx`**

- Update product queries to also fetch product_variants (via a joined query or separate query).
- Pass variants to ProductCard as a prop.
- Products without variants still display their base price with no strength selector.

---

### 7. Admin Page Changes

**File: `src/pages/AdminPage.tsx`**

- Add a "Variants" section to the product edit form (new tab or within Basic Info).
- Allow adding/removing strength variants with fields: label, strength_mg, price, stock_quantity, sort_order.
- CRUD operations against product_variants table.

---

### 8. Best Seller Badge Fix

**File: `src/components/ProductCard.tsx`**

The badge currently uses `absolute right-3 top-3` which collides with the category badge. Fix by either:
- Moving it to `right-3 top-10` to sit below the category area, or
- Placing it inline after the category badge (non-absolute positioning).

The inline approach is cleaner: remove the absolute positioning and place the Best Seller badge next to the category badge in the card content flow.

---

### Summary of files to create/modify

| File | Action |
|------|--------|
| Database migration | Create `product_variants` table, alter `cart_items` and `order_items` |
| `src/components/ProductCard.tsx` | Add strength selector, fix badge overlap |
| `src/pages/ProductDetailPage.tsx` | Add strength selector, dynamic price |
| `src/hooks/useCart.tsx` | Support variant_id in cart operations |
| `src/components/CartDrawer.tsx` | Show variant label |
| `src/pages/ShopPage.tsx` | Fetch and pass variants |
| `src/pages/BestSellersPage.tsx` | Fetch and pass variants |
| `src/pages/CheckoutPage.tsx` | Show variant label, save variant in order |
| `src/pages/AdminPage.tsx` | Variant CRUD in product editor |

