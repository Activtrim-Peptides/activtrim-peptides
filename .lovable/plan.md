

## Bug Fix: Cart Unique Constraint Blocking Different Variants

### Problem

The `cart_items` table has a unique constraint on `(user_id, product_id)` that was created before the variant system existed. This means the database only allows **one row per product per user**, regardless of which variant is selected. When you add BPC-157 5mg and then try to add BPC-157 10mg, the database insert silently fails because it violates this constraint.

### Fix

**Database migration** -- Drop the old unique constraint and create a new one that includes `variant_id`:

```sql
ALTER TABLE public.cart_items
  DROP CONSTRAINT cart_items_user_id_product_id_key;

CREATE UNIQUE INDEX cart_items_user_product_variant_key
  ON public.cart_items (user_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'));
```

Using `COALESCE` ensures that items without a variant (where `variant_id` is NULL) still get proper uniqueness handling, since NULL values are not considered equal in unique indexes.

No frontend code changes are needed -- the cart logic already correctly distinguishes items by variant. The database constraint was the sole blocker.

### Files to modify

| File | Action |
|------|--------|
| Database migration | Drop old unique constraint, create new one including variant_id |

