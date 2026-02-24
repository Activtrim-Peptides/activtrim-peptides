

## Fix: Quick Stats Not Showing on Product Detail Page

### Root Cause

The `quick_stats` column is empty (`[]`) in the database for all products. When the admin opens a product, the admin panel substitutes default values (Typical Dosage, Administration, Storage) so it *looks* like stats exist -- but they were never actually saved to the database.

The product detail page reads `quick_stats` directly from the database, gets an empty array, and correctly renders nothing.

### Solution

Apply the same default fallback on the product detail page so that products without explicitly saved quick stats still display the three standard items.

### File Changed

**`src/pages/ProductDetailPage.tsx`** (around line 145)

Replace:
```tsx
const quickStats: { ... }[] = details?.quick_stats ?? [];
```

With a fallback to default stats when the array is empty:
```tsx
const defaultQuickStats = [
  { heading: "Typical Dosage", details: "Lyophilized", description: "Powdered form for reconstitution", is_published: true },
  { heading: "Administration", details: "Subcutaneous", description: "Injection method", is_published: true },
  { heading: "Storage", details: "2-8°C", description: "Refrigerated storage required", is_published: true },
];
const rawStats = details?.quick_stats ?? [];
const quickStats = rawStats.length > 0 ? rawStats : defaultQuickStats;
```

This mirrors what the admin panel already does (line 182 of AdminPage.tsx), ensuring consistent behavior. Once an admin explicitly saves quick stats for a product, those saved values will take precedence over the defaults.

No database changes needed -- this is a one-line frontend fix.
