

## Fix: Products Not Visible to Guests

### Problem

The `products` table has a SELECT policy that only allows **authenticated** users to view products. After removing the login requirement, guests browsing the shop see "No products found" because anonymous requests are blocked by this policy.

### Solution

Update the RLS SELECT policy on the `products` table from `roles: {authenticated}` to `roles: {public}` (allowing both anonymous and authenticated access). The data is non-sensitive (product catalog), so public read access is appropriate.

### Database Migration

```sql
DROP POLICY "Authenticated users can view products" ON public.products;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);
```

This single migration fixes the shop page, best sellers page, categories page, home page product listings, and product detail pages -- all of which query the `products` table.

### Files Modified
- One database migration (no code file changes needed)

