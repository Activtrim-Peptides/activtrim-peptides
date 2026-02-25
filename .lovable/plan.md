

## Fix: Variant Duplication Bug in Admin Panel

### Root Cause

In `handleSave()` (line 338), the variant delete call uses `as any` type casting and has zero error handling:

```ts
await supabase.from("product_variants" as any).delete().eq("product_id", productId);
```

The `as any` cast is unnecessary (the table IS in the generated types) and the delete failure is completely swallowed. Every save blindly inserts new variants without confirming old ones were removed, causing exponential duplication.

### Fix

**1. Clean up existing duplicate data in the database**

Delete all duplicate BPC-157 variants, keeping only one of each (5mg and 10mg) at the correct prices.

**2. Fix `src/pages/AdminPage.tsx` -- variant save logic (lines 336-349)**

Replace the fragile delete-all-then-insert approach with a smarter strategy:

- Remove all `as any` casts on `product_variants` queries (the table exists in the types)
- Add error handling to the delete call
- Use a two-step approach: first delete variants by product_id, verify it succeeded, then insert new ones
- If delete fails, abort the variant save and show an error toast

```ts
// Save variants -- delete existing first, with error checking
const { error: delErr } = await supabase
  .from("product_variants")
  .delete()
  .eq("product_id", productId);

if (delErr) {
  toast.error("Failed to update variants: " + delErr.message);
} else if (productVariants.length > 0) {
  const variantPayloads = productVariants.map((v, idx) => ({
    product_id: productId,
    label: v.label,
    strength_mg: parseInt(v.strength_mg) || 0,
    price: parseFloat(v.price) || 0,
    stock_quantity: parseInt(v.stock_quantity) || 0,
    sort_order: parseInt(v.sort_order) || idx,
  }));
  await supabase.from("product_variants").insert(variantPayloads);
}
```

Also remove `as any` from `fetchVariants` (line 372) and any other `product_variants` queries in the file.

### Files to modify

| File | Action |
|------|--------|
| Database (data cleanup) | Delete 14 duplicate BPC-157 variants, keep 2 |
| `src/pages/AdminPage.tsx` | Remove `as any` casts, add error handling to variant delete/insert |

