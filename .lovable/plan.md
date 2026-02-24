

## Fix: Show Full Head in Hero Background Image

### Problem
The background image uses `object-cover` which center-crops the image. On most viewports, this cuts off the top of the person's head.

### Solution
Add `object-position: top` to the hero image so it anchors to the top of the image rather than centering, ensuring the head is fully visible.

### File Changed

**`src/pages/LandingPage.tsx`** (line 70)

Replace:
```tsx
<img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 hero-bg-fade pointer-events-none" />
```

With:
```tsx
<img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-0 hero-bg-fade pointer-events-none" />
```

Single class addition (`object-top`). No other files change.

