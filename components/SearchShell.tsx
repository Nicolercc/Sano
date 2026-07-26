"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FilterBar, { hasActiveFilters } from "@/components/FilterBar";
import MapResults from "@/components/MapResults";
import RestaurantCard from "@/components/RestaurantCard";
import type { Restaurant, RestaurantFilters } from "@/lib/types";

type SearchShellProps = {
  restaurants: Restaurant[];
  dataSummary: {
    mode: string;
    restaurantCount: number;
    inspectionCount: number;
    dataAsOf: string | null;
  };
};

const defaultFilters: RestaurantFilters = {
  query: "",
  cuisine: "all",
  trajectory: "all",
  confidence: "all",
  recentCriticalOnly: false
};

const INITIAL_VISIBLE_COUNT = 12;
const VISIBLE_INCREMENT = 12;
const API_RESULT_LIMIT = 80;

function activeFilterSummary(filters: RestaurantFilters) {
  const parts: string[] = [];

  if (filters.query.trim()) {
    parts.push(`“${filters.query.trim()}”`);
  }
  if (filters.cuisine !== "all") {
    parts.push(filters.cuisine);
  }
  if (filters.trajectory !== "all") {
    parts.push(`${filters.trajectory} trajectory`);
  }
  if (filters.confidence !== "all") {
    parts.push(`${filters.confidence} confidence`);
  }
  if (filters.recentCriticalOnly) {
    parts.push("recent criticals only");
  }

  return parts;
}

export default function SearchShell({
  restaurants,
  dataSummary
}: SearchShellProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState(restaurants);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(
    restaurants[0] ?? null
  );

  const cuisines = useMemo(
    () => Array.from(new Set(restaurants.map((restaurant) => restaurant.cuisine))).sort(),
    [restaurants]
  );

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      limit: String(API_RESULT_LIMIT)
    });

    if (filters.query.trim()) {
      params.set("q", filters.query.trim());
    }
    if (filters.cuisine !== "all") {
      params.set("cuisine", filters.cuisine);
    }
    if (filters.trajectory !== "all") {
      params.set("trajectory", filters.trajectory);
    }
    if (filters.confidence !== "all") {
      params.set("confidence", filters.confidence);
    }
    if (filters.recentCriticalOnly) {
      params.set("recentCriticalOnly", "true");
    }

    setLoading(true);
    setLoadError(false);
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    fetch(`/api/restaurants?${params.toString()}`, {
      headers: { accept: "application/json" },
      signal: controller.signal
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Restaurant search failed: ${response.status}`);
        }
        return response.json();
      })
      .then((payload: { restaurants?: Restaurant[] }) => {
        const nextResults = Array.isArray(payload.restaurants)
          ? payload.restaurants
          : [];
        setResults(nextResults);
        setSelectedRestaurant((current) => {
          if (nextResults.some((restaurant) => restaurant.id === current?.id)) {
            return current;
          }
          return nextResults[0] ?? null;
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setLoadError(true);
          setResults([]);
          setSelectedRestaurant(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters]);

  const selectedInResults =
    results.find((restaurant) => restaurant.id === selectedRestaurant?.id) ??
    results[0] ??
    null;

  const filtersActive = hasActiveFilters(filters);
  const filterParts = activeFilterSummary(filters);
  const visibleRestaurants = results.slice(0, visibleCount);
  const hiddenResultCount = Math.max(results.length - visibleRestaurants.length, 0);
  const zipSearchActive = /^\d{5}$/.test(filters.query.trim());

  const clearFilters = () => {
    setFilters(defaultFilters);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  return (
    <main className="min-h-screen bg-oat text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <nav className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="font-serif text-[2.45rem] font-black leading-none tracking-normal text-ink sm:text-5xl"
            >
              Sano
            </Link>
            <p className="mt-3 text-2xl font-black leading-tight text-ink sm:text-4xl">
              Find NYC restaurants by inspection history — not vibes alone.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65 sm:text-base">
              Sano turns public NYC DOHMH inspection records into a searchable
              discovery layer. Search by restaurant, cuisine, borough, or ZIP code;
              popularity appears only when we have a matched public source.
            </p>
            <div className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-oat px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
                  Live data mode
                </p>
                <p className="mt-1 font-black text-ink">
                  {dataSummary.mode === "supabase-app-records"
                    ? "Supabase"
                    : "Official fallback"}
                </p>
              </div>
              <div className="rounded-lg bg-oat px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
                  Restaurants
                </p>
                <p className="mt-1 font-black text-ink">
                  {dataSummary.restaurantCount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-oat px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
                  Inspections
                </p>
                <p className="mt-1 font-black text-ink">
                  {dataSummary.inspectionCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/methodology"
            className="inline-flex min-h-10 items-center rounded-md border border-ink/15 bg-white/70 px-4 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Methodology
          </Link>
        </nav>

        <FilterBar
          filters={filters}
          cuisines={cuisines}
          resultCount={results.length}
          onChange={setFilters}
          onClear={clearFilters}
        />

        <MapResults
          restaurants={results}
          selectedRestaurant={selectedInResults}
          onSelect={setSelectedRestaurant}
        />

        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-ink">
                Search results
              </h1>
              <p className="mt-1 text-sm text-ink/55">
                Showing a focused slice first. Use search or filters to narrow the
                full Supabase-backed dataset.
              </p>
            </div>
            <span className="text-sm font-semibold text-ink/55">
              {loading ? "Searching…" : `${results.length} shown`}
            </span>
          </div>

          {loadError ? (
            <div className="rounded-lg border border-coral/30 bg-white p-8 shadow-sm">
              <p className="text-lg font-bold text-ink">
                Restaurant data is temporarily unavailable
              </p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink/65">
                The search API did not respond cleanly. Please try again or clear
                filters.
              </p>
            </div>
          ) : results.length ? (
            <div className="flex flex-col gap-3">
              {visibleRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  selected={selectedInResults?.id === restaurant.id}
                  onSelect={setSelectedRestaurant}
                />
              ))}
              {hiddenResultCount > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((current) => current + VISIBLE_INCREMENT)
                  }
                  className="mx-auto mt-2 inline-flex min-h-11 items-center rounded-md border border-ink/15 bg-white px-5 text-sm font-bold text-ink shadow-sm transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                >
                  Show {Math.min(VISIBLE_INCREMENT, hiddenResultCount)} more
                </button>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-ink/10 bg-white p-8 shadow-sm">
              <p className="text-lg font-bold text-ink">
                No restaurants match this search
              </p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink/65">
                {filtersActive ? (
                  <>
                    Nothing in the current Supabase-backed extract fits
                    {filterParts.length ? (
                      <>
                        :{" "}
                        <span className="font-semibold text-ink/80">
                          {filterParts.join(" · ")}
                        </span>
                      </>
                    ) : null}
                    . {zipSearchActive
                      ? "This ZIP may not be represented in the current curated 1,000-record load yet. Try a nearby ZIP, borough, cuisine, or clear filters."
                      : "Try a ZIP code, borough, cuisine, or clear filters."}
                  </>
                ) : (
                  <>
                    No restaurant records are available from the configured demo
                    extract right now. Check the data connection, then try again.
                  </>
                )}
              </p>
              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex min-h-10 items-center rounded-md border border-ink/15 bg-oat px-4 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
