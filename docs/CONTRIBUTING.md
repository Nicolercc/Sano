# Contributing

This project is a one-week group build. The workflow is designed to help three contributors move quickly without breaking each other's work.

## Core Rule

Do not push directly to `main`.

All work should happen on a feature branch and be merged through a pull request.

## Branch Naming

Use clear branch names:

```txt
feature/app-shell
feature/profile-timeline
feature/data-scoring
feature/methodology
fix/mobile-layout
fix/timeline-labels
```

## Pull Request Expectations

Each PR should include:

1. What changed.
2. Why it changed.
3. What files are affected.
4. How it was tested.
5. Screenshots for UI changes when possible.

## Keep PRs Small

Best practice: one PR should solve one problem.

Avoid giant PRs that change app layout, data shape, styles, and scoring at the same time.

## Shared Files

These files are high-conflict and should be changed carefully:

- `lib/types.ts`
- `data/sample-restaurants.json`
- global CSS
- `app/page.tsx`
- shared layout components

Before changing these, post a short note to the team explaining what needs to change and why.

## Coding Standards

1. Use TypeScript types.
2. Keep components focused.
3. Put shared logic in `lib/`.
4. Avoid duplicating scoring formulas in UI components.
5. Use realistic copy, not placeholder text.
6. Do not introduce new dependencies without team agreement.
7. Do not make absolute safety claims.

## Legal And Ethical Copy Rules

Do not use:

- safe
- unsafe
- dangerous
- sick
- contaminated unless quoting official source language

Prefer:

- volatile inspection history
- recent critical flag
- repeat pattern
- improving trajectory
- limited data
- official inspection records
- point-in-time inspection

## Local Verification

Before opening a PR:

1. Run the app locally.
2. Check the changed screen on desktop.
3. Check the changed screen on mobile.
4. Confirm there are no placeholder strings.
5. Confirm the app still follows the product thesis.

## Review Standard

Review for:

- correctness
- scope control
- readability
- visual quality
- data accuracy
- ethical wording
- merge-conflict risk

## Final Stabilization Rule

On the final day, only fix showstopper bugs, presentation blockers, and serious visual issues. Do not redesign or rewrite major areas.

