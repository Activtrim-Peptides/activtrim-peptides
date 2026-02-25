

## Remove Authentication Gate -- Make the Store Public

### What Changes

Right now, every page except the landing page requires login. We'll open up the entire store so anyone can browse products, view details, read FAQs, and contact you -- no login required. Login will only be needed when someone tries to add items to their cart or check out.

### How It Works

**1. Route restructuring (src/App.tsx)**
- Remove the `ProtectedRoute` wrapper from the main `/app` layout
- Redirect `/` directly to `/app/home` (skip the separate landing page)
- Keep `/login` and `/register` routes available for when users need to sign in
- Admin page (`/app/admin`) stays protected -- only admins can access it

**2. Header updates (src/components/AppHeader.tsx)**
- Show a "Sign In" link instead of "Log Out" when no user is logged in
- Hide the admin shield icon for non-logged-in visitors
- Cart icon stays visible; clicking it when not logged in will prompt sign-in

**3. Cart behavior (src/hooks/useCart.tsx)**
- When a guest clicks "Add to Cart," show a toast message prompting them to sign in first
- Cart operations (add, remove, update) gracefully handle the no-user state

**4. Contact page (src/pages/ContactPage.tsx)**
- Remove the requirement for a logged-in user
- Make `user_id` optional in the database insert (store it if available, null if guest)
- Update the RLS policy to allow anonymous inserts (or use the service role via edge function)

**5. Database: Update contact_inquiries RLS**
- Allow unauthenticated inserts so guests can submit contact forms
- Make `user_id` column nullable

**6. Checkout page (src/pages/CheckoutPage.tsx)**
- If a user reaches checkout without being signed in, redirect them to `/login` with a return URL

### Files to Modify
- `src/App.tsx` -- restructure routes, remove ProtectedRoute from main layout
- `src/components/AppHeader.tsx` -- conditional sign-in/sign-out button
- `src/hooks/useCart.tsx` -- handle guest "add to cart" with sign-in prompt
- `src/pages/ContactPage.tsx` -- remove user requirement
- `src/pages/CheckoutPage.tsx` -- redirect to login if not authenticated
- `src/components/ProtectedRoute.tsx` -- keep for admin-only use
- Database migration -- make `user_id` nullable on `contact_inquiries`, update RLS

### What Stays Protected
- Admin panel (still requires admin role)
- Cart operations and checkout (requires login -- users are prompted to sign in)

