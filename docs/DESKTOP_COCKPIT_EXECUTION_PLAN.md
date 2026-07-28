# Sano Desktop Cockpit Execution Plan

Status: active redesign plan  
Owner: Codex integration lead  
Goal: turn Sano from a landing-page-led demo into a FAANG-grade desktop
inspection decision cockpit while keeping claims bounded by data quality.

## North Star

Sano should feel like a serious inspection-context workstation, not a generic
restaurant app and not a marketing page.

The first desktop viewport must answer:

- What restaurant is selected?
- What does the official grade say?
- What does the inspection history reveal?
- How much data backs that read?
- What comparable records should the user inspect next?

## Operating Model

One source-of-truth editor owns integration at a time. Agents get small,
non-overlapping tasks with explicit file ownership.

- Codex: integration lead, repo-wide implementation, final verification.
- Cursor: focused component implementation in assigned files only.
- Claude: product, copy, ethics, and presentation review.

No agent may:

- Edit files outside their assigned scope.
- Add dependencies without explicit review.
- Invent official inspection facts.
- Reintroduce trust gap before popularity matching is meaningful.
- Use safe, unsafe, best, worst, dangerous, or recommendation language.

## Phase 0: Preflight And Locks

Goal: prevent merge conflict and product drift before redesign starts.

Tasks:

1. Confirm current working tree status.
2. Preserve unrelated user changes.
3. Assign file ownership.
4. Run baseline verification.

Baseline commands:

```bash
npm run lint
npm run build
npm run acceptance
```

Done when:

- Baseline passes or known failures are documented.
- Each active task has one owner and one file set.
- The active design direction is the cockpit layout below.

## Phase 1: Cockpit Information Architecture

Goal: make the main product visible immediately.

Replace the current page order:

```txt
Hero
Bridge
How it works
Demo paths
Search app
Footer
```

with:

```txt
App chrome
Compact credibility bar
Desktop decision cockpit
Coverage dashboard
Methodology / limitations
Footer
```

Desktop cockpit:

- Left column: search, filters, result list.
- Right column: selected restaurant evidence panel.
- Right panel top: grade, reliability, confidence, recent critical flags.
- Right panel middle: mini inspection timeline.
- Right panel bottom: alternatives and profile link.
- Methodology stays linked or disclosed compactly, not as a full page block
  above the app.

Acceptance criteria:

- Search/results are visible in the first desktop viewport.
- Selected restaurant context is visible in the first desktop viewport.
- The page no longer requires scrolling through explanatory sections before
  using the product.
- The app does not present rankings, recommendations, or safety verdicts.

First-viewport hierarchy:

- Top app chrome: Sano, data freshness, source, methodology link.
- Primary action: search by restaurant name, address, ZIP, borough, or cuisine.
- Secondary controls: grade, recent criticals, confidence/history depth,
  trajectory.
- Tertiary controls: cuisine and ZIP when the result set is already narrowed.

Default result fields:

- Restaurant name.
- Cuisine.
- Address, borough, ZIP when available.
- Latest official grade.
- Inspection reliability.
- Inspection cycle count.
- Confidence/history depth.
- Recent critical state.

Do not lead with:

- Best, safest, recommended, top, hidden gem, overrated, risk verdict, or
  citywide coverage language.

## Phase 2: FAANG-Grade Visual System

Goal: cohesive, restrained, dense, premium UI.

Design rules:

- Use a civic/operations palette: white, charcoal, muted blue, inspection
  green, restrained amber, restrained coral.
- Avoid glossy gradients, large decorative sections, and lifestyle marketing.
- Use tight spacing and consistent modules.
- Use cards for repeated rows and detail modules only.
- Do not nest cards inside cards.
- Preserve visible limitations and data freshness.

Component surfaces:

- App shell.
- Filter controls.
- Result row/card.
- Selected evidence panel.
- Mini timeline.
- Coverage dashboard.
- Profile evidence layout.
- Empty/loading/error states.

Acceptance criteria:

- Desktop layout feels like a serious tool.
- Colors and spacing are consistent across homepage and profile.
- No overlarge rounded marketing blocks above the product.
- No text overlap at desktop or mobile breakpoints.

## Phase 3: Selected Evidence Panel

Goal: expose Sano's differentiator without forcing profile navigation.

Panel structure:

1. Header
   - Restaurant name.
   - Address, borough, ZIP when available.
   - Latest inspection date.

2. Evidence metrics
   - Official grade.
   - Inspection reliability.
   - Confidence / history depth.
   - Recent critical status.

3. Mini timeline
   - Inspection dates.
   - Raw scores.
   - Grade markers.
   - Critical and repeat markers.

4. Plain-English context
   - One cautious summary sentence.
   - Data limits sentence.

5. Alternatives
   - Nearby/current-index comparisons.
   - No endorsements.

Acceptance criteria:

- A user can understand why the selected result matters without opening a
  profile.
- Every derived signal is paired with official/source context.
- Trust gap is hidden.

## Phase 4: Coverage Dashboard

Goal: make backend strength and limits visible.

Dashboard metrics:

- Total records indexed.
- Total inspections.
- Data as-of date.
- Borough distribution.
- ZIP completeness.
- Coordinate completeness.
- Inspection-depth distribution.
- Confidence distribution.
- Popularity metadata coverage.
- Trust-gap availability, hidden from product surfaces unless meaningful.

Recommended backend endpoint:

```txt
GET /api/data-quality/coverage
```

Recommended response groups:

- `source`: active source, fallback availability, generated timestamp.
- `records`: restaurant count, inspection count, returned API count, fallback
  count.
- `coverage.inspection_cycles`: p25, median, p75, one, two, three-plus.
- `coverage.location`: missing ZIP, zero/null coordinates, map-ready count and
  percent.
- `coverage.inspection_labels`: recent critical, past critical only, no recent
  critical, unknown.
- `coverage.confidence`: high, medium, limited, unavailable.
- `coverage.enrichment`: popularity matched, trust gap available.
- `presentation_safety`: `safe`, `limited`, or `unsafe` plus machine-readable
  reason codes.

Presentation-safe thresholds:

- Demo-safe: 1,000+ official records, sourced, searchable, limitations visible.
- Stronger public demo: 3,000+ records and improved 3+ cycle coverage.
- Citywide decision language: only when coverage and coordinate completeness are
  materially representative and documented.

Numeric quality gates before expansion:

- API returned / expected at least 99.5%.
- Map-ready percent at least 99%.
- Missing ZIP percent at most 0.5%.
- Zero coordinate percent at most 0.5%.
- Restaurants with 2+ cycles at least 70%.
- Limited confidence at most 35%.
- High or medium confidence at least 60%.
- Unknown critical label at most 2%.
- Unknown latest inspection age at most 2%.
- Popularity matched at least 25% before showing popularity-derived UI.
- Trust gap available at least 50% before showing trust gap UI.

Acceptance criteria:

- Dashboard distinguishes indexed total from loaded/search result slice.
- Missing ZIP/coordinate/popularity fields are visible as data quality, not UI
  failure.
- Dashboard does not imply complete NYC coverage.

## Phase 5: Profile Evidence Upgrade

Goal: make profile pages evidence-first.

New profile order:

1. Header with official grade and Sano read.
2. Timeline/evidence immediately visible.
3. Reliability breakdown.
4. Violation/repeat context.
5. Alternatives.
6. Source context and methodology.

Acceptance criteria:

- Timeline appears above or near the first fold on desktop.
- Summary does not outrank evidence.
- Raw violation text is not the primary experience.

## Phase 6: Data Quality Expansion

Goal: expand records only after improving quality mix.

Targets:

- 3,000 to 5,000 restaurants.
- Prefer 3+ inspection cycles where possible.
- Exclude or downrank records with missing coordinates from map-like displays.
- Keep low-confidence records visible but clearly labeled.
- Hide trust gap until popularity matching is meaningfully populated.

Acceptance criteria:

- Generated data report shows inspection-depth distribution.
- Generated data report shows coordinate and ZIP completeness.
- Demo paths include varied stories, not only recent critical flags.

## Agent Task Board

### Codex Task A: Integration Shell

Owner: Codex  
Files:

- `components/SearchShell.tsx`
- new component files under `components/`

Deliverables:

- Main page reorganized into cockpit-first layout.
- Existing hero/bridge/demo content moved below, reduced, or removed.
- Selected restaurant evidence panel integrated.

Acceptance:

- Search/results and selected panel are visible on desktop first viewport.
- `npm run lint` and `npm run build` pass.

### Cursor Task B: Result And Evidence Components

Owner: Cursor  
Files:

- `components/RestaurantCard.tsx`
- new `components/DecisionCockpit.tsx`
- new `components/CockpitResultsColumn.tsx`
- new `components/SelectedEvidencePanel.tsx`
- new `components/EvidenceSummaryStrip.tsx`
- new `components/MiniTrustTimeline.tsx`
- new `components/CockpitAlternatives.tsx`
- new `components/MethodologyDrawer.tsx`

Deliverables:

- Cockpit composition shell.
- Left results column.
- Dense result card/row.
- Selected evidence panel.
- Mini timeline.
- Client-side alternatives.
- Compact methodology drawer.

Constraints:

- Do not edit `SearchShell.tsx` unless explicitly assigned during integration.
- Do not edit data files.
- Do not add dependencies.
- Hide trust gap.

Acceptance:

- Components consume existing `Restaurant` and `Inspection` types.
- Components use neutral inspection-context copy.
- Components handle missing ZIP/popularity gracefully.

Recommended component props:

```ts
type DecisionCockpitProps = {
  filters: RestaurantFilters;
  cuisines: string[];
  results: Restaurant[];
  visibleRestaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  loading: boolean;
  loadError: boolean;
  filtersActive: boolean;
  hiddenResultCount: number;
  onFiltersChange: (filters: RestaurantFilters) => void;
  onClearFilters: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onShowMore: () => void;
};

type SelectedEvidencePanelProps = {
  restaurant: Restaurant | null;
  candidates: Restaurant[];
  onSelectAlternative: (restaurant: Restaurant) => void;
};

type MiniTrustTimelineProps = {
  inspections: Inspection[];
  maxItems?: number;
};
```

### Claude Task C: Copy And Ethics Review

Owner: Claude  
Files:

- Review-only first.
- Suggested changes can later be applied by Codex.

Deliverables:

- Rewrite cockpit copy for clarity and restraint.
- Flag legal/ethical risk.
- Produce 60-second demo script.

Acceptance:

- No unsafe/safe/best/recommendation language.
- Data limitations are visible but not fear-inducing.

### Codex/Data Task D: Coverage Dashboard

Owner: Codex or data worker  
Files:

- `lib/server/restaurants.ts`
- `app/api/health/route.ts`
- new `components/CoverageDashboard.tsx`
- optionally new API route if needed

Deliverables:

- Coverage metrics exposed and rendered.
- Dashboard distinguishes indexed total from loaded result count.

Acceptance:

- ZIP, coordinate, inspection-depth, confidence, and popularity coverage shown.
- Dashboard remains honest in fallback JSON mode.

## Paste-Ready Prompts

### Cursor Prompt

```txt
You are Cursor acting as a distinguished frontend engineer on Sano.

Task: build dense cockpit components only.

Owned files:
- components/RestaurantCard.tsx
- components/DecisionCockpit.tsx
- components/CockpitResultsColumn.tsx
- components/SelectedEvidencePanel.tsx
- components/EvidenceSummaryStrip.tsx
- components/MiniTrustTimeline.tsx
- components/CockpitAlternatives.tsx
- components/MethodologyDrawer.tsx

Do not edit data files, types, package files, or global CSS.
Only edit SearchShell if explicitly asked by the integration lead.
Do not add dependencies.

Context:
Sano shows official NYC restaurant inspection context. It is not a safety
verdict and not a recommendation engine. Hide trust gap. Popularity metadata
appears only when matched.

Build:
1. A compact `RestaurantCard` variant showing name, cuisine, borough/ZIP, official grade,
   reliability, confidence/history depth, recent critical state, and inspection
   cycle count.
2. `DecisionCockpit` and `CockpitResultsColumn` composition shells.
3. A selected restaurant evidence panel with top metrics, mini timeline,
   cautious summary, data limits, alternatives/profile link slot.
4. A reusable mini inspection timeline from existing Inspection data.
5. Client-side cockpit alternatives using the current result candidates.
6. Compact methodology drawer with a persistent `/methodology` link.

Acceptance:
- Uses existing Restaurant/Inspection types.
- Handles missing ZIP/rating gracefully.
- No safe/unsafe/best/recommended language.
- No trust gap UI.
- npm run lint passes.
```

### Claude Prompt

```txt
You are Claude acting as a distinguished product/design/ethics reviewer on Sano.

Review the cockpit redesign for a NYC restaurant inspection-context app.

Goal:
Make Sano feel like a serious decision cockpit while staying honest about data.

Please produce:
1. First-viewport hierarchy.
2. Exact copy for app chrome, empty states, data limitations, and selected panel.
3. Terms to use and terms to ban.
4. 60-second demo script.
5. Red flags if the UI overclaims.

Constraints:
- No safe/unsafe language.
- No best/worst/recommended language.
- No trust gap until popularity matching is meaningful.
- Treat 1,000 records as demo coverage, not complete NYC coverage.
```

### Codex Review Prompt

```txt
Review the Sano cockpit branch before merge.

Check:
1. Is search/results visible in the first desktop viewport?
2. Is selected inspection evidence visible without opening a profile?
3. Is trust gap hidden?
4. Are official and derived signals visually distinct?
5. Are data limits visible?
6. Are files outside assigned scope changed?
7. Do lint, build, and acceptance pass?

Return findings first with file/line references.
```

## Final Verification Gate

Before merge or demo:

```bash
npm run lint
npm run build
npm run acceptance
```

Manual QA:

- Desktop first viewport.
- Desktop selected restaurant panel.
- ZIP search.
- Cuisine search.
- Empty state.
- Profile route.
- Methodology route.
- Mobile layout.
- Console logs.
