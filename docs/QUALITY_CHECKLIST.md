# Quality Checklist

Use this before the final demo and before major pull requests.

## Product

- [ ] The app clearly demonstrates the Sano thesis.
- [ ] The search page looks like an actual product experience.
- [ ] Restaurant cards show inspection context, not just ratings.
- [ ] Restaurant profiles explain the inspection history.
- [ ] The timeline is understandable without a long explanation.
- [ ] Alternatives feel helpful rather than punitive.
- [ ] Methodology is easy to find.

## Data

- [ ] Primary demo data is the committed official generated seed.
- [ ] Synthetic data is retained only as a controlled fallback.
- [ ] Demo data is stable.
- [ ] Data as-of date is visible where appropriate.
- [ ] Derived fields are explainable.
- [ ] No invented official inspection claims are presented as fact.
- [ ] Low-confidence data is not over-labeled.
- [ ] Public ratings/reviews/trust gap are hidden or marked unavailable when popularity metadata is missing.

## UX And Visual Design

- [ ] Desktop layout is polished.
- [ ] Mobile layout is usable.
- [ ] Text does not overlap.
- [ ] Buttons and filters are readable.
- [ ] Color is not the only way meaning is communicated.
- [ ] The UI does not feel like a fear-based compliance dashboard.
- [ ] Empty states and loading states are acceptable.

## Accessibility Acceptance

- [ ] Baseline screenshots in `docs/accessibility-audit/screenshots/baseline/` remain unchanged.
- [ ] `npm run a11y` passes.
- [ ] `npm run check` passes.
- [ ] Keyboard focus is visible on navigation, hero search, filters, result actions, profile links, and not-found recovery links.
- [ ] Hero search submit moves focus visibly into the search/results region.
- [ ] Search loading, result count, empty state, and error state are announced through one polite status region.
- [ ] Reviewed meaningful text uses audited readable tokens or documented allowlisted exceptions.
- [ ] Score panel and not-found navigation have accessible structure.
- [ ] Remaining manual checks are recorded in `docs/accessibility-audit/validation.md`.

## Copy And Ethics

- [ ] No absolute safety claims.
- [ ] No illness causation claims.
- [ ] Labels are neutral.
- [ ] Limitations are visible.
- [ ] Methodology explains point-in-time inspections.
- [ ] Official records are distinguished from derived Sano scores.

## Engineering

- [ ] App runs locally.
- [ ] App builds.
- [ ] `npm run check` passes.
- [ ] `npm run acceptance` passes against the demo URL.
- [ ] Main routes work.
- [ ] `/api/health` returns JSON with `mode = official-generated-seed`.
- [ ] `/api/restaurants` returns JSON with the official seed count.
- [ ] Missing restaurant IDs return controlled JSON/page responses.
- [ ] No unused placeholder pages.
- [ ] No unnecessary dependencies.
- [ ] Shared types are consistent.
- [ ] PRs are small enough to review.

## Presentation

- [ ] Final Vercel URL works.
- [ ] Demo path works from start to finish.
- [ ] Backup screenshots exist.
- [ ] Team can explain stack.
- [ ] Team can explain data source.
- [ ] Team can explain scoring at a high level.
- [ ] Team can explain the parallax-inspired hero and why it is visual depth rather than a heavy motion system.
- [ ] Team can explain why the sticky navigation keeps Methodology and Try Sano visible.
- [ ] Team can explain the color system and why color is not the only source of meaning.
- [ ] Team can explain limitations.
