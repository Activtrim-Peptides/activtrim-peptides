## Add Orders Dashboard to Admin Panel

### Problem
Right now there is no way to see how many people purchased or completed checkout. Orders exist in the database, but the admin panel only has Products, FAQ, and Promo Codes tabs.

### Solution
Add a new **Orders** tab to the admin panel that shows purchase and checkout metrics and a list of every order.

### What you'll see
- Total orders
- Total revenue (sum of order subtotals)
- Average order value
- Recent orders table with:
  - Order ID
  - Customer name and email
  - Shipping address
  - Order total
  - Status
  - Date
  - Line items (product names, quantities, prices)

### Implementation

1. **Add an "orders" tab to `src/pages/AdminPage.tsx`**
   - Extend the `adminTab` state to include `"orders"`
   - Add a `<TabsTrigger value="orders">Orders</TabsTrigger>`

2. **Create order dashboard state and fetcher**
   - Fetch orders with related items and product names:
     ```typescript
     supabase
       .from("orders")
       .select("*, order_items(id, quantity, price_at_time, products(name), variant_label)")
       .order("created_at", { ascending: false });
     ```
   - Compute totals: count, revenue, average order value

3. **Render the Orders tab**
   - Summary cards at the top (total orders, total revenue, average order value)
   - Table of recent orders below
   - Expandable rows or a modal to show line items per order

### Files changed
- `src/pages/AdminPage.tsx`

### Notes
- The current checkout creates every order with status `"pending"`. The dashboard will treat every created order as a purchase/checkout completion. If you later add payment success/failure handling, we can update statuses and filter by `"completed"`.
- No database migration is needed; the data already exists in `public.orders` and `public.order_items`.