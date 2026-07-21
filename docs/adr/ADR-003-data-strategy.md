# ADR-003: Real-Data Seed Strategy

Status: Accepted  
Date: 2026-07-21

## Context

Sano needs credible data. A fully live API-dependent app would be fragile during a one-week build and risky during presentation.

The product should not feel like fake data, but the frontend needs stable records to build against.

## Decision

Use a curated real-data seed for the MVP.

The seed should be derived from official NYC DOHMH inspection records wherever possible. The frontend will use `data/sample-restaurants.json` or a typed export based on that file. If time allows, the same data shape can be loaded into Supabase.

## Rationale

This gives the team:

- credible official data
- stable demo behavior
- predictable development
- a clean path to database-backed data

## Consequences

The team must clearly distinguish official source fields from manually enriched demo metadata and derived Sano scores.

