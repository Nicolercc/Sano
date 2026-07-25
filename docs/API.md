# Sano API

The current demo uses a committed, curated official seed generated from NYC
DOHMH Restaurant Inspection Results. The API layer gives the frontend and future
clients a stable backend contract while keeping live external APIs out of the
presentation path.

## Endpoints

- `GET /api/health`: service status plus data-source summary.
- `GET /api/restaurants`: list restaurants from the active app-ready seed.
- `GET /api/restaurants?q=&cuisine=&trajectory=&confidence=&recentCriticalOnly=`: filtered restaurant list.
- `GET /api/restaurants/:id`: one restaurant profile record.

## Current Data Mode

`official-generated-seed` is the primary mode. It means:

- the committed app-ready records came from the NYC DOHMH Restaurant Inspection
  Results dataset through the local ingestion and scoring scripts;
- the extract is curated and offline for demo stability;
- the extract is not live synchronization and not comprehensive citywide
  coverage;
- Sano-derived scores are not official NYC ratings.

The repository keeps `synthetic-demo-seed` as a fallback mode for failure
containment only. The API response shape should remain stable when the backend
later moves from committed JSON to Supabase.

## Health Response

`GET /api/health` should return JSON similar to:

```json
{
  "status": "ok",
  "app": "sano",
  "data": {
    "mode": "official-generated-seed",
    "restaurantCount": 16,
    "inspectionCount": 57,
    "fallbackAvailable": true
  }
}
```

## Restaurant Metadata Availability

Official NYC DOHMH inspection records do not include consumer ratings, review
counts, price level, or popularity-derived trust gap. In
`official-generated-seed` mode, the public API returns those unavailable fields
as `null` and exposes explicit availability flags:

```json
{
  "rating": null,
  "reviewCount": null,
  "priceLevel": null,
  "trustGap": null,
  "metadataAvailability": {
    "popularity": false,
    "price": false,
    "trustGap": false
  }
}
```

This keeps the public API honest while the internal UI model remains stable for
the current demo.

## Demo Contract

Sano demonstrates:

- restaurant discovery
- inspection transparency
- derived inspection-history indicators
- methodology and limitations
- a stable API contract

Sano does not claim:

- real-time DOHMH synchronization
- comprehensive restaurant coverage
- absolute restaurant safety
- official consumer ratings
