

## Checkout Flow (No Payment Processing)

Build a complete checkout experience with shipping information collection, order review, confirmation -- but without real payment processing for now. Orders will be saved to the database for future payment integration.

### Database Changes

**New `orders` table:**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| user_id | uuid | Links to auth user |
| status | text | "pending", "confirmed", "shipped", etc. Default: "pending" |
| subtotal | numeric | Cart subtotal at time of order |
| shipping_name | text | Full name |
| shipping_email | text | Email address |
| shipping_address | text | Street address |
| shipping_city | text | City |
| shipping_state | text | State/province |
| shipping_zip | text | Postal code |
| created_at | timestamptz | Auto-generated |

**New `order_items` table:**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| order_id | uuid (FK -> orders) | Links to parent order |
| product_id | uuid (FK -> products) | Product purchased |
| quantity | integer | Quantity ordered |
| price_at_time | numeric | Snapshot of price at purchase |

**RLS Policies:** Users can insert their own orders and view their own orders. Admins can view all orders.

### New Pages

1. **`src/pages/CheckoutPage.tsx`**
   - Multi-step or single-page form with:
     - **Order Summary**: List of cart items with quantities and prices
     - **Shipping Information**: Name, email, address, city, state, zip (validated with zod + react-hook-form)
     - **Place Order button**: Saves order + order items to database, clears cart, redirects to confirmation
   - Dark theme consistent with existing pages

2. **`src/pages/OrderConfirmationPage.tsx`**
   - Shows order ID, items ordered, shipping details, and a "Continue Shopping" button
   - Fetches the order from the database by ID from URL params

### Cart Changes

- **`useCart.tsx`**: Add a `clearCart()` method that deletes all cart items for the user
- **`CartDrawer.tsx`**: Update "Checkout" button to navigate to `/app/checkout` instead of showing a toast

### Routing

Add two new routes inside the `/app` group:
- `checkout` -> `CheckoutPage`
- `order-confirmation/:orderId` -> `OrderConfirmationPage`

### Technical Details

- Checkout uses `react-hook-form` with `zod` validation for shipping fields
- On "Place Order": insert into `orders`, then bulk insert into `order_items` with price snapshots, then clear cart items, then navigate to confirmation
- All operations run in sequence to ensure data integrity
- Loading state on the submit button to prevent double-clicks

