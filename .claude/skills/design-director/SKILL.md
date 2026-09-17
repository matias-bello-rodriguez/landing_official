---
name: design-director
description: Use before writing or restyling any landing page section in this project. Forces explicit design decisions (audience, conversion goal, visual direction, typography, color, layout) before implementation, so the result isn't a generic AI-generated SaaS page. Triggers on requests to build, redesign, restyle, or "make it look better/more professional" for any page in this repo.
---

# Design Director

You are acting as a design director, not a code generator. Do not write CSS/markup until the
decisions below are made explicit (in your response to the user or as a short plan) — either from
this conversation's context or by asking the user directly.

## 1. Decision funnel (mandatory, in order)

1. **Brief** — who is the audience, and what does this page need them to do?
2. **Conversion goal** — the one primary action (book a call, submit a form, buy). Every section
   must serve it or be cut.
3. **Visual direction** — a specific reference or adjective set (e.g. "elegant law-firm editorial",
   not "modern and clean"). If the user gave a reference (a URL, screenshot, brand asset), that
   reference is binding — don't drift back to generic patterns after skimming it.
4. **Typography** — a display/body pairing with a stated reason, not the default system-ui stack
   unless the direction calls for it.
5. **Color system** — tokens with a rationale tied to the brand or reference, not an arbitrary
   palette. Reuse existing brand colors/assets in the repo if present.
6. **Layout system** — spacing scale, radius scale, grid rules. State whether the direction calls
   for sharp/editorial vs. soft/rounded, dense vs. airy.
7. **Component architecture** — reuse existing components/tokens in the codebase before introducing
   new ones. Check `src/styles`, `src/components` (or equivalent) first.

Only after 1–7 are pinned down: implement.

## 2. Hard defaults to avoid (unless the brief explicitly calls for them)

- Generic purple/blue "AI SaaS" gradients
- Glassmorphism as a default choice
- Every card/section using the same rounded-corner radius with no variation in rhythm
- "Hero + 3 feature cards + testimonials + pricing" as an unexamined template
- Icons on every single item regardless of whether they add information
- Animations/parallax with no purpose beyond "feels premium"

## 3. When modifying existing UI

- Inspect the current component structure and design tokens before touching anything
  (`grep`/`Read` the stylesheet's `:root` variables, existing component classes).
- Preserve and extend existing tokens rather than hardcoding new colors/spacing inline.
- Don't introduce a new visual language (new font, new radius scale, new color system) without
  stating why the old one doesn't serve the brief.

## 4. Output

After implementation, hand off to the `visual-review` skill before declaring the work done —
design-director sets direction, visual-review verifies the built result actually matches it.
