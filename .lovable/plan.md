

## Add Fade-In Hero Background Image with Mobile Optimization

### Overview
Add the uploaded image as a fade-in background behind the hero section on the landing page, with responsive opacity for mobile readability.

### Files Changed

**1. Save uploaded image**
- Copy `user-uploads://Untitled_1600_x_900_px.png` to `src/assets/hero-bg.png`

**2. `src/index.css`**
- Add a `hero-fade-in` keyframe animation: opacity 0 to target over 1.5s ease-out

```css
@keyframes hero-fade-in {
  from { opacity: 0; }
  to { opacity: 0.25; }
}
.hero-bg-fade {
  animation: hero-fade-in 1.5s ease-out forwards;
}
```

**3. `src/pages/LandingPage.tsx`**
- Import the hero image
- Add an `<img>` element inside the hero section, positioned absolutely behind gradients and content
- Use responsive opacity: lower on mobile (`md:` breakpoint bumps it up)
- Existing gradient overlays remain untouched on top

Structure:
```text
<section class="relative overflow-hidden ...">
  <img src={heroBg} class="absolute inset-0 w-full h-full object-cover
       opacity-0 hero-bg-fade md:[--hero-opacity:0.3] pointer-events-none" />
  <div class="absolute inset-0 gradient-dark" />          (existing)
  <div class="absolute inset-0 bg-[radial-gradient(...)]" /> (existing)
  <div class="container relative z-10 ...">                (existing content)
</section>
```

Mobile: image fades to ~20% opacity. Desktop: ~30%. The dark gradient overlay on top ensures text stays crisp at all sizes. `object-cover` center-crops the image on narrow screens.

