
## Fix: Publish/Unpublish Toggle Not Filtering Products

The problem is that the shop page and home page queries fetch **all products** from the database without checking the `in_stock` (published) flag. When you toggle a product to "Draft" in the admin panel, the database value updates correctly, but the storefront pages never filter on that column.

### Changes

**1. `src/pages/ShopPage.tsx`**
Add `.eq("in_stock", true)` to the product query so only published products appear in the shop.

**2. `src/pages/HomePage.tsx`**
Add `.eq("in_stock", true)` to the best sellers query so draft products don't appear on the home page.

**3. `src/pages/BestSellersPage.tsx`**
Add `.eq("in_stock", true)` to filter out unpublished products from the best sellers page as well.

### Technical Detail
Each page builds a query like:
```typescript
supabase.from("products").select("*")...
```
A single `.eq("in_stock", true)` filter will be appended before the query executes, ensuring only published products are returned to non-admin users.

No database changes are needed -- the toggle already correctly updates `in_stock` in the database.
