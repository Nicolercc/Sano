# Sano — Distinguished Product Audit

Status: **roadmap proposed, not approved for implementation**
Scope: everything below the homepage hero, search and results, the restaurant-profile page, and sitewide visual/interaction system. The hero stays essentially unchanged.

This document consolidates a full-session audit into the single strongest direction per surface. It intentionally does not preserve every option considered — only what should get built.

---

## Current score: 12/20 — credible portfolio product

Sano is functional, well-engineered, sits on real data, and has genuine original ideas (the marker-grade stamp motif, the demo-paths concept, honest "story so far" prose). It's held back by structure, not substance: most of the page below the hero is the same card-grid template repeated four times, the richest data in the system (geolocation, per-cycle violation text) is unused, and one chart (`TrustTimeline`) auto-scales in a way that makes different restaurants' records visually incomparable.

## Central design diagnosis

**The product has no visual system for telling raw government data apart from Sano's interpretation of it — and no visual variety beyond one repeated card template.** Every section, whether it's showing an official grade or a derived trend, uses the same white rounded card, the same shadow, the same three-column grid. Nothing on screen signals "this came from the city" versus "Sano computed this," so the product's actual thesis — *read the pattern, know the limits* — isn't reinforced by anything the eye sees, only by what the copy says.

---

## Approved sitewide visual direction: the two-ink system

One rule governs every future screen: **red ink is unaltered NYC DOHMH data (grades, scores, dates, violation codes); blue ink is Sano's derived interpretation (trajectory, reliability, confidence, annotations).** Nothing else uses either color. This replaces decoration with provenance as the system's organizing logic.

- **Typography — three roles, not one:** editorial serif for restaurant names/headlines/narrative prose; the existing black grotesk sans for UI chrome only (nav, buttons, labels); a new monospace for all record metadata (dates, scores, ZIPs, IDs) — currently entirely absent and the fastest way to make the product read as evidentiary rather than templated.
- **Surfaces:** flat ivory paper by default, hairline rules instead of bordered/shadowed cards. Shadow is reserved for exactly one "elevated document" moment per screen (the hero preview already does this correctly). Corner radius becomes semantic — square for raw-record elements, soft for Sano's interpretive UI.
- **Charts:** every chart must be traceable to an adjacent number — no decorative visualization. Score bars stay red ink, derived trend lines and annotations stay blue ink, axes stay fixed and comparable across restaurants (see Diagnosis above).
- **Dark navy:** reserved for authority bookends only — the hero, the footer, and (new) a slim persistent strip inside a restaurant's profile. Never a mid-page mood section.

---

## Homepage direction (below the hero)

Replace the repeated three-card-grid sections with a single demonstration arc: **one real restaurant's record, shown raw, then shown annotated — the actual product pitch, shown instead of described.**

1. **The record as filed** — one restaurant's raw inspection history, flat, monospace, red ink only, deliberately plain.
2. **The record, read** — the same data, immediately below, now annotated in blue ink (trajectory, repeat-pattern flags, reliability) with hover-revealed derivations.
3. **Three restaurants, three patterns** — brief, alternating full-width bands (not a card grid) generalizing the same read across a volatile, a consistent, and a recent-critical record.
4. **Where this stops** — a short, confident limits statement, single column.
5. **Look up any restaurant** — the live search experience.

## Search direction

Replace the repeated bordered card list with a **ruled docket row**: grade stamp, name, and location on the left; a compact **grade-history ribbon** (real per-cycle score/grade/critical/repeat marks, ending at a fixed "today" edge) as the primary visualization in the center; reliability number and recency date in monospace on the right. The whole row is the click target. Rows differ from each other only because their underlying records differ — no added color-coding, no per-row badges.

## Restaurant-profile direction

Replace the parallel stack of report cards with a single sequential narrative, one section per question the page must answer: **the grade → what it doesn't show → how it got here (full annotated timeline) → what changed recently → what repeats (collapsible) → how much evidence exists (a caption, not a new chart) → what remains unknown (closing).** Alternatives move to the end, styled as the same docket row used in search. A slim persistent masthead replaces today's full header card; no second competing sidebar column.

---

## Data visualizations supported now (existing data, no backend work)

| Visualization | Field(s) used | Status |
|---|---|---|
| Fixed 0–100 axis, time-proportional timeline | `inspections[].score`, `.date` | Correctness fix to existing chart |
| Grade-history ribbon (search rows) | `inspections[].grade/score/criticalCount/repeatPattern` | New, reuses timeline grammar at small scale |
| Reliability scale fused with confidence | `inspectionReliabilityScore`, `confidence` | New, replaces bare numeral |
| Repeat-findings panel | `inspections[].violationCodes` (intersected at render time) | New, no new data collection |
| Evidence map | `latitude`, `longitude` | New, currently fully unused despite existing on every restaurant |
| Trend direction glyph | `trajectory` | New, compact treatment of existing field |

## Future data opportunities (require verification or backend work)

- **`violationDescriptions`** — present in the official JSON extract, absent from `lib/types.ts`, **not confirmed present in the Supabase-backed data path.** Highest-value unused field (plain-English violation text); requires a type addition plus a schema-parity check before any UI is built against it.
- **`trustGap`** — fully plumbed through types and API serialization, zero current UI consumer, no design produced yet. Needs its own comparison-view concept (official grade vs. consumer rating) before scheduling.
- **A real basemap/tile provider**, if preferred over an abstracted SVG projection for the evidence map — introduces an external service dependency and likely an API key; separate decision from the map itself.

---

## Roadmap

### P0 — Structural clarity *(CSS/composition only)*
1. Design tokens: two-ink colors, typography, retire the default card recipe — `tailwind.config.ts`, `app/globals.css` — **S/M**
2. Collapse duplicate homepage explainer sections — `components/SearchShell.tsx` — **S**
3. Restore mobile nav access to all 5 destinations — `components/AppNav.tsx` — **S/M**
4. Restructure search cards into docket rows (container only) — `components/RestaurantCard.tsx`, `SearchShell.tsx` — **M**
5. Consolidate redundant profile-page text panels — `components/RestaurantProfile.tsx`, `SanoScorePanel.tsx` — **M**

### P1 — Visual data storytelling
**Existing data:**
6. Fix `TrustTimeline` axis/spacing — `components/TrustTimeline.tsx` — **S** — no dependency
7. Result-row ribbon — new `ResultRibbon.tsx` — **L** — depends on P0.4
8. Reliability scale — `SanoScorePanel.tsx` — **M** — depends on P0.5
9. Repeat-findings panel — new `RepeatFindings.tsx` — **M** — depends on P0.5
10. Homepage raw/annotated demonstration — `SearchShell.tsx` — **L** — depends on P1.6/P1.7 (ribbon + axis grammar)
11. Evidence map — rewrite `MapResults.tsx` — **XL** — highest risk item, lowest priority within P1

**Requires backend/data verification:**
12. Surface `violationDescriptions` — `lib/types.ts`, `RestaurantProfile.tsx` — **S** once schema parity is confirmed; **blocked** until then

### P2 — Refinement and delight
13. Motion system rollout (chart entrance, tooltip reveal, filter cross-fade, nav-morph tightening, `motion-reduce` everywhere) — **M** — depends on P1 components existing
14. Logo badge contextual behavior on profile/methodology — `AppNav.tsx` — **S**
15. Move secondary explanatory text into tooltips — `SanoScorePanel.tsx`, `ReviewStars.tsx` — **S**
16. Alternatives reuses the docket-row component — `Alternatives.tsx` — **S**
17. Result-row press-state acknowledgment — **S**

**Recommended first three tasks (independently shippable, no giant PR):** P0.1 (tokens) → P1.6/`TrustTimeline` axis fix → P0.2 (homepage dedup).

---

## Measurable criteria for reaching 20/20

- **Zero duplicated arguments:** no two sections on any page restate the same fact or claim (audit today: 2 homepage sections, 3 profile panels).
- **100% chart comparability:** every score/timeline chart in the app renders on the same fixed 0–100 axis; none auto-scale per restaurant.
- **Full navigation parity:** all primary nav destinations reachable at 375px width, keyboard-only, with no missing links (today: 2 of 5 present on mobile).
- **Provenance is visually inferable:** a user shown any screen with color removed can still distinguish "official record" from "Sano's read" via typography/shape alone (serif+square+mono = record; the derived-ink shape/type pairing = interpretation) — testable via a blind card-sort with real users.
- **Zero unused high-value fields:** `latitude`/`longitude` rendered somewhere; `violationDescriptions` either shipped or explicitly documented as unavailable per data mode — not silently unused.
- **Distinguishability without navigation:** in a usability test, users can correctly rank 5 search results by "most concerning inspection history" without opening a single profile, using only the result-row ribbon.
- **Accessibility:** automated axe/Lighthouse accessibility score does not regress from current baseline at any point in the rollout; every new interactive chart element is keyboard-reachable with an equivalent text alternative.
- **Motion discipline:** zero animations exceed 500ms; 100% of new transition utilities ship with a `prefers-reduced-motion` equivalent (matching the one correct existing example in `AppNav.tsx`).
- **Brand recognizability test:** with the logo cropped out, at least 3 distinct on-screen elements (grade stamp, ribbon/timeline grammar, ink-color system) are identifiable as uniquely Sano's by someone shown the page cold — today, realistically 1 (the marker-grade stamp).

---

**Do not begin implementation until this roadmap is explicitly approved.**
