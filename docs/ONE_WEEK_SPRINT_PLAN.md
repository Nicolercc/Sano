# Sano One-Week Sprint Plan

Status: Working plan for build execution  
Team size: 3 contributors  
Timeline: 7 days  
Primary objective: ship a polished, presentable MVP

## North Star

We are not building "a restaurant app." We are building one polished proof that inspection history contains useful context hidden by public grades.

Sano should help a diner understand what a single posted restaurant grade compresses away: trajectory, volatility, repeat violations, inspection score history, and confidence in the underlying data.

## What We Are Selling

Sano is a consumer-facing restaurant discovery and inspection-history interpretation app.

The core insight is simple:

Most restaurant discovery products show popularity: ratings, reviews, cuisine, distance, price, photos, and sometimes the current public grade. Sano adds the missing interpretation layer: it explains whether the inspection history underneath that grade is stable, improving, volatile, or showing repeat patterns.

The product is not trying to scare diners or shame restaurants. It is trying to make public inspection data understandable in the moment when people are choosing where to eat.

### Presentation Message

When presenting Sano, the story should be:

1. Diners already use ratings and maps to choose restaurants.
2. Public inspection grades exist, but the posted grade is a compressed snapshot.
3. Two A-grade restaurants can have very different inspection histories.
4. Sano reveals the history underneath the snapshot.
5. The app explains every signal in plain language and shows the source data.

## Product Scope For This Week

The one-week MVP must prove the product thesis with a polished demo. It does not need every future feature.

### Must Ship

1. Search, map, and list view
   - Users can browse restaurants in one NYC demo geography.
   - Users can search by name, cuisine, or neighborhood.
   - Users can filter by cuisine, rating, trajectory, recent critical violations, and confidence.

2. Restaurant cards
   - Each card shows restaurant name, cuisine, neighborhood, public rating, review count, current grade, Sano label, confidence, and a one-sentence explanation.

3. Restaurant profile
   - Each restaurant has a detailed profile view.
   - The profile shows rating, grade, Inspection Reliability Score, Trust Gap, trajectory, confidence, and "data as of" date.

4. Inspection timeline
   - This is the hero visualization.
   - It must show multiple inspection cycles, raw scores, grades, critical violation markers, repeat pattern markers, and trend.

5. Alternatives
   - Show similar nearby restaurants with stronger inspection trajectories.
   - This should feel like a recommendation system, not a warning system.

6. Methodology page
   - Explain data sources, scoring formula, confidence rules, limitations, and disclaimers.
   - Make clear that inspection data reflects point-in-time official visits and is not a safety guarantee.

7. Realistic data layer
   - The demo should use real official NYC restaurant inspection data where possible.
   - A curated seed file may be used for speed and reliability, but it should represent real data structure and preferably real records.

### Should Ship If Time Allows

1. Supabase-backed restaurant records.
2. Python ingestion from NYC Open Data.
3. Scoring script that produces the app's restaurant summaries.
4. Manual match-audit notes for selected demo restaurants.
5. Basic deployment documentation.

### Do Not Build This Week

1. User login.
2. Saved lists.
3. Restaurant owner dashboard.
4. Nationwide expansion.
5. Machine learning.
6. Review scraping.
7. Payment or subscriptions.
8. Complex alert or recall integrations.

## Stack Decision

Use a stack that is modern, explainable, easy to deploy, and realistic for a one-week team project.

### Recommended Stack

- App framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- UI components: lightweight custom components, optionally shadcn/ui patterns
- Map: MapLibre GL JS or a React MapLibre wrapper
- Visualization: React components with SVG and/or Recharts
- Database: Supabase Postgres with PostGIS
- Data scripts: Python
- Deployment: Vercel
- Version control: GitHub with pull requests

### Why This Stack

Next.js gives the team a clear structure for pages, components, and API routes. TypeScript reduces confusion between contributors by making the data model explicit. Tailwind makes styling fast and consistent. Supabase gives the project a real database without requiring a custom backend server. Python is the right tool for data ingestion and scoring. Vercel is the fastest reliable deployment path for a Next.js app.

## Real Data Strategy

Sano should not feel like a fake database demo. The project should use real official data as early as possible while keeping the frontend unblocked.

### Data Source Priority

1. NYC DOHMH Restaurant Inspection Results
   - This is the primary source for inspections, grades, scores, dates, violations, and critical flags.

2. Optional place metadata
   - Ratings, review counts, cuisine, coordinates, and images can come from a place metadata source if API access is available and terms allow it.
   - If external API access is not ready, use a curated metadata file for the demo.

3. App-generated derived fields
   - Inspection Reliability Score
   - Trajectory
   - Trust Gap
   - Confidence
   - Plain-English explanation

### Practical One-Week Approach

Use a real-data seed strategy:

1. Pull or download a subset of NYC inspection records.
2. Select one demo geography with enough restaurants and inspection history.
3. Normalize the records into the app's expected shape.
4. Store the curated subset in `data/sample-restaurants.json`.
5. Build the frontend against that stable seed file.
6. Add Supabase ingestion if time allows.

This is not "fake data." It is a curated real-data subset used to make the demo reliable. The app can still be designed so that the seed file can later be replaced by Supabase queries.

### Why Not Depend On Live APIs For Every Page Load

Live APIs create unnecessary demo risk: rate limits, API keys, slow responses, schema surprises, and network failures. The app should not break during a presentation because an external service is unavailable.

Best practice is to ingest official data into our own controlled data layer, score it, then serve stable app-ready records.

## Repository Structure

The app should use this structure:

```txt
sano/
  app/
    page.tsx
    restaurants/[id]/page.tsx
    methodology/page.tsx
    api/
  components/
    SearchShell.tsx
    FilterBar.tsx
    MapResults.tsx
    RestaurantCard.tsx
    RestaurantProfile.tsx
    TrustTimeline.tsx
    SanoScorePanel.tsx
    Alternatives.tsx
    MethodologyPanel.tsx
  lib/
    scoring.ts
    mock-data.ts
    types.ts
    format.ts
  data/
    sample-restaurants.json
  scripts/
    ingest_nyc_dohmh.py
    score_restaurants.py
  docs/
    PRD.md
    ARCHITECTURE.md
    CONTRIBUTING.md
    ADR-001-scope.md
    ADR-002-stack.md
```

## What Each Part Does

### `app/`

The `app/` directory contains the pages and routes.

- `app/page.tsx`: main search, map, and list experience.
- `app/restaurants/[id]/page.tsx`: restaurant profile page.
- `app/methodology/page.tsx`: methodology and limitations page.
- `app/api/`: optional API routes if the app needs server-side endpoints.

Best practice: pages should compose components, not contain large amounts of business logic.

### `components/`

The `components/` directory contains reusable UI building blocks.

- `SearchShell.tsx`: page layout for search, results, map, and selected restaurant state.
- `FilterBar.tsx`: cuisine, distance, rating, trajectory, critical violations, and confidence filters.
- `MapResults.tsx`: map display and restaurant pins.
- `RestaurantCard.tsx`: compact result card.
- `RestaurantProfile.tsx`: detailed selected restaurant view.
- `TrustTimeline.tsx`: inspection history visualization.
- `SanoScorePanel.tsx`: Inspection Reliability Score, Trust Gap, trajectory, and confidence.
- `Alternatives.tsx`: nearby alternatives with stronger inspection history.
- `MethodologyPanel.tsx`: reusable methodology explanation content.

Best practice: components should accept typed props and avoid owning unrelated data-fetching logic.

### `lib/`

The `lib/` directory contains shared logic and data definitions.

- `scoring.ts`: scoring formulas, trajectory rules, trust gap logic, and label rules.
- `mock-data.ts`: temporary app-ready data exports while the data layer is being built.
- `types.ts`: shared TypeScript types for Restaurant, Inspection, Violation, TrustScore, and related objects.
- `format.ts`: formatting helpers for scores, dates, labels, and display text.

Best practice: shared logic belongs here so the UI does not duplicate formulas or labels.

### `data/`

The `data/` directory contains stable seed data used for development and demo reliability.

- `sample-restaurants.json`: curated app-ready restaurant records.

Best practice: this file should be treated as a contract between data and frontend work. Changes to its shape must be coordinated.

### `scripts/`

The `scripts/` directory contains data preparation tools.

- `ingest_nyc_dohmh.py`: pulls or loads NYC DOHMH inspection data.
- `score_restaurants.py`: computes Sano fields from normalized inspection data.

Best practice: scripts should be repeatable and documented. They should produce predictable output that the app can consume.

### `docs/`

The `docs/` directory contains decisions and project alignment.

- `PRD.md`: product requirements.
- `ARCHITECTURE.md`: app architecture and data flow.
- `CONTRIBUTING.md`: contribution rules and workflow.
- `ADR-001-scope.md`: scope decision for the one-week MVP.
- `ADR-002-stack.md`: stack decision and rationale.

Best practice: decisions that affect the team should be written down once and referenced instead of being re-argued repeatedly.

## Team Operating Model

The team has three contributors. The safest structure is to assign ownership by area so people are not constantly editing the same files.

### Contributor A: App and Design Lead

Primary responsibility:

- Main app shell
- Search page
- Layout
- Styling system
- Restaurant cards
- Filter bar

Primary files:

- `app/page.tsx`
- `components/SearchShell.tsx`
- `components/FilterBar.tsx`
- `components/RestaurantCard.tsx`

Avoid editing unless coordinated:

- `lib/types.ts`
- `data/sample-restaurants.json`
- `components/TrustTimeline.tsx`

### Contributor B: Data and Scoring Lead

Primary responsibility:

- Data model
- Sample data
- Scoring logic
- NYC DOHMH ingestion script
- Trajectory and confidence rules

Primary files:

- `lib/types.ts`
- `lib/scoring.ts`
- `lib/mock-data.ts`
- `data/sample-restaurants.json`
- `scripts/ingest_nyc_dohmh.py`
- `scripts/score_restaurants.py`

Avoid editing unless coordinated:

- UI component styling
- Page layout files

### Contributor C: Profile, Visualization, and Docs Lead

Primary responsibility:

- Restaurant profile
- Inspection timeline
- Sano score display
- Alternatives
- Methodology content
- Demo explanation

Primary files:

- `app/restaurants/[id]/page.tsx`
- `app/methodology/page.tsx`
- `components/RestaurantProfile.tsx`
- `components/TrustTimeline.tsx`
- `components/SanoScorePanel.tsx`
- `components/Alternatives.tsx`
- `components/MethodologyPanel.tsx`
- `docs/`

Avoid editing unless coordinated:

- Data ingestion scripts
- Main search layout

## Conflict Avoidance Rules

These are engineering best practices for a fast team project.

1. Do not push directly to `main`.
   - All work should happen on feature branches.

2. Keep branches small and focused.
   - A branch should have one clear purpose.
   - Large branches are harder to review and more likely to conflict.

3. Use area-based branch names.
   - `feature/app-shell`
   - `feature/data-scoring`
   - `feature/profile-timeline`
   - `feature/methodology`
   - `fix/mobile-layout`

4. Avoid multiple people editing the same file at the same time.
   - If a shared file must change, say so before editing it.
   - The highest-conflict files are `lib/types.ts`, `data/sample-restaurants.json`, global CSS, and main layout files.

5. Treat `lib/types.ts` as a team contract.
   - If the data shape changes, all affected contributors need to know.

6. Treat `data/sample-restaurants.json` as a stable interface.
   - Add fields carefully.
   - Do not rename fields without updating every component that uses them.

7. Merge early and often.
   - A small working PR today is better than a large conflicting PR tomorrow.

8. Run the app before opening a PR.
   - The app should build and the changed screen should be manually checked.

9. Use clear PR descriptions.
   - Include what changed, what files are affected, and how it was checked.

10. Do not add new libraries without team agreement.
   - Each new dependency increases setup and deployment risk.

11. Keep copy legally careful.
   - Do not use absolute safety language such as "safe," "unsafe," "dangerous," or "will make you sick."
   - Use inspection-history language such as "volatile history," "repeat pattern," "improving," and "limited data."

12. Prefer additive changes.
   - Add a component or helper rather than rewriting another contributor's work without discussion.

## LLM Use Guidelines

Contributors may use LLMs, but LLMs should follow the project's architecture and scope.

When asking an LLM for help, include this context:

```txt
We are building Sano, a one-week Next.js + TypeScript capstone app. Sano is not a generic restaurant app. It is a polished proof that inspection history contains useful context hidden by public grades. Follow the existing file ownership, avoid changing shared types or sample data unless requested, and do not use absolute safety claims. Build small components that fit the current architecture.
```

Best practices for LLM-assisted work:

1. Ask for one component or one function at a time.
2. Paste the relevant TypeScript types into the prompt.
3. Ask the LLM to avoid changing unrelated files.
4. Review every generated line before committing.
5. Do not accept invented APIs, invented dataset fields, or unsupported claims.
6. Keep generated copy aligned with the methodology and disclaimers.

## One-Week Sprint Plan

### Day 1: Scope, Stack, Repo Setup

Goal: create the project foundation and prevent confusion.

Tasks:

1. Create the Next.js app with TypeScript and Tailwind.
2. Add the repository structure.
3. Add `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/CONTRIBUTING.md`, `docs/ADR-001-scope.md`, and `docs/ADR-002-stack.md`.
4. Deploy the empty app to Vercel.
5. Create initial GitHub issues for each contributor area.
6. Confirm the data schema in `lib/types.ts`.

Conflict avoidance:

- Only one person should create the initial scaffold.
- After scaffold creation, every contributor should pull the latest `main`.
- No one should start UI work until the first scaffold is committed.
- The team should agree on the initial `Restaurant` and `Inspection` types before building components.

Definition of done:

- The app runs locally.
- The app deploys to Vercel.
- The repo has the expected folder structure.
- The team has a written scope and stack decision.

### Day 2: Data Contract and Main Search UI

Goal: make the app feel real with stable data and a working search/list shell.

Tasks:

1. Create `lib/types.ts`.
2. Create initial `data/sample-restaurants.json` from curated real or realistic NYC inspection records.
3. Create `lib/mock-data.ts` to expose app-ready records.
4. Build `SearchShell.tsx`.
5. Build `RestaurantCard.tsx`.
6. Build `FilterBar.tsx`.
7. Render restaurant cards on `app/page.tsx`.

Conflict avoidance:

- Contributor B owns the data shape.
- Contributor A can use the data but should not rename fields.
- If a UI component needs a new field, add it through a coordinated update to `lib/types.ts`.
- Keep map work separate until the list experience works.

Definition of done:

- The home page shows real restaurant-style records.
- Filters can be visually present even if not all filter logic is finished.
- Cards clearly show Sano's differentiated value.

### Day 3: Scoring, Timeline, and Profile

Goal: build the core Sano product logic and hero visualization.

Tasks:

1. Implement `lib/scoring.ts`.
2. Add Inspection Reliability Score, trajectory, confidence, and explanation fields.
3. Build `SanoScorePanel.tsx`.
4. Build `TrustTimeline.tsx`.
5. Build `RestaurantProfile.tsx`.
6. Build `app/restaurants/[id]/page.tsx`.

Conflict avoidance:

- Contributor B owns scoring functions.
- Contributor C owns timeline and profile display.
- The timeline should consume typed data instead of inventing its own local data shape.
- Avoid changing card layout while profile work is happening unless coordinated.

Definition of done:

- A user can open a restaurant profile.
- The profile explains the inspection story in plain language.
- The timeline makes the product thesis obvious.

### Day 4: Map, Alternatives, and Methodology

Goal: connect the discovery experience and add trust-building context.

Tasks:

1. Build `MapResults.tsx`.
2. Add restaurant pins or a map-like geographic display.
3. Build `Alternatives.tsx`.
4. Build `MethodologyPanel.tsx`.
5. Build `app/methodology/page.tsx`.
6. Add disclaimers and source explanations.

Conflict avoidance:

- Map work should stay inside `MapResults.tsx`.
- Methodology copy should stay inside methodology files.
- Avoid broad styling rewrites while map/profile components are being integrated.

Definition of done:

- Home page includes list and map sections.
- Profile page includes alternatives.
- Methodology page explains how Sano works and what it does not claim.

### Day 5: Real Data Pipeline And Supabase Option

Goal: make the demo more credible by connecting the app to official data preparation.

Tasks:

1. Create or improve `scripts/ingest_nyc_dohmh.py`.
2. Create or improve `scripts/score_restaurants.py`.
3. Document how the seed data was produced.
4. If time allows, create Supabase schema and load the curated demo data.
5. If Supabase is not ready, keep the curated seed file as the app source and document the next migration step.

Conflict avoidance:

- Do not switch the frontend data source during active UI work unless the current app remains working.
- If Supabase is introduced, keep the same TypeScript data shape.
- The app should not depend on live external APIs during the final presentation.

Definition of done:

- The data story is credible.
- The app has stable demo data.
- The team can explain where the data comes from.

### Day 6: Integration, QA, and Polish

Goal: make the app feel presentation-ready.

Tasks:

1. Test desktop layout.
2. Test mobile layout.
3. Check all links and routes.
4. Check all copy for legal/ethical wording.
5. Remove placeholder text.
6. Improve spacing, loading states, empty states, and hover states.
7. Write the demo script.

Conflict avoidance:

- One person should coordinate final design polish.
- Avoid major architectural changes.
- Fix bugs in small PRs.
- Do not introduce new dependencies unless absolutely necessary.

Definition of done:

- The app looks coherent.
- The demo path works from start to finish.
- The team can present the product in under five minutes.

### Day 7: Final Deploy And Presentation

Goal: freeze the demo and prepare the final story.

Tasks:

1. Deploy final version to Vercel.
2. Record or capture backup screenshots.
3. Confirm demo script.
4. Confirm each contributor can explain their area.
5. Tag or note the final demo commit.
6. Avoid risky changes unless they fix a showstopper bug.

Conflict avoidance:

- Treat Day 7 as stabilization day.
- No redesigns.
- No dependency changes.
- No data model rewrites.
- Only fix critical issues.

Definition of done:

- Final app URL works.
- Demo script is ready.
- Backup screenshots exist.
- The team understands the scope, stack, and product thesis.

## Suggested Work For Less Technical Contributors

Not every contribution needs to be deep coding. Useful, low-risk contributions include:

1. Create realistic restaurant content for the demo seed file.
   - Restaurant names, cuisine categories, neighborhoods, short explanations, and alternative recommendations.
   - Must follow the existing data shape.

2. Review the methodology page for clarity.
   - The goal is to make the product understandable without overstating claims.

3. Test the app like a diner.
   - Search, click restaurants, read labels, check whether the timeline makes sense.

4. Collect source links.
   - NYC DOHMH dataset link.
   - NYC restaurant grading explanation.
   - Any official documentation used in the methodology.

5. Prepare presentation materials.
   - Problem slide.
   - Product walkthrough script.
   - Architecture slide.
   - Data and ethics slide.

6. Help with visual QA.
   - Check mobile screenshots.
   - Check spacing and readability.
   - Check that no text overlaps.
   - Check that no page looks unfinished.

Best practice: low-risk work should be assigned with clear files and clear acceptance criteria. This lets every contributor help without accidentally breaking the app.

## Demo Script

The final presentation should follow this flow:

1. Start on the search page.
2. Search or filter for a familiar cuisine.
3. Point out that several restaurants have strong ratings and current A grades.
4. Select a restaurant with a volatile inspection history.
5. Open the profile.
6. Explain the Inspection Reliability Score and plain-English driver.
7. Show the timeline.
8. Explain that the timeline reveals what the grade snapshot hides.
9. Show alternatives with stronger inspection trajectories.
10. Open the methodology page.
11. End by restating that Sano interprets public inspection history rather than making absolute safety claims.

## Acceptance Criteria

The MVP is complete when:

1. A user can browse restaurant results.
2. A user can open a restaurant profile.
3. The profile has a clear inspection timeline.
4. The app shows Sano-specific labels and explanations.
5. The app includes alternatives.
6. The app includes methodology and limitations.
7. The app uses real official data or a curated real-data seed.
8. The app avoids absolute safety claims.
9. The app works on mobile and desktop.
10. The app is deployed.

## Final Engineering Principle

When uncertain, choose the option that makes the demo clearer, the code easier to review, and the product claim more defensible.

