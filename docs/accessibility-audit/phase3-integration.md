# Phase 3 — Integrating the accessibility work into the redesigned main

Date: 2026-09-25

The accessibility audit (Phases 1–2) was done on `feat/accessibility-audit`, which
branched before the homepage redesign landed on `main` (marker grades, review
stars, scroll-aware nav, route loading/error states, blue/red palette). This
phase merges the two and re-validates on the design that actually ships.

## Merge decisions

| Area | Decision |
| --- | --- |
| Palette (`tailwind.config.ts`) | Kept `main`'s palette. Re-derived `coralText` (`#a62626`) and `amberText` (`#7a5714`) as darker shades of `main`'s red and gold instead of carrying over the old-palette values. |
| Timeline chart colors | Kept `main`'s colors. Raised the score trend line and point outlines from 40–50% to 60% ink so they meet 3:1 non-text contrast. |
| Card popularity line, map "selected restaurant" aside | Kept `main`'s removal. |
| Profile review block | Kept `main`'s `ReviewStars` component; applied the audited `ink/65` text level. |
| Search section header | Kept `main`'s layout; added the audit's focus target (`#search-heading`, `tabIndex=-1`, visible focus) and the single polite `#search-status` region. |
| Demo chips | Replaced with `Manhattan`, `Brooklyn`, `Coffee` + the featured restaurant. `11101`, `Thai`, and `Korean` returned 0 or 1 results in the live seed. |
| Route loading states | Kept `role="status"` with a screen-reader-only "Loading…" message; removed the redundant `aria-live` so the tree has one polite live region. |

## New fixes found while re-validating

- `ReviewStars` and both route `error.tsx` files (new on `main`) used text below 4.5:1.
- Placeholder text (hero, filter bar, nav search) was ~2–3:1; raised and removed from the contrast-check allowlist.
- The nav command-search input had no visible focus indicator; the form now shows a `focus-within` outline.
- The timeline chart's horizontal scroll container on phones was not keyboard reachable; it is now a labelled, focusable region.
- `scroll-behavior: smooth` and the hero-search scroll now respect `prefers-reduced-motion`.
- The live seed has no ZIP codes, so search copy no longer promises ZIP search; a 5-digit query explains that ZIP-level records are not indexed yet.

## Verification (production-equivalent `official-generated-seed` mode)

Automated:

- `npm run check` — seed validation, lint, a11y regression + contrast gates, production build: pass.
- `npm run acceptance` against a local `next start`: pass (includes every rendered "Try:" chip returning results).
- axe-core 4.x with WCAG 2.0/2.1/2.2 A + AA tags, desktop (1440×900) and mobile (390×844), reduced motion on:
  home, chip results, empty state, restaurant profile, methodology, restaurant not-found, 404 — **0 violations**.
- Scripted keyboard checks: Enter in the hero search and every chip move focus to `#search-heading` with a visible outline; the status region announces "N restaurants shown." or "No matching restaurants in the current index."

Not proven by automation (still manual):

- By-ear VoiceOver / NVDA pass of the search → profile journey.
- 200% / 400% zoom and reflow on real devices.
- Windows High Contrast / forced-colors rendering.

## Known limitations

- `/restaurants/<unknown id>` renders the correct not-found page but returns HTTP 200: the route's `loading.tsx` starts streaming before `notFound()` runs. Content and headings are correct; the status code is not.
- Coverage is a 16-restaurant curated extract; the UI says coverage is not citywide.

This is a scoped, tested improvement to the critical journey against relevant WCAG 2.2 AA criteria — not a conformance claim for the whole application.
