# Sano API

The Sunday demo uses a stable synthetic app-ready seed modeled on NYC DOHMH inspection fields. The API layer gives the frontend and future clients a backend contract while keeping live external APIs out of the presentation path.

## Endpoints

- `GET /api/health`: service status plus data-source summary.
- `GET /api/restaurants`: list restaurants from the app-ready seed.
- `GET /api/restaurants?q=&cuisine=&trajectory=&confidence=&recentCriticalOnly=`: filtered restaurant list.
- `GET /api/restaurants/:id`: one restaurant profile record.

## Current Data Mode

`synthetic-demo-seed` is intentionally stable for demo reliability. It is not an official NYC record extract and should not be presented as one. The next production step is to replace `lib/server/restaurants.ts` with a Supabase-backed repository populated by the ingestion/scoring scripts while keeping the API response shape stable.
