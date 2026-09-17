---
name: visual-review
description: Use after implementing or changing any visual/CSS work on this landing page, before telling the user it's done. Forces an actual rendered screenshot pass (not a code-only read-through) across light mode, dark mode, and mobile, then a designer-style critique. Triggers after any styling change, redesign, or "check how it looks" request.
---

# Visual Review

Never report a visual/CSS change as complete from reading the code alone. You must render it and
look at it. If you cannot render it, say so explicitly instead of claiming the work is verified.

## 1. Get a real screenshot

Prefer, in order:

1. If `claude-in-chrome` (or another connected browser tool) is available, use it directly against
   the running dev/preview server.
2. Otherwise, use headless Chrome via CDP:
   - Start the project's dev/preview server in the background.
   - Launch `google-chrome --headless --disable-gpu --no-sandbox --remote-debugging-port=9222`.
   - Drive it over the DevTools Protocol (a small Node script with the `ws` package is enough —
     see prior session scratch scripts for a working template) so you can set
     `Emulation.setEmulatedMedia` for `prefers-color-scheme` (this codebase reads that media query
     at runtime, not a static attribute — a plain `--force-dark-mode` CLI flag or editing the
     built HTML does **not** reliably reflect the real dark theme, since the page's own JS
     re-evaluates `matchMedia` after load and overwrites it).
   - Set the emulated device viewport tall enough to cover the full page (or scroll first) before
     capturing — this site reveals sections via `IntersectionObserver` on scroll, so a screenshot
     taken with a short viewport and no scroll will show blank/blurred sections below the fold.
     Either set `Emulation.setDeviceMetricsOverride` height to the full `document.body.scrollHeight`,
     or use `--force-prefers-reduced-motion` (this codebase snaps `.reveal` elements to their final
     state under that media feature) before capturing.
3. As a last resort, `astro build && astro preview` plus `--screenshot` via headless Chrome CLI is
   acceptable for a quick light-mode check, but does not substitute for a real dark-mode pass.

## 2. Coverage checklist

Capture and inspect, at minimum:

- [ ] Light mode, full page (or all sections)
- [ ] Dark mode, full page (or all sections) — verified via the actual `data-theme` attribute /
      `matchMedia` result, not assumed from CSS alone
- [ ] Mobile viewport (~390px wide)

## 3. Critique checklist

Look at the rendered result as a designer, not a code reviewer:

- Visual hierarchy — is it obvious what to read first, second, third in each section?
- Spacing consistency — do section paddings, card gaps, and margins follow one scale?
- Typography — sizes/weights consistent with the pairing chosen in `design-director`?
- Alignment — do grid columns, cards, and text blocks line up cleanly?
- Contrast — text legible against its background in both themes (check hero text against the
  brand-navy hero background specifically, since it doesn't follow the light/dark token swap)?
- Responsive behavior — does the mobile screenshot show real breakage (overlap, overflow, tiny
  tap targets), not just "does it fit"?
- CTA visibility — is the primary conversion action visually dominant in the hero and reachable
  near the end of the page?
- Signs of generic AI-generated UI: repetitive identical cards, uniform rounded corners
  everywhere, predictable "hero → 3 cards → testimonials" rhythm, decorative icons with no
  information value, gradients with no relation to the brand.

## 4. Fix and re-verify

Fix the highest-impact issues first. After any fix that changes layout or color, re-screenshot the
affected section — don't assume a CSS edit did what you intended.
