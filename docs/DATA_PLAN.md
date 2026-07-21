# Data Plan

Sano should feel real because it is grounded in official inspection data.

The project should not rely on fake restaurant records as its long-term data strategy. For the one-week MVP, the safest and most credible path is a curated real-data seed: a stable subset of real official data prepared for the demo.

## Primary Official Source

NYC DOHMH Restaurant Inspection Results.

This source can provide:

- Restaurant identifiers
- Business names
- Addresses
- Boroughs
- ZIP codes
- Cuisine descriptions
- Inspection dates
- Inspection scores
- Grades
- Violation codes
- Violation descriptions
- Critical flags

## Why Use A Curated Seed

Live data dependencies are risky during a presentation:

- API downtime
- network failures
- rate limits
- schema surprises
- slow responses
- missing coordinates or metadata

A curated real-data seed lets the team:

1. Use official data.
2. Keep the demo stable.
3. Build the frontend immediately.
4. Explain the data pipeline clearly.
5. Later replace the seed with Supabase queries.

## Recommended Data Phases

### Phase 1: App-Ready Seed

Create `data/sample-restaurants.json`.

Each restaurant record should include:

- id
- name
- cuisine
- neighborhood
- borough
- address
- latitude
- longitude
- rating
- reviewCount
- grade
- inspectionReliabilityScore
- trajectory
- trustGap
- confidence
- explanation
- dataAsOf
- inspections
- alternatives

### Phase 2: Ingestion Script

Create `scripts/ingest_nyc_dohmh.py`.

Responsibilities:

- Load NYC inspection records.
- Filter to demo geography.
- Normalize fields.
- Group records by restaurant.
- Produce intermediate normalized output.

### Phase 3: Scoring Script

Create `scripts/score_restaurants.py`.

Responsibilities:

- Compute inspection reliability.
- Detect trajectory.
- Detect repeat patterns.
- Assign confidence.
- Write app-ready records.

### Phase 4: Supabase

If time allows, load app-ready records or normalized records into Supabase.

Recommended tables:

- `restaurants`
- `inspections`
- `violations`
- `trust_scores`
- `place_metadata`
- `match_records`

## Data Quality Rules

1. Do not invent official inspection results.
2. If demo metadata is manually enriched, document that clearly.
3. Keep derived fields explainable.
4. Use "data as of" dates.
5. Do not show high-confidence labels for low-confidence records.
6. Prefer fewer trustworthy records over many questionable records.

## Presentation Positioning

The correct explanation is:

Sano uses official inspection records and prepares them into an app-ready layer. The current demo uses a curated subset for reliability, and the architecture supports Supabase-backed data as the next step.

