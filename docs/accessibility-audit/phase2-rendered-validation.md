# Phase 2 Rendered Validation

Date checked: 2026-09-22
Branch: `feat/accessibility-audit`
Local URL: `http://127.0.0.1:4176`

This pass verifies selected Phase 2 fixes in a rendered browser after the automated checks passed. It does not replace a full screen-reader audit.

## Evidence Files

| Evidence | File |
| --- | --- |
| Desktop hero after Phase 2 fixes | `screenshots/phase2-after/01-desktop-hero-after.png` |
| Hero search focus handoff viewport | `screenshots/phase2-after/03-chrome-hero-search-focus-handoff.png` |
| Filter query focus after keyboard Tab | `screenshots/phase2-after/04-chrome-filter-query-focus.png` |
| Empty-state/live-status path after ZIP search settles | `screenshots/phase2-after/05-chrome-empty-state-live-status.png` |
| Restaurant profile semantic structure after heading fix | `screenshots/phase2-after/06-chrome-profile-semantics.png` |
| Restaurant not-found recovery navigation | `screenshots/phase2-after/07-chrome-not-found-nav.png` |
| Mobile profile top viewport at 390 x 844 | `screenshots/phase2-after/09-mobile-profile-top.png` |
| Mobile profile score/source viewport at 390 x 844 | `screenshots/phase2-after/10-mobile-profile-score-source.png` |
| Mobile inspection timeline viewport at 390 x 844 | `screenshots/phase2-after/11-mobile-profile-timeline.png` |
| Desktop hero after demo-chip fix (Brooklyn/Coffee/Korean chips visible) | `screenshots/phase2-after/12-desktop-hero-final.png` |
| Desktop profile: inspection reliability heading + timeline in one viewport | `screenshots/phase2-after/13-desktop-profile-score-heading.png` |
| Mobile hero after demo-chip fix | `screenshots/phase2-after/14-mobile-hero-final.png` |
| Mobile inspection timeline viewport | `screenshots/phase2-after/15-mobile-profile-timeline-final.png` |

## Evidence Correction (2026-09-22)

The first capture pass produced two defects that were caught and fixed before merge, not after:

- Five `chrome-*` screenshots were captured as full macOS browser windows, exposing the operator's real bookmarks bar and open browser tabs. Each file was cropped to the page viewport only (removing the top ~118px of OS/browser chrome) before being kept as evidence. Baseline and Phase 1 screenshots were never affected — this was specific to this capture pass.
- The full-page "scroll and stitch" captures (`01-desktop-landing-and-results.png`, plus two files that were never committed) had a capture-tool defect that duplicated page sections repeatedly throughout the stitched image. This was a screenshot-pipeline bug, not an application bug — the live page does not double-render. The desktop file was replaced with `01-desktop-hero-after.png`, a single clean crop of the one region (the hero) that was unaffected by the duplication. The two uncommitted duplicated mobile files were discarded rather than fixed, since single-viewport captures already cover the same states cleanly.
- `10-mobile-profile-timeline.png` was an exact duplicate of the score/source panel mislabeled as the timeline; it was removed in favor of the correctly named `10-mobile-profile-score-source.png`, with the real timeline chart kept as `11-mobile-profile-timeline.png`.

Full-page reflow evidence is therefore **not available as a single image** for this pass. Reflow was checked by viewing individual viewport-height slices while scrolling manually (see Rendered Checks Completed below), not by a stitched screenshot.

## Rendered Checks Completed

| Check | Result |
| --- | --- |
| Local app render | Chrome loaded `http://127.0.0.1:4176` with the expected primary navigation, hero search, filter controls, results, and status text. |
| Hero search focus handoff | Setting the hero search to `11414` and pressing Enter moved focus to the `Search restaurants` heading in the real Chrome accessibility tree. |
| Filter focus next step | Pressing Tab from the focused search heading moved into the filter query input with the current query selected. |
| Live status empty state | After the `11414` query settled, the status text changed to `No matching restaurants in the current index.` and the empty-state UI was visible. |
| Profile score semantics | Chrome exposed `Inspection reliability` as an `h2` in the restaurant profile flow. |
| Not-found navigation | Chrome exposed the not-found route local nav as `Primary navigation` with recovery links to Sano and Methodology. |
| Mobile profile viewports | At 390 x 844, the profile top, score/source region, and timeline chart viewport each render once and remain readable. |
| Demo chip fix rendered correctly | `12-desktop-hero-final.png` and `14-mobile-hero-final.png` confirm the "Try:" row now reads Brooklyn / Coffee / Korean / Lucky Chix, matching the `fix(demo)` commit. |
| **Live-status debounce, measured directly (2026-09-22)** | Drove `http://127.0.0.1:4176` with gstack's headless browser (`browse` CLI). Baseline `#search-status` read `"16 restaurants shown."`. Clicked the filter query input and sent keystrokes `c`, `h`, `i`, `x` individually with ~120ms between presses (typing finished at t=0.72s from the first keystroke). Polled `#search-status` every ~150ms for 5s after. The value stayed at `"16 restaurants shown."` through t=1.005s, changed exactly once to `"1 restaurant shown."` between t=1.005s and t=1.229s (~500ms after the last keystroke, matching `LIVE_STATUS_QUERY_DEBOUNCE_MS`), then held that exact string for the remaining ~4.7s of polling — 24 samples total, one distinct value change. This directly confirms the debounce fix: the region does not fire once per keystroke, and it settles on the correct final count ("chix" matches exactly one seed restaurant, Lucky Chix). Console errors on the page: none. |

## Limits Of This Pass

- The debounce/announcement check (above) verified the DOM-level `aria-live` contract programmatically: the correct text appears in the live region exactly once, at the right time. This is a strong proxy for screen-reader behavior but is not the same as a human listening to VoiceOver — a real screen reader could theoretically batch or split announcements differently than the DOM mutation count implies. Treat this as "verified at the ARIA contract level," not "confirmed by ear."
- This pass did not cover 400% zoom, reduced motion, or the full timeline perceptual review.
- Full-page reflow was checked via individual clean viewport screenshots (hero and timeline, desktop and mobile), not a single stitched full-page image — the original stitching tool had a duplication defect (see Evidence Correction above) and was abandoned rather than fixed, since per-viewport screenshots give the same visual assurance without the defect.
- The mobile timeline chart still benefits from visual refinement at narrow widths; the textual inspection list remains present as the non-chart fallback.

## Remaining Human Checks

- Do one real VoiceOver (or NVDA) pass as a final confirmation before presenting this publicly — the DOM-level measurement above is strong evidence but isn't a substitute for actually hearing it.
- Repeat the full no-mouse journey from landing through profile and methodology.
- Decide whether to refine the mobile timeline chart now or explicitly defer it to the next visual polish phase.
- 400% zoom / reflow and reduced-motion checks remain untested and out of scope for this pass.
