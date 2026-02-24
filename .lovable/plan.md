

## Fix Quick Stats Horizontal Layout (Adaptive Grid)

Replace the dynamic Tailwind class `grid-cols-${published.length}` (which gets purged at build time) with a conditional expression using complete class names that Tailwind can detect.

### Change

**File:** `src/pages/ProductDetailPage.tsx` (line 150)

**Before:**
```tsx
<div className={`mt-6 grid grid-cols-${published.length} gap-4 ...`}>
```

**After:**
```tsx
<div className={`mt-6 grid gap-4 rounded-md border border-border bg-secondary/50 p-4 ${
  published.length === 1 ? "grid-cols-1" : published.length === 2 ? "grid-cols-2" : "grid-cols-3"
}`}>
```

This ensures:
- **3 published items** -- 3 columns, displayed side by side
- **2 published items** -- 2 columns, evenly spaced
- **1 published item** -- full-width single column
- **0 published items** -- section is hidden entirely (already handled)

All class names are written in full so Tailwind includes them in the build output.

### Files Changed

- `src/pages/ProductDetailPage.tsx`: One line change on the grid container class

