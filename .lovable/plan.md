

## Fix: Hero Background Image Hidden by Opaque Overlay

### Root Cause

The `gradient-dark` CSS class applies a fully opaque dark gradient (`hsl(0 0% 5%)` to `hsl(0 0% 3%)`). This div sits directly on top of the hero background image and completely covers it, making the image invisible regardless of the fade-in animation.

### Solution

Replace the opaque `gradient-dark` overlay with a semi-transparent version that allows the image to show through while still darkening it enough for text readability.

### File Changed

**`src/pages/LandingPage.tsx`** (line 71)

Replace:
```tsx
<div className="absolute inset-0 gradient-dark" />
```

With:
```tsx
<div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
```

This creates a gradient that is partially transparent at the top (letting the image show through) and becomes fully opaque at the bottom (clean transition into the next section). Combined with the image fading in at 25-35% opacity, the result will be a subtle, professional background effect with fully legible text.

No other files need to change -- the animation CSS and image import are already correct.

