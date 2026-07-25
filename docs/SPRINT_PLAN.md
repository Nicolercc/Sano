# One-Week Sprint Plan

Team size: 3 contributors  
Timeline: 7 days  
Goal: deploy a polished Sano MVP

## Sprint Goal

Ship a working, deployed app that proves this thesis:

We are not building "a restaurant app." We are building one polished proof that inspection history contains useful context hidden by public grades.

## Phase 0: Before Coding

Duration: first few hours of Day 1

Decisions to confirm:

1. Stack: Next.js, TypeScript, Tailwind, MapLibre, Supabase, Python, Vercel.
2. MVP scope: search/list/map, profile, timeline, score panel, alternatives, methodology.
3. Data strategy: clearly disclosed synthetic demo seed first, then real official NYC inspection data prepared into a stable seed.
4. Branch workflow: no direct pushes to `main`.
5. File ownership: one owner per area.

Conflict prevention:

- Do not let everyone start coding before the scaffold is committed.
- Do not begin UI work until `lib/types.ts` has an initial shape.
- Do not introduce extra libraries without agreement.

Done when:

- The team agrees on the scope.
- The README and docs are committed.
- The first GitHub issues exist.

## Day 1: Scaffold And Deploy

Goal: create the technical foundation.

Tasks:

1. Create Next.js app with TypeScript and Tailwind.
2. Add expected folders.
3. Add initial `lib/types.ts`.
4. Add initial `data/sample-restaurants.json`.
5. Deploy a basic app to Vercel.
6. Confirm everyone can run the project locally.

Contributor focus:

- Contributor A: app scaffold and layout shell.
- Contributor B: data types and seed shape.
- Contributor C: profile/methodology wireframe and demo notes.

Conflict prevention:

- One person performs the initial scaffold.
- Everyone else pulls after the first commit.
- Shared data shape changes happen through one PR.

Done when:

- App runs locally.
- App deploys.
- Folder structure exists.
- First seed data renders somewhere.

## Day 2: Search And Cards

Goal: make the home page useful.

Tasks:

1. Build `SearchShell.tsx`.
2. Build `FilterBar.tsx`.
3. Build `RestaurantCard.tsx`.
4. Render list of restaurants.
5. Add basic filtering.
6. Add responsive layout.

Contributor focus:

- Contributor A: search shell, cards, filters.
- Contributor B: strengthen seed records and scoring fields.
- Contributor C: start timeline visual design and profile component.

Conflict prevention:

- Contributor A owns the home page.
- Contributor B does not rename fields without coordination.
- Contributor C works in separate profile/timeline files.

Done when:

- Home page shows restaurant cards.
- Cards show the Sano value, not just ratings.
- Filters are visible and at least partially functional.

## Day 3: Profile And Timeline

Goal: build the most important product moment.

Tasks:

1. Build restaurant profile route.
2. Build `RestaurantProfile.tsx`.
3. Build `SanoScorePanel.tsx`.
4. Build `TrustTimeline.tsx`.
5. Connect selected restaurant data.
6. Add plain-English explanations.

Contributor focus:

- Contributor A: polish home page integration.
- Contributor B: scoring helpers in `lib/scoring.ts`.
- Contributor C: profile, score panel, timeline.

Conflict prevention:

- Timeline consumes typed data.
- Scoring logic stays in `lib/scoring.ts`.
- Profile components should not redefine the data model.

Done when:

- A user can open a restaurant profile.
- The profile includes score, trajectory, confidence, and timeline.
- The timeline makes the product thesis obvious.

## Day 4: Map, Alternatives, Methodology

Goal: complete the core user journey.

Tasks:

1. Build `MapResults.tsx`.
2. Add restaurant pins or a credible map-like panel.
3. Build `Alternatives.tsx`.
4. Build methodology page.
5. Add disclaimers and source explanation.

Contributor focus:

- Contributor A: map/list integration.
- Contributor B: data source documentation and scoring clarity.
- Contributor C: methodology, alternatives, presentation wording.

Conflict prevention:

- Map work stays in `MapResults.tsx`.
- Methodology copy stays in methodology docs/components.
- Avoid restyling the whole app during integration.

Done when:

- User can move from search to profile to methodology.
- Alternatives appear on profiles.
- Methodology explains the product without overclaiming.

## Day 5: Data Credibility And Integration

Goal: make the project defensible.

Tasks:

1. Create or improve `scripts/ingest_nyc_dohmh.py`.
2. Create or improve `scripts/score_restaurants.py`.
3. Document the data pipeline.
4. Decide whether Supabase integration is feasible before final demo.
5. If Supabase is too risky, keep the clearly disclosed synthetic demo seed and explain the official-data replacement path.

Contributor focus:

- Contributor A: UI polish and responsive fixes.
- Contributor B: real-data pipeline and data plan.
- Contributor C: QA, copy review, demo story.

Conflict prevention:

- Do not change frontend data shape late unless necessary.
- Do not switch data sources unless the app stays working.
- Supabase is valuable but not worth breaking the demo.

Done when:

- The team can explain where the data comes from.
- The app has stable demo records.
- The data plan is documented.

## Day 6: QA And Polish

Goal: make the app presentation-ready.

Tasks:

1. Check desktop layout.
2. Check mobile layout.
3. Check routes and links.
4. Remove placeholder text.
5. Review legal/ethical wording.
6. Improve spacing, empty states, hover states, and loading states.
7. Practice demo script.

Contributor focus:

- Contributor A: visual polish.
- Contributor B: data accuracy and methodology support.
- Contributor C: demo script, quality checklist, screenshots.

Conflict prevention:

- Use small bug-fix PRs.
- No major architecture changes.
- No new dependencies unless required for a blocker.

Done when:

- The app is coherent on desktop and mobile.
- The demo path works start to finish.
- Presentation wording is clear.

## Day 7: Freeze And Present

Goal: stabilize and deliver.

Tasks:

1. Deploy final version.
2. Capture backup screenshots.
3. Confirm final demo path.
4. Confirm each contributor can explain their area.
5. Tag or identify the final demo commit.

Contributor focus:

- Contributor A: final visual pass.
- Contributor B: data/source explanation.
- Contributor C: presentation flow and backup assets.

Conflict prevention:

- No redesigns.
- No new libraries.
- No data model rewrites.
- Only fix showstopper bugs.

Done when:

- Final URL works.
- Demo script works.
- Backup screenshots exist.
- Team can explain product, stack, data, and tradeoffs.
