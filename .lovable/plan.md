

## Three Changes: Toast Position, Shipping Options, and Order Summary Layout

### 1. Move "Added to Cart" toast to top-right

**File: `src/components/ui/sonner.tsx`**

Add `position="top-right"` to the Sonner component so toasts no longer overlap the Checkout button in the cart drawer.

### 2. Add shipping method selection to Checkout

**File: `src/pages/CheckoutPage.tsx`**

Add a shipping method selector as a new Card section between Shipping Information and Payment Information.

- Define shipping options constant:
  - USPS Priority Mail (2-3 days) -- $17.95 (default)
  - FedEx 2nd Day Air (2 days) -- $26.95
- Add `shippingMethod` state defaulting to `"usps"`
- Compute `shippingCost` and `total = subtotal + shippingCost`
- Render radio-style selectable buttons for each option
- Pass shipping info and total into order insert and Slack notification

### 3. Restructure Order Summary layout

**File: `src/pages/CheckoutPage.tsx`**

Current layout shows items then "Subtotal" as the final line. New layout:

```text
ORDER SUMMARY

BPC-157                    $109.98
Qty: 2

-------- separator --------

Subtotal                   $109.98

Shipping
  (o) USPS Priority Mail    $17.95
  ( ) FedEx 2nd Day Air     $26.95

-------- separator --------

Total                      $127.93

[ PLACE ORDER ]
```

- Items listed at top
- Separator
- Subtotal (product total only, normal weight)
- Shipping section with the two selectable options (radio-style buttons showing label, delivery time, and price)
- Separator
- Total (bold, primary color) = subtotal + shipping
- Place Order button

The shipping selector will appear in both the left-side form area (as a standalone card) AND in the order summary sidebar so users can see/change it in context. Alternatively, to keep it simpler and avoid duplication, the shipping options will only appear in the Order Summary card itself since that's where the pricing context lives.

### Technical Details

**`src/components/ui/sonner.tsx`** (line 12):
```tsx
// Add position prop
<Sonner
  theme={theme as ToasterProps["theme"]}
  className="toaster group"
  position="top-right"
```

**`src/pages/CheckoutPage.tsx`** -- Key changes:

```tsx
// Constants at module level
const SHIPPING_OPTIONS = [
  { id: "usps", label: "USPS Priority Mail", days: "2-3 days", price: 17.95 },
  { id: "fedex", label: "FedEx 2nd Day Air", days: "2 days", price: 26.95 },
];

// Inside component
const [shippingMethod, setShippingMethod] = useState("usps");
const shippingCost = SHIPPING_OPTIONS.find(o => o.id === shippingMethod)!.price;
const total = subtotal + shippingCost;
```

Order Summary card content restructured to:
1. Item list
2. Separator
3. Subtotal line (normal text)
4. Shipping options (radio-style buttons)
5. Separator
6. Total line (bold, primary color)
7. Place Order button

The `onSubmit` handler updated to:
- Pass `total` instead of `subtotal` for the order total
- Include `shippingMethod`, `shippingCost` in the Slack notification body
- Include shipping method/cost in the order insert

