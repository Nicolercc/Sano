# ADR-002: Stack Decision

Status: Accepted  
Date: 2026-07-21

## Context

The app needs a polished frontend, clear data contracts, map support, explainable scoring, and fast deployment.

The team also needs a stack that is easy to divide across three contributors.

## Decision

Use:

- Next.js for the app framework.
- TypeScript for type safety.
- Tailwind CSS for styling.
- MapLibre for maps.
- React/SVG or Recharts for timeline visualization.
- Python for ingestion and scoring scripts.
- Supabase Postgres/PostGIS for database expansion.
- Vercel for deployment.

## Rationale

Next.js and Vercel are a fast deployment pair. TypeScript protects shared data contracts. Tailwind keeps styling consistent. Supabase supports real database work without requiring a custom backend server. Python is appropriate for data processing.

## Consequences

The team should avoid adding extra frontend frameworks or backend services unless a clear blocker requires it.

