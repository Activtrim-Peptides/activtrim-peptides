

## Promo Code Functionality (Case-Insensitive)

### 1. Database: New `promo_codes` table + orders columns

**New table `promo_codes`:**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| friendly_name | text | Admin-only label |
| code | text | Unique, stored uppercase |
| discount_type | text | "percentage" or "fixed" |
| discount_amount | numeric | The value (e.g. 20 for 20% or 10 for $10) |
| valid_from | timestamptz | Nullable (null = immediately valid) |
| valid_to | timestamptz | Nullable (null = never expires) |
| is_active | boolean | Default true |
| created_at | timestamptz | Default now() |

- Code is always stored uppercase via a trigger, and lookups use `UPPER()` so "crunch20" and "CRUNCH20" both match.
- RLS: Anyone can SELECT (for checkout validation); admins can INSERT/UPDATE/DELETE.

**Alter `orders` table:** Add `promo_code` (text, nullable) and `discount_amount` (numeric, default 0) columns.

---

### 2. Admin Page: "Promo Codes" Tab

**File: `src/pages/AdminPage.tsx`**

Add a third tab alongside Products and FAQ:
- List view showing all promo codes (name, code, discount, dates, active status)
- Add/Edit form with fields: friendly_name, code (auto-uppercased on save), discount_type dropdown, discount_amount, valid_from date, valid_to date (optional), is_active toggle
- Delete functionality

---

### 3. Checkout Page: Promo Code Input + Discount

**File: `src/pages/CheckoutPage.tsx`**

In the Order Summary card, add a promo code section above Subtotal:

```text
ORDER SUMMARY

[Items list]
-------- separator --------

Promo Code: [________] [Apply]
  "CRUNCH20 applied! 20% off"  [Remove]

Subtotal                   $109.98
  Discount (20%)           -$22.00

Shipping
  (o) USPS Priority Mail    $17.95

-------- separator --------

Total                       $105.93

[ PLACE ORDER ]
```

- Input field + "Apply" button
- On apply: query `promo_codes` where `UPPER(code) = UPPER(input)`, `is_active = true`, and date range is valid
- Case-insensitive: user can type "crunch20", "Crunch20", or "CRUNCH20" -- all work
- If invalid/expired: toast error message
- If valid: show success with discount description and a "Remove" button
- Discount applies to product subtotal only, never shipping
- `discountAmount = percentage ? min(subtotal * rate / 100, subtotal) : min(fixedAmount, subtotal)`
- `total = (subtotal - discountAmount) + shippingCost`
- On submit: save `promo_code` and `discount_amount` to the order record, include in Slack notification

---

### Technical Details

**Migration SQL:**

```sql
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  friendly_name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-uppercase code on insert/update
CREATE OR REPLACE FUNCTION uppercase_promo_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := UPPER(NEW.code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_uppercase_promo_code
  BEFORE INSERT OR UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION uppercase_promo_code();

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view promo codes"
  ON public.promo_codes FOR SELECT USING (true);
CREATE POLICY "Admins can insert promo codes"
  ON public.promo_codes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update promo codes"
  ON public.promo_codes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete promo codes"
  ON public.promo_codes FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

ALTER TABLE public.orders
  ADD COLUMN promo_code TEXT,
  ADD COLUMN discount_amount NUMERIC DEFAULT 0;
```

**Checkout validation (key logic):**

```tsx
const applyPromo = async () => {
  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .ilike("code", promoInput.trim())  // case-insensitive match
    .eq("is_active", true)
    .single();

  if (!data) { toast.error("Invalid promo code"); return; }

  const now = new Date();
  if (data.valid_from && new Date(data.valid_from) > now) { toast.error("Promo not yet active"); return; }
  if (data.valid_to && new Date(data.valid_to) < now) { toast.error("Promo code expired"); return; }

  setAppliedPromo(data);
  toast.success(`${data.code} applied!`);
};

const discountAmount = appliedPromo
  ? appliedPromo.discount_type === "percentage"
    ? Math.min(subtotal * appliedPromo.discount_amount / 100, subtotal)
    : Math.min(appliedPromo.discount_amount, subtotal)
  : 0;

const total = (subtotal - discountAmount) + shippingCost;
```

---

### Files to modify

| File | Action |
|------|--------|
| Database migration | Create `promo_codes` table with uppercase trigger, alter `orders` |
| `src/pages/AdminPage.tsx` | Add "Promo Codes" tab with CRUD |
| `src/pages/CheckoutPage.tsx` | Add promo input, discount calc, updated totals |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |

