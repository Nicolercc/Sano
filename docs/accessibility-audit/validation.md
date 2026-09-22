# Sano Accessibility Validation Plan

Validation should prove that the critical journey improved without expanding scope beyond the Phase 0 baseline. This document separates automated checks from manual checks so passing scripts are not mistaken for full accessibility conformance.

## Evidence To Preserve

- Keep all files in `docs/accessibility-audit/screenshots/baseline/` unchanged.
- Keep `docs/accessibility-audit/phase1-browser-audit.json` and `docs/accessibility-audit/screenshots/phase1-keyboard/` as before-fix evidence.
- Keep `docs/accessibility-audit/phase2-rendered-validation.md` and `docs/accessibility-audit/screenshots/phase2-after/` as Phase 2 after-fix evidence.
- Link each fixed issue back to the row in `findings.md`.
- Include implementation commits or pull-request links beside the relevant before/after evidence.

## Automated Checks

Run these before merging Phase 2 work:

| Check | Purpose | Latest result |
| --- | --- | --- |
| `npm run validate:official` | Validates committed official generated seed shape. | Passed on 2026-09-22. |
| `npm run validate:synthetic` | Validates synthetic fallback seed shape. | Passed on 2026-09-22. |
| `npm run lint` | Catches framework, TypeScript, and JSX issues. | Passed on 2026-09-22. |
| `npm run a11y:regression` | Source-level guard for filter focus styling, hero-search focus handoff, exactly one search status live region across `app/` and `components/`, and a 500ms query debounce before live-status announcements. | Passed on 2026-09-22 after `fix(a11y): debounce search status announcements`. |
| `npm run a11y:contrast` | Recalculates audited contrast pairs and blocks known risky meaningful-text classes unless allowlisted. | Passed on 2026-09-22. |
| `npm run build` | Verifies production build and route generation. | Passed on 2026-09-22. |
| `npm run check` | Runs validation, lint, accessibility checks, and build together. | Passed on 2026-09-22. |
| `SANO_BASE_URL=http://127.0.0.1:4176 npm run acceptance` | Exercises health, search API, homepage, profile, not-found, and methodology routes. | Passed on 2026-09-22 after allowing Node to connect to the local dev server. |

## Rendered Browser Checks

`phase2-rendered-validation.md` records the first rendered after-pass in real Chrome.

| Check | Latest result |
| --- | --- |
| Hero search focus handoff | Passed in Chrome on 2026-09-22; focus moved to `Search restaurants`. |
| Filter focus next step | Passed in Chrome on 2026-09-22; Tab moved into the filter query input with the query selected. |
| Settled live-status empty state | Passed in Chrome on 2026-09-22; status text exposed `No matching restaurants in the current index.` after the ZIP search settled. |
| Screen-reader announcement timing | Still pending; requires VoiceOver/NVDA-style assistive technology, not only browser accessibility tree inspection. |

## Contrast Validation

`npm run a11y:contrast` uses WCAG relative luminance calculations for the audited text pairs. It does not claim full WCAG conformance.

Minimum targets used by the script:

| Content type | Target |
| --- | --- |
| Normal text | 4.5:1 minimum |
| Large text | 3:1 minimum |
| Meaningful non-text UI boundaries, focus indicators, and chart markers | 3:1 minimum |

Phase 2 checked pairs:

| Token/sample | Phase 2 ratio |
| --- | --- |
| `white/72` on `#1e2a38` | 8.22:1 |
| `ink/65` on oat | 5.01:1 |
| `ink/65` on white | 5.21:1 |
| `ink/65` on `--surface-2` | 5.21:1 |
| `amberText` on oat | 6.38:1 |
| `amberText` on white | 7.12:1 |
| `coralText` on oat | 5.85:1 |
| `coralText` on white | 6.53:1 |

Known allowlisted low-opacity classes:

| Class | Reason |
| --- | --- |
| `placeholder:text-ink/40` in `FilterBar.tsx` | Placeholder hint, not persistent meaningful text. |
| `placeholder:text-white/40` in `SearchShell.tsx` | Placeholder hint, not persistent meaningful text. |

## Manual Checks

These checks still require a human pass with keyboard, browser rendering, and assistive technology where available.

1. Landing page: verify headline, helper copy, proof points, search input, sample search buttons, and data disclosure are readable at desktop and mobile widths.
2. Keyboard focus: tab from the browser chrome into navigation, landing search, sample buttons, filters, result actions, profile links, and methodology link.
3. Hero search focus handoff: from fresh `/`, submit a hero search with `Enter`; verify focus lands visibly on the search/results heading and is not hidden under the sticky nav.
4. Filters: verify query input and select controls show a stronger focus indicator than border-color-only.
5. Search status announcements: with a screen reader active, submit a hero search, type a multi-character filter query, change filters, trigger empty results, and trigger an error; confirm the polite status message is announced after query typing settles and without duplicate chatter.
6. Search/filter state: apply query, trajectory, confidence, and recent critical filters. Verify all control labels, current values, result counts, and clear action are visible and understandable.
7. Results state: inspect selected card, map/coverage summary, result cards, reliability bars, and open-profile actions.
8. Empty, loading, and error states: verify text is perceivable and recovery actions are keyboard reachable.
9. Restaurant profile: verify official grade, Sano context, score panel heading, source context, and alternatives are readable and structured.
10. Restaurant not-found: verify the local primary nav is named and both recovery links show visible focus.
11. Inspection timeline: verify chart labels, markers, badges, notes, and accessible summaries do not rely on color alone at desktop and mobile widths.
12. Methodology: verify long-form explanatory text, warning sections, and limitations remain readable.

## Acceptance Criteria

- Every High severity finding in `findings.md` has a documented fix and automated evidence where feasible.
- Medium severity findings are fixed or explicitly marked as improved with remaining manual validation.
- Keyboard focus is visibly styled throughout the critical journey.
- Reviewed task-critical text no longer uses the audited risky low-contrast meaningful-text tokens.
- Search loading, result counts, empty state, and error state have one polite status region.
- Query typing does not cause live-region chatter on every keystroke.
- Timeline/status meaning is supported by text, not color alone.
