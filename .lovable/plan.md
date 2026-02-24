

## Fix: Mobile Viewport Overflow

### Problem
The website is wider than the viewport on mobile devices, causing a horizontal scrollbar.

### Root Causes

1. **`src/App.css`** -- The `#root` selector applies `padding: 2rem` globally, which adds 32px padding on each side. Combined with elements already using the `container` class (which has its own `padding: 2rem`), this creates double padding and potentially pushes content beyond the viewport.

2. **Long button text on LandingPage** -- The button "Create a Free Account to Browse All Products" (line 125-127 in `LandingPage.tsx`) contains text that is too long for small screens, causing it to overflow its container.

3. **Missing global overflow protection** -- There is no `overflow-x: hidden` on the root or body to prevent horizontal scroll caused by decorative backgrounds or edge-case content.

### Fix Plan

**File 1: `src/App.css`**
- Remove the `padding: 2rem` from `#root` (or remove the entire file if no styles are actually needed -- the App.css file contains only boilerplate Vite starter styles that are unused)

**File 2: `src/index.css`**
- Add `overflow-x: hidden` to the `body` rule as a safety net

**File 3: `src/pages/LandingPage.tsx`**
- Make the long CTA button text wrap properly on mobile by adding `whitespace-normal text-center` classes, or shorten the text and wrap it for small screens

### Technical Details

Changes are minimal and CSS-only (plus one button text adjustment):

- `src/App.css`: Remove the unused `#root` padding rule (the entire file contains unused Vite boilerplate and can be cleaned up)
- `src/index.css`: Add `overflow-x: hidden` to the existing `body` styles in the `@layer base` block
- `src/pages/LandingPage.tsx`: Wrap the long button text or add responsive text sizing on the "Create a Free Account" button around line 125

