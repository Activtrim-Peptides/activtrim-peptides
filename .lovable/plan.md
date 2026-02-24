

## Horizontal Product Card Layout (Image on Left)

### Problem
Product images are tall/portrait-oriented vials, but the card image area is landscape (wide and short). This makes the vials appear tiny with wasted horizontal space.

### Solution
Restructure the ProductCard to a horizontal layout where the image sits on the left side and the product info (name, category, description, price, button) sits on the right. This gives vertical images more room to display at a natural size.

### File Changed

**`src/components/ProductCard.tsx`**

Switch from a vertical stack layout to a horizontal row layout:

- Change the outer container from `flex-col` to `flex-row`
- Image area becomes a fixed-width left column (e.g. `w-28 h-full` or `w-32`) with the image filling it vertically
- Product info (category badge, name, description, price, button) becomes the right column using `flex-col flex-1`
- Best Seller badge stays absolutely positioned in the top-right
- On very small screens, the layout can stay horizontal since the image column is narrow enough

```text
Current layout:
+---------------------------+
|       [image area]        |
|  Category                 |
|  PRODUCT NAME             |
|  Description text...      |
|  $XX.XX    [Add to Cart]  |
+---------------------------+

New layout:
+--------+------------------+
|        | Category         |
| [img]  | PRODUCT NAME     |
|        | Description...   |
|        | $XX.XX [Add Cart]|
+--------+------------------+
```

### Technical Details

The card container changes from:
```tsx
<div className="group relative flex flex-col rounded-lg border border-border bg-card p-5 card-glow-hover">
```
To:
```tsx
<div className="group relative flex flex-row rounded-lg border border-border bg-card p-4 card-glow-hover gap-4">
```

The image area changes from a wide landscape box to a narrow tall column:
```tsx
<div className="flex w-28 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden self-stretch">
  {image_url ? (
    <img src={image_url} alt={name} className="h-full w-full object-contain" />
  ) : (
    <FlaskConical className="h-10 w-10 text-primary/40" />
  )}
</div>
```

The text/info content wraps in a `flex-col flex-1 min-w-0` container. The Link wraps only the image + name (for clickability). Price and button row stays at the bottom via `mt-auto`.

No other files need changes -- the same `ProductCard` is used by ShopPage, BestSellersPage, and ProductDetailPage's related products.

