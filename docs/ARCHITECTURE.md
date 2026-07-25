# Architecture

Sano is a Next.js application with a typed frontend, app-ready data layer, explainable scoring logic, and a deployment path optimized for a one-week team project.

## Architectural Principle

The app should keep product logic, display logic, and data preparation separate.

This matters because the team is small and the schedule is short. Clear boundaries reduce merge conflicts and make it easier for contributors to work independently.

## High-Level Flow

```txt
NYC DOHMH inspection data
        |
        v
Python ingestion script
        |
        v
Normalized restaurant and inspection records
        |
        v
Scoring script
        |
        v
App-ready seed JSON or Supabase tables
        |
        v
Next.js app
        |
        v
Search, map, cards, profile, timeline, methodology
```

## Frontend Architecture

### Pages

- `app/page.tsx`: search, map, and restaurant list.
- `app/restaurants/[id]/page.tsx`: restaurant profile.
- `app/methodology/page.tsx`: methodology and limitations.

Pages should compose components. They should not contain large scoring formulas, large mock records, or complex formatting logic.

### Components

- `SearchShell.tsx`: owns the search page layout and selected state.
- `FilterBar.tsx`: owns filter controls.
- `MapResults.tsx`: owns map display.
- `RestaurantCard.tsx`: owns result-card UI.
- `RestaurantProfile.tsx`: owns profile layout.
- `TrustTimeline.tsx`: owns inspection timeline visualization.
- `SanoScorePanel.tsx`: owns score, trust gap, trajectory, and confidence display.
- `Alternatives.tsx`: owns comparable recommendations.
- `MethodologyPanel.tsx`: owns reusable methodology content.

### Shared Logic

- `lib/types.ts`: shared TypeScript contracts.
- `lib/scoring.ts`: scoring and label logic.
- `lib/mock-data.ts`: app-ready data export while database integration is being finalized.
- `lib/format.ts`: formatting helpers.

## Data Architecture

### Phase 1: Curated Real-Data Seed

The app currently starts with a stable synthetic JSON seed modeled on official inspection fields. The repository boundary should make it straightforward to replace that seed with real official inspection data.

This makes the frontend reliable while still keeping the demo credible.

### Phase 2: Supabase

If time allows, load the curated data into Supabase Postgres.

Recommended tables:

- `restaurants`
- `inspections`
- `violations`
- `place_metadata`
- `match_records`
- `trust_scores`

### Phase 3: Automated Refresh

After the demo, add scheduled ingestion and scoring.

This is not required for the one-week MVP unless the team finishes early.

## Scoring Architecture

The scoring model should be explainable and rules-based.

Recommended fields:

- `inspectionReliabilityScore`
- `trajectory`
- `trustGap`
- `confidence`
- `explanation`
- `dataAsOf`

The UI should display derived labels only when enough history and confidence exist.

## Deployment Architecture

Use Vercel for the Next.js app.

Use Supabase for persistent data if database integration is completed.

Environment variables should be documented in `.env.example` once the app is scaffolded.

## Risk Controls

1. Do not depend on live external APIs during final presentation.
2. Keep sample data stable.
3. Keep derived claims explainable.
4. Keep shared types coordinated.
5. Prefer small pull requests.
