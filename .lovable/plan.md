
Goal: eliminate the remaining mobile clipping on product detail pages (example: `/app/product/bpc-157`) so cards fully fit the viewport and text is readable without being cut off.

What I found from the current code and screenshot:
- The previous fixes are present (image background removed, quick stats responsive, description `break-words`).
- The page is still visually clipped on the right in mobile screenshots.
- Current page-level `overflow-hidden` can mask the true overflow source by cropping content instead of fixing layout width.
- The top product header block still uses a wrap-based row layout (`flex-wrap + justify-between`) that is fragile on narrow screens.
- Several nested content blocks are missing `min-w-0` / aggressive word wrapping safeguards, which can still force overflow in flex/grid contexts.

Implementation plan (single file + optional tiny helper tweak):

1) Stabilize the product header layout for mobile-first stacking
- File: `src/pages/ProductDetailPage.tsx`
- Change the title/price row from wrap-based layout to explicit mobile stacking:
  - from: `flex flex-wrap items-start justify-between gap-4`
  - to: `flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`
- Make price block mobile-safe:
  - mobile: left aligned, full width
  - `sm+`: right aligned
- Add `min-w-0` to the text column so it can shrink and wrap correctly inside flex.

Why: explicit stacking on mobile is more reliable than wrapping when text and price compete for space.

2) Remove clipping-based overflow handling and fix true overflow behavior
- File: `src/pages/ProductDetailPage.tsx`
- Replace page wrapper overflow behavior:
  - remove `overflow-hidden` from the main container
  - use width-safe constraints on child blocks instead (`min-w-0`, `max-w-full`, wrapping rules)
- Keep global body overflow protection in `src/index.css` as-is (`overflow-x-hidden`) for safety, but avoid cropping the page’s own content container.

Why: container-level clipping can hide right-side content and create the exact “doesn’t fit” appearance in your screenshot.

3) Harden text wrapping in all high-risk blocks
- File: `src/pages/ProductDetailPage.tsx`
- Strengthen description wrapping:
  - keep `break-words`
  - add `overflow-wrap:anywhere` utility (`[overflow-wrap:anywhere]`) for pathological long tokens.
- In quick stats items:
  - add `min-w-0` on each stat row/container
  - add wrapping utility on text nodes (`break-words` / `anywhere`) so they never force column width.
- For section body content where CMS text may vary:
  - add defensive wrapping class at section content containers as needed.

Why: long words, compound names, or copied text can still create min-content overflow in flex/grid.

4) Constrain tables and horizontal content safely
- File: `src/pages/ProductDetailPage.tsx`
- Keep `overflow-x-auto` around research protocols table.
- Add `max-w-full` to table wrapper (and if needed table container) to ensure it never expands parent width.
- Ensure all card/section wrappers in this page include `min-w-0`.

Why: tables are a common hidden overflow source on mobile pages.

5) Verify at multiple real device widths before finalizing
- Validate `/app/product/bpc-157` at:
  - 320x568 (small iPhone)
  - 375x812
  - 390x844
- Check these acceptance criteria:
  - no right-edge clipping of card borders/text
  - no horizontal page scroll
  - quick stats fit and wrap naturally
  - image area remains transparent (no gray background)
  - header row (name/price/badge) remains readable and aligned.

Technical change summary (expected):
- `ProductDetailPage.tsx`
  - mobile-first header stack (`flex-col sm:flex-row`)
  - `min-w-0` on flex children
  - stronger wrap utilities (`break-words` + `[overflow-wrap:anywhere]`)
  - remove/rework local `overflow-hidden` that crops content
  - keep table overflow localized (`overflow-x-auto`, `max-w-full`).

Risk and mitigation:
- Risk: changing overflow behavior can reveal hidden offenders lower on the page.
- Mitigation: add `min-w-0`/`max-w-full` defensively to each major block and verify by scrolling entire page on mobile widths.

Outcome:
- Product detail pages will truly fit mobile viewports without clipping, while preserving the transparent image presentation and current visual style.
