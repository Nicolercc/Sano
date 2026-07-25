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

- [ ] Demo data is either real official data or clearly disclosed synthetic data modeled on official fields.
- [ ] Demo data is stable.
- [ ] Data as-of date is visible where appropriate.
- [ ] Derived fields are explainable.
- [ ] No invented official inspection claims are presented as fact.
- [ ] Low-confidence data is not over-labeled.

## UX And Visual Design

- [ ] Desktop layout is polished.
- [ ] Mobile layout is usable.
- [ ] Text does not overlap.
- [ ] Buttons and filters are readable.
- [ ] Color is not the only way meaning is communicated.
- [ ] The UI does not feel like a fear-based compliance dashboard.
- [ ] Empty states and loading states are acceptable.

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
- [ ] Main routes work.
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
- [ ] Team can explain limitations.
