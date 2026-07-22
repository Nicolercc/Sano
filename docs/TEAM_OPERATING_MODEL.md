# Team Operating Model

Team size: 3 contributors  
Goal: ship a polished MVP in one week  
Operating style: clear ownership, small pull requests, daily integration

## Team Principle

The goal is not to assign status. The goal is to reduce ambiguity.

Good teams move faster when each contributor knows what they own, what they should avoid touching, and how their work connects to the final demo.

## Contributor A: App And Design Lead

Owns:

- Main search page
- App shell
- Layout
- Filter bar
- Restaurant cards
- Responsive design polish

Primary files:

- `app/page.tsx`
- `components/SearchShell.tsx`
- `components/FilterBar.tsx`
- `components/RestaurantCard.tsx`

Avoid unless coordinated:

- `lib/types.ts`
- `data/sample-restaurants.json`
- scoring scripts
- timeline internals

## Contributor B: Data And Scoring Lead

Owns:

- Data shape
- Sample restaurant records
- Scoring formulas
- Trajectory labels
- Confidence rules
- NYC DOHMH ingestion script

Primary files:

- `lib/types.ts`
- `lib/scoring.ts`
- `lib/mock-data.ts`
- `data/sample-restaurants.json`
- `scripts/ingest_nyc_dohmh.py`
- `scripts/score_restaurants.py`

Avoid unless coordinated:

- major UI layout changes
- final visual polish files
- unrelated docs

## Contributor C: Profile, Timeline, And Presentation Lead

Owns:

- Restaurant profile
- Inspection timeline
- Score panel
- Alternatives
- Methodology page
- Demo script
- Presentation clarity

Primary files:

- `app/restaurants/[id]/page.tsx`
- `app/methodology/page.tsx`
- `components/RestaurantProfile.tsx`
- `components/TrustTimeline.tsx`
- `components/SanoScorePanel.tsx`
- `components/Alternatives.tsx`
- `components/MethodologyPanel.tsx`
- `docs/QUALITY_CHECKLIST.md`

Avoid unless coordinated:

- shared types
- data seed structure
- main search layout

## Daily Working Rhythm

### Start Of Day

Each contributor posts:

1. What they will finish today.
2. Which files they expect to touch.
3. Any blocker.

### Middle Of Day

Merge small completed work. Do not wait until the end of the day.

### End Of Day

Each contributor posts:

1. What is done.
2. What is not done.
3. What changed in shared files.
4. What should be reviewed.

## Conflict Avoidance

1. One owner per area.
2. Shared files require coordination.
3. Branches should be short-lived.
4. Pull before starting work.
5. Merge daily.
6. No surprise dependency additions.
7. No big rewrites after Day 5.
8. Day 7 is stabilization only.

## Low-Risk Contributions

Useful work that does not require deep coding:

- Source collection.
- Methodology clarity review.
- Demo script practice.
- Mobile visual QA.
- Restaurant content cleanup.
- Screenshot capture.
- Presentation slide outline.
- Accessibility review.

## Team Lead Checklist

Every day, confirm:

1. Is the demo path still working?
2. Is `main` deployable?
3. Are people editing separate files?
4. Are shared data types stable?
5. Is the product still proving the North Star?

