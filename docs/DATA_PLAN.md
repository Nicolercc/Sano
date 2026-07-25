# Data Plan

Sano should feel credible because it uses official inspection history carefully
and distinguishes official source fields from Sano-derived context.

The current app uses a committed, curated official seed generated from NYC
DOHMH Restaurant Inspection Results. The synthetic seed remains in the
repository only as a controlled fallback if the official seed cannot be loaded.

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

A curated seed lets the team:

1. Demonstrate the product without live data risk.
2. Keep the demo stable.
3. Commit a reviewable, app-ready official extract.
4. Explain the data pipeline clearly.
5. Later replace committed JSON with Supabase queries.

## Recommended Data Phases

### Phase 1: Synthetic App-Ready Seed

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
- rating, only when a separate popularity source exists
- reviewCount, only when a separate popularity source exists
- grade
- inspectionReliabilityScore
- trajectory
- trustGap
- confidence
- explanation
- dataAsOf
- inspections
- alternatives

Status: complete as fallback data.

### Phase 2: Ingestion Script

Create `scripts/ingest_nyc_dohmh.py`.

Responsibilities:

- Load NYC inspection records.
- Filter to demo geography.
- Normalize fields.
- Group records by restaurant.
- Produce intermediate normalized output.

Status: complete for a committed offline extract.

### Phase 3: Scoring Script

Create `scripts/score_restaurants.py`.

Responsibilities:

- Compute inspection reliability.
- Detect trajectory.
- Detect repeat patterns.
- Assign confidence.
- Write app-ready records.

Status: complete for `data/official-restaurants.json` and
`data/official-provenance.json`.

### Phase 4: Validation

Create `scripts/validate_restaurant_seed.py`.

Responsibilities:

- Validate official and synthetic app-ready seed shape.
- Prevent official mode from carrying fake popularity metadata.
- Check basic coordinates, dates, confidence labels, and source notes.

Status: complete.

### Phase 5: Supabase

If time allows, load app-ready records or normalized records into Supabase.

Recommended tables:

- `restaurants`
- `inspections`
- `violations`
- `trust_scores`
- `place_metadata`
- `match_records`

## Data Quality Rules

1. Do not present invented or synthetic inspection results as official facts.
2. If demo metadata is manually enriched, document that clearly.
3. Keep derived fields explainable.
4. Use "data as of" dates.
5. Do not show high-confidence labels for low-confidence records.
6. Prefer fewer trustworthy records over many questionable records.
7. Return unavailable public API metadata as `null` with explicit availability
   flags instead of encoding absence as fake-looking zeroes.

## Presentation Positioning

The correct explanation for the current demo is:

Sano demonstrates how public NYC DOHMH inspection-history records can be
prepared into a consumer-friendly discovery layer. The current demo uses a
curated offline official extract for stability. It is not live synchronization,
not comprehensive citywide coverage, and not an official NYC rating.
