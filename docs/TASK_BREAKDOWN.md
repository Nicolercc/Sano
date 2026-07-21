# Task Breakdown

This file turns the sprint plan into assignable work for a three-person team.

## Labels To Use In GitHub

- `area:frontend`
- `area:data`
- `area:docs`
- `area:visualization`
- `area:infra`
- `priority:p0`
- `priority:p1`
- `type:feature`
- `type:bug`
- `type:docs`
- `status:blocked`

## Contributor A: App And Design Lead

### P0: Scaffold Next.js App

Deliverables:

- Next.js app created.
- TypeScript enabled.
- Tailwind enabled.
- Basic home page renders.
- Project runs locally.

Acceptance criteria:

- `npm run dev` works.
- Home page renders without errors.
- Initial deployment path is documented.

### P0: Build Search Shell

Deliverables:

- `components/SearchShell.tsx`
- Search input.
- Main layout with list and map areas.
- Responsive layout.

Acceptance criteria:

- Search area is visible.
- Restaurant list area is visible.
- Map area is visible or reserved.
- Layout works on desktop and mobile.

### P0: Build Restaurant Cards

Deliverables:

- `components/RestaurantCard.tsx`
- Cards display rating, grade, Sano label, confidence, and explanation.

Acceptance criteria:

- Cards show why Sano is different from a normal restaurant app.
- No placeholder copy.
- Cards are clickable or clearly connected to profile navigation.

### P1: UI Polish

Deliverables:

- Spacing pass.
- Mobile pass.
- Hover/focus states.
- Empty states.

Acceptance criteria:

- App feels coherent and presentable.
- No text overlap.
- No obvious unfinished UI.

## Contributor B: Data And Scoring Lead

### P0: Define Types

Deliverables:

- `lib/types.ts`
- Restaurant, Inspection, Violation, TrustScore, and Alternative types.

Acceptance criteria:

- Components can import shared types.
- Field names are clear.
- Types support the MVP views.

### P0: Create Real-Data Seed

Deliverables:

- `data/sample-restaurants.json`
- `lib/mock-data.ts`

Acceptance criteria:

- Records are based on real NYC inspection structure where possible.
- Data contains at least 8 to 12 restaurants.
- At least 3 restaurants have rich inspection timelines.
- Fields match `lib/types.ts`.

### P0: Implement Scoring Helpers

Deliverables:

- `lib/scoring.ts`

Acceptance criteria:

- Functions compute or expose Inspection Reliability Score.
- Functions support trajectory labels.
- Logic is explainable.
- UI does not duplicate scoring formulas.

### P1: Add Ingestion Script

Deliverables:

- `scripts/ingest_nyc_dohmh.py`
- Documentation in `docs/DATA_PLAN.md`

Acceptance criteria:

- Script purpose is clear.
- Output shape is documented.
- Team can explain how official data enters the app.

## Contributor C: Profile, Timeline, And Presentation Lead

### P0: Build Restaurant Profile

Deliverables:

- `app/restaurants/[id]/page.tsx`
- `components/RestaurantProfile.tsx`

Acceptance criteria:

- User can open a profile.
- Profile displays rating, grade, Sano score, trajectory, confidence, and explanation.
- Profile includes disclaimer.

### P0: Build Trust Timeline

Deliverables:

- `components/TrustTimeline.tsx`

Acceptance criteria:

- Timeline shows inspection dates, scores, grades, critical markers, and trend.
- Timeline is understandable without long explanation.
- Timeline uses typed inspection data.

### P0: Build Methodology Page

Deliverables:

- `app/methodology/page.tsx`
- `components/MethodologyPanel.tsx`

Acceptance criteria:

- Page explains source data, scoring, confidence, limitations, and ethical language.
- No absolute safety claims.

### P1: Prepare Demo Script And QA

Deliverables:

- Updated `docs/DEMO_SCRIPT.md`
- Completed `docs/QUALITY_CHECKLIST.md`
- Backup screenshots if possible.

Acceptance criteria:

- Demo can be completed in under 5 minutes.
- Team can explain product, stack, data, and limitations.

## Cross-Team Tasks

### P0: Final Deployment

Owner: whoever controls Vercel access.

Acceptance criteria:

- App is deployed.
- Final URL is known.
- Demo path works on deployed app.

### P0: Final QA

Owner: all contributors.

Acceptance criteria:

- Desktop tested.
- Mobile tested.
- Main routes tested.
- Methodology reviewed.
- No placeholder text.
- No absolute safety claims.

