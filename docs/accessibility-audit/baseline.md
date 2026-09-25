# Sano Accessibility Audit Baseline

Date frozen: 2026-09-22
Branch: `feat/accessibility-audit`
Local baseline URL: `http://127.0.0.1:4176`

## Scope

This audit is scoped to the critical product journey:

Landing -> search -> filters -> results -> restaurant profile -> inspection timeline -> methodology

The goal is to evaluate the path a diner, reviewer, or portfolio viewer would actually use to understand Sano. This is intentionally not an audit of every pixel or every route in the repository.

## Journey Map

| Step | User task | Primary surface | Component or route |
| --- | --- | --- | --- |
| 1 | Understand what Sano does and start a query | Landing hero, proof points, demo search | `app/page.tsx`, `components/SearchShell.tsx`, `components/AppNav.tsx` |
| 2 | Search by restaurant, cuisine, borough, or ZIP | Hero search and search section | `components/SearchShell.tsx`, `app/api/restaurants/route.ts` |
| 3 | Narrow the record set | Query, cuisine, trajectory, confidence, recent critical filters | `components/FilterBar.tsx` |
| 4 | Compare result cards and map summary | Coverage snapshot, selected restaurant, result cards | `components/MapResults.tsx`, `components/RestaurantCard.tsx` |
| 5 | Open a specific restaurant | Restaurant profile | `app/restaurants/[id]/page.tsx`, `components/RestaurantProfile.tsx` |
| 6 | Interpret inspection history over time | Score panel, timeline, alternatives | `components/SanoScorePanel.tsx`, `components/TrustTimeline.tsx`, `components/Alternatives.tsx` |
| 7 | Understand data limits and scoring language | Methodology page | `app/methodology/page.tsx`, `components/MethodologyPanel.tsx` |

## Baseline Screenshots

All screenshots are before-fix evidence and should be preserved as portfolio material.

| File | State captured | Viewport |
| --- | --- | --- |
| `docs/accessibility-audit/screenshots/baseline/01-desktop-landing.png` | Desktop landing page | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/02-mobile-landing.png` | Mobile landing page | 390 x 844, high-DPR capture |
| `docs/accessibility-audit/screenshots/baseline/03-search-filter-state.png` | Search filters with active query, trajectory, confidence, and recent critical controls | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/04-search-results.png` | Default search results and selected restaurant context | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/05-empty-state.png` | Empty search result state | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/06-loading-state.png` | Loading state while restaurant search request is pending | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/07-error-state.png` | Error state after forced restaurant search failure | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/08-restaurant-profile.png` | Restaurant profile overview | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/09-inspection-timeline.png` | Inspection timeline and score panel | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/10-keyboard-focus-landing-search.png` | Keyboard focus on landing search input | 1440 x 1100 |
| `docs/accessibility-audit/screenshots/baseline/11-methodology.png` | Methodology and limitations page | 1440 x 1100 |

## Baseline Notes

- The branch was created before remediation work.
- Existing unrelated local changes were left untouched.
- The app was run locally with the current repository data.
- Loading and error screenshots were captured by holding or failing the restaurant search API request in the browser only. No app code was modified to stage those states.
- No accessibility fixes have been applied in this baseline pass.

## Out Of Scope For This Pass

- Repository-wide pixel review.
- Admin, build, ingestion, or data tooling screens.
- Exhaustive screen-reader testing beyond the critical journey.
- Remediation changes. Fixes should happen only after this evidence set is accepted.
