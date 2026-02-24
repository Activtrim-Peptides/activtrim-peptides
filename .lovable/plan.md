

## Add Product Quantity / Stock Management

Track how many units of each product are available, show this in the admin panel only, deduct on purchase, and disable "Add to Cart" when stock reaches 0.

### Changes

**1. Database Migration -- Add `stock_quantity` column to `products`**

Add an integer column `stock_quantity` defaulting to `0` (so existing products start at 0 and need to be set by admin).

```sql
ALTER TABLE public.products
  ADD COLUMN stock_quantity integer NOT NULL DEFAULT 0;
```

**2. Admin Panel (`src/pages/AdminPage.tsx`)**

- Add `stock_quantity` to the `Product` interface and the form state.
- Add a "Quantity Available" number input in the Basic Info tab (next to the price field).
- Include `stock_quantity` in the save payload.
- Display the current quantity in the product list table so you can see it at a glance.

**3. Checkout Flow (`src/pages/CheckoutPage.tsx`)**

- After successfully creating the order and order items, deduct the purchased quantity from each product's `stock_quantity` using an update query:
  ```
  For each cart item: UPDATE products SET stock_quantity = stock_quantity - item.quantity WHERE id = item.product_id
  ```
- This runs after the order is confirmed, before clearing the cart.

**4. Product Card (`src/components/ProductCard.tsx`)**

- Accept `stock_quantity` as a prop.
- When `stock_quantity <= 0`, change the "Add to Cart" button to read **"Out of Stock"**, disable it, and style it as a muted/disabled button.

**5. Product Detail Page (`src/pages/ProductDetailPage.tsx`)**

- Check `product.stock_quantity` and disable/relabel the "Add to Cart" buttons (both mobile and sidebar) to "Out of Stock" when quantity is 0.

**6. Cart Drawer (`src/components/CartDrawer.tsx`)**

- No changes needed here since items already in cart were added when stock was available.

### Files Changed

- New SQL migration: add `stock_quantity` column
- `src/pages/AdminPage.tsx`: quantity input in form + display in list
- `src/pages/CheckoutPage.tsx`: deduct stock after order
- `src/components/ProductCard.tsx`: disable button at 0 stock
- `src/pages/ProductDetailPage.tsx`: disable button at 0 stock

