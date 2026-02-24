

## Reduce Hero Gradient Overlay Opacity

### Problem
The current gradient overlay (`from-background/60 via-background/80 to-background`) is too opaque, hiding the background image.

### Solution
Lighten the overlay so the image is more visible while keeping text readable.

**`src/pages/LandingPage.tsx`** (line 71)

Replace:
```tsx
<div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
```

With:
```tsx
<div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
```

This reduces the top opacity from 60% to 20% and mid from 80% to 50%, while keeping the bottom fully opaque for a clean transition into the next section. The image will be much more visible in the upper portion of the hero.

