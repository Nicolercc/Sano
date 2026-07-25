# Sano API

The Sunday demo uses a stable app-ready seed derived from NYC DOHMH inspection fields. The API layer gives the frontend and future clients a backend contract while keeping live external APIs out of the presentation path.

## Endpoints

- `GET /api/health`: service status plus data-source summary.
- `GET /api/restaurants`: list restaurants from the app-ready seed.
- `GET /api/restaurants?q=&cuisine=&trajectory=&confidence=&recentCriticalOnly=`: filtered restaurant list.
- `GET /api/restaurants/:id`: one restaurant profile record.

## Current Data Mode

`curated-real-data-seed` is intentionally stable for demo reliability. The next production step is to replace `lib/server/restaurants.ts` with a Supabase-backed repository while keeping the API response shape stable.
