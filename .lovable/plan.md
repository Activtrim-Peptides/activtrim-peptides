

## Fix: Display Product Images on Shop and Detail Pages

### Problem
The `ProductCard` component ignores the `image_url` prop entirely. Even though the image is saved correctly in the database (confirmed: BPC-157 has a valid image URL), the card always renders a placeholder flask icon. The product detail page also never displays the product image.

### Changes

#### 1. `src/components/ProductCard.tsx`
- Add `image_url` to the destructured props (line 19)
- Replace the static FlaskConical icon placeholder (lines 32-34) with conditional rendering:
  - If `image_url` exists: render an `<img>` tag with the product image
  - If no image: keep the FlaskConical icon as fallback
- Respect the `show_image` flag from product_details (this is only relevant on the detail page, not the card)

#### 2. `src/pages/ProductDetailPage.tsx`
- Add an image display in the header card section, showing the product image when `image_url` is present and `show_image` is not false
- Use the FlaskConical icon as fallback when no image exists

### Technical Details

**ProductCard image area replacement (lines 32-34):**
```tsx
<div className="mb-4 flex h-32 items-center justify-center rounded-md bg-muted transition-colors group-hover/link:bg-muted/80 overflow-hidden">
  {image_url ? (
    <img src={image_url} alt={name} className="h-full w-full object-contain" />
  ) : (
    <FlaskConical className="h-12 w-12 text-primary/40" />
  )}
</div>
```

**ProductDetailPage** -- add image display in the header card, before or alongside the product name/description area, conditionally shown when `details?.show_image !== false` and `product.image_url` exists.

