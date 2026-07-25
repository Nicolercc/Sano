-- Phase 6 Lite: app-ready restaurant records.
--
-- This stores scored restaurant payloads generated from NYC DOHMH inspection
-- data. The Next.js app queries this table through Supabase REST and falls back
-- to committed JSON when Supabase is unavailable.

create table if not exists public.restaurant_records (
  id text primary key,
  name text not null,
  cuisine text,
  neighborhood text,
  borough text,
  grade text,
  trajectory text,
  confidence text,
  inspection_reliability_score integer,
  recent_critical boolean default false,
  inspection_count integer not null default 0,
  data_as_of date,
  search_text text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists restaurant_records_name_idx
  on public.restaurant_records (name);

create index if not exists restaurant_records_cuisine_idx
  on public.restaurant_records (cuisine);

create index if not exists restaurant_records_borough_idx
  on public.restaurant_records (borough);

create index if not exists restaurant_records_neighborhood_idx
  on public.restaurant_records (neighborhood);

create index if not exists restaurant_records_grade_idx
  on public.restaurant_records (grade);

create index if not exists restaurant_records_trajectory_idx
  on public.restaurant_records (trajectory);

create index if not exists restaurant_records_confidence_idx
  on public.restaurant_records (confidence);

create index if not exists restaurant_records_recent_critical_idx
  on public.restaurant_records (recent_critical);

create index if not exists restaurant_records_score_idx
  on public.restaurant_records (inspection_reliability_score desc);

create index if not exists restaurant_records_payload_gin_idx
  on public.restaurant_records using gin (payload);

