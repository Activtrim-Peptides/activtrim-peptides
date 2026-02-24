

## Fix 4 Product Card Issues

### File: `src/components/ProductCard.tsx`

All 4 fixes in one edit:

1. **Remove dark gray background** -- Remove `bg-muted` and `hover:bg-muted/80` from the image container
2. **Stack price above cart button** -- Change the bottom section from `flex items-center justify-between` (horizontal) to `flex flex-col items-start gap-2` (vertical), and make the button `w-full`
3. **Fix mobile overflow** -- Change outer container from `flex-row` to `flex-col sm:flex-row`, and image link from `w-28` to `w-full h-40 sm:w-28 sm:h-auto`
4. **Show more description** -- Change `line-clamp-2` to `line-clamp-3`

### Technical Details

**Line 24** -- outer container:
```tsx
// Before
<div className="... flex flex-row ...">
// After
<div className="... flex flex-col sm:flex-row ...">
```

**Line 31** -- image Link:
```tsx
// Before
className="flex w-28 shrink-0 ... rounded-md bg-muted overflow-hidden self-stretch ... hover:bg-muted/80"
// After
className="flex w-full h-40 sm:w-28 sm:h-auto shrink-0 ... rounded-md overflow-hidden sm:self-stretch"
```

**Line 47** -- description:
```tsx
// Before
<p className="... line-clamp-2 ...">
// After
<p className="... line-clamp-3 ...">
```

**Lines 49-58** -- price/button section:
```tsx
// Before
<div className="mt-auto flex items-center justify-between">
  <span ...>${price}</span>
  <Button size="sm" className="...">...</Button>
</div>

// After
<div className="mt-auto flex flex-col items-start gap-2">
  <span ...>${price}</span>
  <Button size="sm" className="w-full ...">...</Button>
</div>
```

