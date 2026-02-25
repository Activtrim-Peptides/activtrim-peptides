
Issue diagnosis from current code and logs:
- The current admin save flow for variants in `src/pages/AdminPage.tsx` is still a destructive “delete all then insert all” pattern.
- Even with new error toasts, the flow can still behave like “not saved” because:
  1) It may fail on variant deletion/insertion edge cases, but the page still ends with a generic success toast (`Product updated`) which is misleading.
  2) It recreates all variant IDs every save, which breaks continuity for existing references (cart/order rows get `variant_id` nulled due FK `ON DELETE SET NULL`), causing downstream inconsistency.
  3) It does not preserve per-variant identity, so updates are not true updates—just replace-all writes.
- This explains the user perception that variant price edits don’t reliably persist.

Implementation plan:
1) Replace destructive variant persistence with ID-preserving sync logic in `src/pages/AdminPage.tsx`
- Keep existing `productVariants` state model (`id?`, `label`, `strength_mg`, `price`, `stock_quantity`, `sort_order`).
- In `handleSave`, for edit/create with `productId`:
  - Fetch existing variants for that product (`id` list).
  - Split form variants into:
    - `toUpdate`: rows with `id` present
    - `toInsert`: rows without `id`
  - Compute `toDelete`: existing DB variant IDs not present in submitted form IDs.
  - Perform operations in safe order:
    - Update existing variants by `id` (one-by-one or batched approach)
    - Insert new variants
    - Delete only removed variants (`.in("id", toDelete)`) instead of deleting all by `product_id`
- Preserve `sort_order` deterministically (`idx`) unless explicit value is provided.

2) Add strict validation and fail-fast behavior for variant rows
- Before writing:
  - Ensure every variant row has non-empty label
  - Ensure numeric fields are valid non-negative numbers (`strength_mg`, `price`, `stock_quantity`)
- If validation fails:
  - Show specific toast (e.g., “Variant 2 price is invalid”)
  - Abort save (do not partially write variants)

3) Make save result truthful and explicit
- Track errors across product/details/variants operations.
- Only show final success toast if all operations succeed.
- If variant save fails, return early after error and do not show “Product updated”.
- Keep `setSaving(false)` in a `finally` block to avoid stuck loading state.

4) Keep `fetchVariants` typed and stable
- Continue using `.from("product_variants")` without `as any`.
- Ensure mapping preserves IDs and normalized string values for form controls.

5) Verify behavior end-to-end after patch
- Admin scenario:
  - Open BPC-157, change 5mg and 10mg prices, save, reopen product, confirm values persisted.
  - Remove a variant and save; confirm only that removed variant is deleted.
  - Add a new variant and save; confirm it appears once.
- Storefront scenario:
  - Confirm existing cart/order items remain coherent (no unexpected duplication).
  - Confirm variant prices used in cart/checkout reflect updated variant records.

Technical notes:
- No schema migration is required for this fix.
- This is an application-layer persistence bug in admin save sequencing and error handling.
- Optional hardening (separate follow-up): add a unique DB constraint on `(product_id, label)` or `(product_id, strength_mg)` to prevent accidental duplicate variant definitions for the same product.
