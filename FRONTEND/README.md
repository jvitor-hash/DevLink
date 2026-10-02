# DevLink frontend

React and Vite frontend for DevLink.

## Getting started

```bash
bun install
bun run dev
```

Open the URL printed by Vite, usually <http://localhost:5173>.

Useful commands:

```bash
bun run build
bun run lint
bun run preview
```

## Theme: Neo-Brutalist Glass

An optional visual layer that sits on top of the existing UI. It is **off by
default**, so a fresh install looks exactly as it did before.

### Tokens

All tokens live in `src/assets/theme_glass_brutal.css` under the `glass-brutal`
namespace and are scoped to `[data-theme="glass-brutal"]`:

| Token | Value |
| --- | --- |
| `--gb-ink` | `#1E1D1B` |
| `--gb-stone-50` | `#F2F0EC` |
| `--gb-stone-200` | `#D9D6D1` |
| `--gb-stone-400` | `#A9A59E` |
| `--gb-stone-600` | `#6F6B65` |
| `--gb-accent` | `#B4504A` (dusty red) |
| `--gb-accent-deep` | `#8A3A36` |
| `--gb-glass-fill` | `rgba(255,255,255,0.6)` |
| `--gb-glass-edge` | `rgba(255,255,255,0.5)` |
| `--gb-glass-fallback` | `rgba(242,240,236,0.92)` |
| `--gb-blur` | `20px` |
| `--gb-border-width` | `2px` |
| `--gb-radius` | `0` |
| `--gb-shadow-offset` | `6px` |
| `--gb-divider-width` | `1.5px` |
| `--gb-font-heading` | Space Grotesk (via Google Fonts) |
| `--gb-font-body` | existing system stack |
| `--gb-rule-heavy` | `3px` |
| `--gb-rule-hair` | `1px` |
| `--gb-dot` | `6px` (halftone spacing) |

Inside the theme block the app's existing semantic tokens (`--surface-*`,
`--text-*`, `--primary`, `--border*`) are remapped onto the brutalist palette.
That is what lets untouched components follow the theme without any change of
their own.

### Primitives

| Component | File | Purpose |
| --- | --- | --- |
| `GlassFrame` | `components/ui/glass_frame.tsx` | Frosted fill, 2px ink border, sharp corners, hard offset shadow drawn on a separate layer behind the panel |
| `BrutalButton` | `components/ui/brutal_button.tsx` | Solid accent fill, white caps label, hard shadow that collapses on press |
| `BrutalChip` | `components/ui/brutal_chip.tsx` | Rectangular filter chip; accent when active, frosted when inactive |
| `TagLabel` | `components/ui/tag_label.tsx` | Rectangular accent-filled label |
| `ThemeBackdrop` | `components/ui/theme_backdrop.tsx` | Blurred neutral shapes, one dusty red blob, faint grain overlay |

Each `gb-*` class carries the original dark look as its base and the brutalist
treatment as a `[data-theme="glass-brutal"]` override, so the components render
correctly in both states.

### Zine utilities

Print-zine helpers, all scoped to the theme.

| Class | Effect |
| --- | --- |
| `gb-rule-heavy` / `gb-rule-hair` | Thick section spine and hairline dividers |
| `gb-halftone` | Screentone dot field; takes its colour from `currentColor` |
| `gb-register` | Printer's registration cross |
| `gb-display` | Heavy display lockup for the wordmark and section numbers |
| `gb-kicker` | Small wide-tracked caps label |

`gb-rule-hair` sets an explicit `height`, so only use it on a standalone
divider element — never on a container that holds content.

### Sharp corners

The theme zeroes out `rounded`, `rounded-sm/md/lg/xl/2xl/3xl` and `rounded-full`
in one unlayered rule, which beats every Tailwind radius utility (Tailwind v4
emits them inside `@layer utilities`). Nothing rounds when the theme is on. The
blurred backdrop blobs keep their radius, since a circle is invisible after blur.

### Toggling

The theme is a single `data-theme` attribute on `<html>`, persisted in
localStorage under `devlink:theme` and restored before the first paint in
`src/main.tsx`.

```js
// In the browser console:
devlinkTheme("glass-brutal"); // enable
devlinkTheme("default");      // roll back to the original look
```

Programmatically, from `src/utils/theme_flag.ts`:

```ts
import { applyTheme } from "@/utils/theme_flag";

applyTheme("glass-brutal");
applyTheme("default");
```

Rollback needs no rebuild: removing the attribute restores the original styles,
because every brutalist rule is scoped to it.

### Accessibility and fallbacks

- Backdrop blur is used only on cards, the header and the tab bar. The navbar is
  fully transparent and relies on a stronger blur (28px) rather than a fill, so
  scrolling content smears beneath it.
- Without `backdrop-filter` support — or when `prefers-reduced-transparency` is
  set — the fill falls back to opaque stone-50 at 92%, keeping the same borders
  and shadows.
- `prefers-reduced-motion` disables the press and hover transitions.
- Contrast was checked against the stone-50 base: ink on glass is ~14.5:1,
  white on the accent is ~5:1, and muted stone-600 text is ~4.6:1, all above
  WCAG AA.