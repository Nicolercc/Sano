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

### Phase 5: Place Metadata Enrichment

Use Google Places as the first enrichment provider for consumer popularity
metadata.

Why Google first:

- It can provide rating, user rating count, price level, Google Maps URL, and a
  small bounded set of review data for matched places.
- It matches the user expectation that restaurant discovery commonly includes
  Google review context.
- It is cleaner for this product than scraping and safer than inventing
  metadata.

Implementation:

- `data/place-metadata.json` stores reviewed enrichment records keyed by Sano
  restaurant ID.
- `scripts/enrich_google_places.py` prepares metadata using the Places API when
  `GOOGLE_PLACES_API_KEY` is available.
- The repository layer merges metadata into official records.
- The public API exposes metadata availability flags so unmatched restaurants
  remain honest.

Run:

```bash
npm run enrich:google:dry-run
GOOGLE_PLACES_API_KEY=... npm run enrich:google
npm run check
```

Status: scaffolded. Requires a Google Places API key before real metadata can
be generated.

Yelp remains a viable later provider for rating, review count, price, and up to
three review excerpts, but it should be added only after provider attribution
and matching rules are reviewed.

### Phase 6: Supabase

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
