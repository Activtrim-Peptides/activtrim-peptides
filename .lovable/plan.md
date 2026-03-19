

## Update Shipping Options on Checkout

Single file change in `src/pages/CheckoutPage.tsx` — update the `SHIPPING_OPTIONS` array:

- Add "Local Pickup" at $0.00
- Change USPS Priority Mail from $17.95 to $10.00
- Change FedEx 2nd Day Air from $26.95 to $28.00

```typescript
const SHIPPING_OPTIONS = [
  { id: "pickup", label: "Local Pickup", days: "Same day", price: 0.00 },
  { id: "usps", label: "USPS Priority Mail", days: "2-3 days", price: 10.00 },
  { id: "fedex", label: "FedEx 2nd Day Air", days: "2 days", price: 28.00 },
];
```

### File Modified
- `src/pages/CheckoutPage.tsx` (lines ~22-25)

