# Phase 1 Accessibility Audit

Date audited: 2026-09-22
Branch: `feat/accessibility-audit`
Scope: critical product journey from `baseline.md`

This pass covers the first two Phase 1 dimensions provided for Sano:

1. Semantic structure
2. Keyboard accessibility

The remaining Phase 1 dimensions can be added to this file as separate sections without disturbing the Phase 0 evidence.

## Evidence Files

| Evidence | File |
| --- | --- |
| Rendered route semantics and keyboard focus log | `docs/accessibility-audit/phase1-browser-audit.json` |
| Keyboard screenshots | `docs/accessibility-audit/screenshots/phase1-keyboard/` |
| Phase 0 baseline screenshots | `docs/accessibility-audit/screenshots/baseline/` |

## 1. Semantic Structure

### Confirmed Strengths To Preserve

| Route/state | Evidence |
| --- | --- |
| `/` | One `<main>`, labeled primary `<nav>`, one `<header>`, one `<footer>`, no unlabeled `<section>` elements, one real `<h1>`: “The grade is on the door. The story isn’t.” |
| `/restaurants/50114980` | One `<main>`, labeled primary `<nav>`, one page `<h1>` for the restaurant name, structured inspection timeline lists, alternatives represented as a list. |
| `/methodology` | One `<main>`, labeled primary `<nav>`, one `<h1>`, clear `h2` sections, limitation claims represented as a `<ul>`. |
| Restaurant not-found boundary | One `<main>`, one `<h1>`, clear recovery link back to restaurant search. |
| Search states | Empty/error/loading states are rendered inside the search results area with descriptive text and recovery actions where applicable. |

### Semantic Issues

| Issue | Evidence | Impact |
| --- | --- | --- |
| `SanoScorePanel.tsx` renders a `<section>` without a real heading or accessible section name. The visible “Inspection reliability” label is a `<p>`, not a heading or `aria-labelledby` target. | `phase1-browser-audit.json` reports one unlabeled section on `/restaurants/50114980`. | Profile page semantics are slightly weaker than the homepage; screen-reader landmark/section navigation has less useful structure. |
| `app/restaurants/[id]/not-found.tsx` uses a local `<nav>` with no accessible name. Its Methodology link also lacks the explicit focus-visible styling used by `AppNav`. | `phase1-browser-audit.json` reports `navs: [{"label":"","linkCount":2}]` for `/restaurants/not-a-real-id`. | Internal error boundary regresses from the stronger primary navigation pattern. |

## 2. Keyboard Accessibility

### Keyboard Pass Method

The browser was loaded fresh at `/`. The test used keyboard events only:

- `Tab` through primary navigation, hero search, sample search chips, demo cards, filter controls, map/result controls, profile actions, and profile navigation.
- Typed `11414` into the hero search input.
- Pressed `Enter` to submit search.
- Pressed `Space` on the “Recent criticals” checkbox.
- Pressed `Enter` on “Open profile.”
- Pressed `Enter` on the profile “Methodology” nav link.

No mouse interaction was used for the traversal.

### Confirmed Strengths To Preserve

| Area | Result |
| --- | --- |
| Primary nav | All nav links receive keyboard focus in a logical order and show an explicit outline. |
| Landing search | The hero input receives a visible focus ring; `Enter` submits the search. |
| Sample search buttons | Buttons are keyboard reachable and show visible focus. |
| Demo cards | The full card links are keyboard reachable with visible focus. |
| Filters | Query input, selects, and checkbox are keyboard reachable. Space toggles the “Recent criticals” checkbox. |
| Map/result controls | Restaurant selection buttons and result card actions are keyboard reachable. |
| Profile opening | `Enter` on “Open profile” navigates to a restaurant profile. |
| Methodology navigation | The profile nav “Methodology” link is reachable and `Enter` opens `/methodology`. |
| Keyboard traps | No trap was observed in the critical journey. |
| Focus obscured | The recorded active controls were not covered by another element when checked at their center point. |

### Keyboard Issues

| Issue | Evidence | Impact |
| --- | --- | --- |
| Filter text/select controls have weak visible focus: computed outline is transparent and the visible change is mostly border color. | `phase1-browser-audit.json` steps 16-19 show `outlineColor: rgba(0, 0, 0, 0)` for filter input/select controls. | Keyboard users may lose track of focus, especially in bright environments or low-vision contexts. |
| After submitting the hero search, focus remains in the hero area instead of moving to the search results/filter region. The deterministic run then tabs through earlier content before reaching the actual search controls; several filter controls were recorded outside the viewport before the viewport caught up. | `phase1-browser-audit.json` steps 16-20 record filter controls with `inViewport: false` after hero search submission. | Focus order is technically sequential but not task-aligned. A keyboard user who submits a search expects the next focus stop to be the results/filter context. |

## Phase 1 Screenshot Manifest

| File | Captured state |
| --- | --- |
| `screenshots/phase1-keyboard/01-focus-nav-brand.png` | Keyboard focus on nav brand link |
| `screenshots/phase1-keyboard/02-focus-landing-search.png` | Keyboard focus on landing search input |
| `screenshots/phase1-keyboard/03-enter-submits-landing-search.png` | Hero search submitted with `Enter` |
| `screenshots/phase1-keyboard/05-focus-recent-criticals.png` | Keyboard traversal reached recent criticals control |
| `screenshots/phase1-keyboard/06-space-toggles-recent-criticals.png` | `Space` toggled recent criticals checkbox |
| `screenshots/phase1-keyboard/07-focus-open-profile.png` | Keyboard focus on result “Open profile” action |
| `screenshots/phase1-keyboard/08-enter-opens-profile.png` | `Enter` opened restaurant profile |
| `screenshots/phase1-keyboard/09-focus-profile-methodology-link.png` | Keyboard focus on profile Methodology nav link |
| `screenshots/phase1-keyboard/10-enter-opens-methodology.png` | `Enter` opened methodology route |

## Recommended Remediation Order

1. Add explicit focus-visible outlines/rings to `FilterBar.tsx` input/select controls.
2. After hero search submission, move focus to the search section heading or the search filter input after scrolling.
3. Promote `SanoScorePanel.tsx` “Inspection reliability” to a section heading or wire the section to `aria-labelledby`.
4. Replace the not-found custom nav with `AppNav` or add `aria-label="Primary navigation"` plus matching focus-visible styles.
